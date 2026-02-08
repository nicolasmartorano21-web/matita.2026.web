
import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Sale, Coupon, User } from '../types';
import { ADMIN_PASSWORD, LOGO_URL, formatPrice, AVAILABLE_COLORS } from '../constants'; // NUEVO: Import AVAILABLE_COLORS
import { database } from '../lib/database';

interface AdminPanelProps {
  onClose: () => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  products: Product[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onAddProduct, onUpdateProduct, onDeleteProduct, products }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales' | 'members' | 'coupons' | 'suggestions'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localInventory, setLocalInventory] = useState<Product[]>(products);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<string | number>('');
  const [editingPoints, setEditingPoints] = useState<{[key: string]: number}>({});

  useEffect(() => {
    setLocalInventory(products);
  }, [products]);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [s, sug, c, m] = await Promise.all([
        database.getAllSales(),
        database.getAllSuggestions(),
        database.getAllCoupons(),
        database.getAllProfiles()
      ]);
      setSales(s);
      setSuggestions(sug);
      setCoupons(c);
      setMembers(m);
    } catch (err) {
      console.error("Error al refrescar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else alert('Clave incorrecta, fiera.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Matita_web');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dllm8ggob/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        setEditingProduct(prev => ({ 
          ...prev, 
          imageUrl: optimizedUrl,
          isVideo: file.type.startsWith('video/')
        }));
      }
    } catch (err) {
      alert("Error en la subida.");
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVO: Funciones para manejo de colores y stock por color
  const toggleColorSelection = (color: string) => {
    const current = { ...(editingProduct?.colorsStock || {}) };
    if (current[color] !== undefined) {
      delete current[color];
    } else {
      current[color] = 1; // Stock inicial por defecto
    }
    setEditingProduct(prev => ({ ...prev, colorsStock: current }));
  };

  const updateIndividualColorStock = (color: string, value: number) => {
    const current = { ...(editingProduct?.colorsStock || {}) };
    current[color] = Math.max(0, value);
    setEditingProduct(prev => ({ ...prev, colorsStock: current }));
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || editingProduct.price === undefined || !editingProduct.category) return alert('Faltan datos (Nombre, Precio o Categoría).');
    setIsLoading(true);
    try {
      // NUEVO: El stock total es la suma de los stocks por color si existen
      const finalStock = editingProduct.colorsStock 
        ? Object.values(editingProduct.colorsStock).reduce((a, b) => a + (b || 0), 0)
        : Number(editingProduct.stock || 0);

      const productData: Product = {
        id: editingProduct.id || `prod_${Date.now()}`,
        name: editingProduct.name,
        description: editingProduct.description || '',
        curatorNote: editingProduct.curatorNote || '',
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        category: editingProduct.category as Category,
        imageUrl: editingProduct.imageUrl || '',
        gallery: editingProduct.gallery || [],
        stock: finalStock,
        colorsStock: editingProduct.colorsStock || {}, // NUEVO
        isNew: editingProduct.isNew ?? false,
        isVideo: editingProduct.isVideo || false,
        reviews: editingProduct.reviews || []
      };
      
      if (editingProduct.id) { 
        await database.updateProduct(productData); 
        onUpdateProduct(productData);
        setLocalInventory(prev => prev.map(p => p.id === productData.id ? productData : p));
      } else { 
        await database.addProduct(productData); 
        onAddProduct(productData);
        setLocalInventory(prev => [productData, ...prev]);
      }
      setEditingProduct(null);
    } catch (e: any) { alert(`Error: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('¿Borrar esta pieza?')) return;
    setLocalInventory(prev => prev.filter(p => p.id !== id));
    try {
      await database.deleteProduct(id);
      onDeleteProduct(id);
    } catch (e) {
      alert("Error al borrar en base de datos");
      refreshData();
    }
  };

  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary') || url.includes('f_auto')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  const stats = {
    totalSales: sales.reduce((a, b) => a + b.total, 0),
    membersCount: members.length,
    stockCount: products.reduce((a, b) => a + b.stock, 0),
    salesCount: sales.length
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 z-[300] bg-[#f5eedc] flex items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white p-12 md:p-16 rounded-[60px] shadow-2xl w-full max-w-lg border-t-[15px] border-[#f6a118]">
        <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-8 object-contain" alt="Logo" />
        <h2 className="text-4xl mb-10 text-[#4a3728] font-bold uppercase italic tracking-tighter">Acceso Staff 🛠️</h2>
        <form onSubmit={handleLogin} className="space-y-8">
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="PIN" className="w-full px-8 py-6 rounded-full border border-black/5 outline-none text-center font-bold text-5xl tracking-[0.3em] bg-[#fefaf0] shadow-inner focus:ring-4 focus:ring-[#fadb31]" autoFocus />
          <button className="w-full matita-gradient-1 text-white py-6 rounded-full font-bold uppercase tracking-widest text-2xl hover:scale-105 shadow-xl transition-all">Ingresar 🚀</button>
        </form>
        <button onClick={onClose} className="mt-10 text-xl opacity-30 uppercase font-bold tracking-[0.4em]">Cerrar</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-[#fefaf0] flex flex-col overflow-hidden animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />

      <header className="bg-white text-[#4a3728] p-6 md:p-8 flex justify-between items-center shadow-xl shrink-0 border-b-8 border-[#fadb31]">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-full p-2 shadow-lg matita-gradient-1">
            <img src={LOGO_URL} className="w-full h-full object-contain rounded-full bg-white p-1" />
          </div>
          <h1 className="font-bold text-3xl md:text-4xl uppercase tracking-tighter">Panel de Control 🛠️</h1>
        </div>
        <button onClick={onClose} className="px-8 py-4 matita-gradient-2 text-white rounded-full text-xl font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">SALIR</button>
      </header>

      <nav className="bg-white border-t border-black/5 flex overflow-x-auto no-scrollbar shrink-0 px-4 py-4 gap-4 justify-center">
        {[
          { id: 'dashboard', label: 'Métricas', icon: '📊' },
          { id: 'inventory', label: 'Vitrina', icon: '📦' },
          { id: 'sales', label: 'Ventas', icon: '💰' },
          { id: 'members', label: 'Socios', icon: '✨' },
          { id: 'coupons', label: 'Tickets', icon: '🎫' },
          { id: 'suggestions', label: 'Ideas', icon: '💡' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-4 rounded-full text-xl font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === tab.id ? 'matita-gradient-1 text-white shadow-xl scale-110' : 'bg-gray-50 text-gray-300'}`}>
            <span className="text-3xl">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-grow overflow-y-auto p-6 md:p-12 no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in-up space-y-12">
              <h2 className="text-6xl md:text-8xl font-bold text-[#4a3728] italic">Estado 📈</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Ingresos Totales', value: formatPrice(stats.totalSales), icon: '💰' },
                  { label: 'Socios Club', value: stats.membersCount, icon: '✨' },
                  { label: 'Stock en Vitrina', value: stats.stockCount, icon: '📦' },
                  { label: 'Pedidos Realizados', value: stats.salesCount, icon: '🎫' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-12 rounded-[60px] border shadow-xl text-center space-y-4">
                    <span className="text-7xl block">{s.icon}</span>
                    <p className="text-xl font-bold uppercase tracking-widest opacity-40">{s.label}</p>
                    <p className="text-4xl md:text-5xl text-[#4a3728] font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-10 animate-fade-in-up">
              <button onClick={() => setEditingProduct({ category: Category.ESCOLAR, stock: 10, price: 0, isNew: false, isVideo: false, colorsStock: {} })} className="w-full matita-gradient-1 text-white p-12 rounded-[50px] text-4xl font-bold shadow-2xl hover:scale-[1.02] transition-all">+ NUEVA PIEZA 💎</button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localInventory.map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[50px] border shadow-xl flex flex-col gap-6 relative">
                    <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-[#fefaf0] border-2 border-white shadow-inner relative group">
                      {p.isNew && <span className="absolute top-6 left-6 z-10 matita-gradient-1 text-white text-xs px-5 py-2 rounded-full font-bold shadow-lg">NUEVO</span>}
                      <img src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4a3728] text-2xl uppercase mb-1">{p.name}</h4>
                      <p className="text-xl font-bold text-[#f6a118] mb-4">{formatPrice(p.price)}</p>
                      <div className="flex gap-4">
                        <button onClick={() => setEditingProduct(p)} className="flex-1 py-4 bg-blue-50 text-blue-500 rounded-2xl text-2xl hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                        <button onClick={() => handleDelete(p.id)} className="flex-1 py-4 bg-red-50 text-red-400 rounded-2xl text-2xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conservar el resto de los tabs existentes (sales, members, coupons, suggestions) con tu lógica actual */}
          {activeTab === 'sales' && (
             <div className="space-y-6">
                <h2 className="text-6xl font-bold text-[#4a3728]">Ventas 💰</h2>
                {sales.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[40px] border shadow-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#f6a118] text-lg uppercase tracking-widest">{s.date}</p>
                      <p className="text-xl font-bold text-[#4a3728] uppercase">{s.itemsDetail}</p>
                    </div>
                    <p className="text-4xl font-bold text-[#4a3728]">{formatPrice(s.total)}</p>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'members' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {members.map(m => (
                  <div key={m.id} className="bg-white p-10 rounded-[50px] border shadow-xl space-y-6">
                    <div className="flex justify-between items-start">
                      <h4 className="text-3xl font-bold text-[#4a3728]">{m.name}</h4>
                      <span className="text-2xl">👤</span>
                    </div>
                    <div className="flex items-center gap-6 bg-[#fefaf0] p-6 rounded-[30px] shadow-inner">
                        <div className="flex-grow">
                          <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Puntos Club</p>
                          <input 
                            type="number" 
                            value={editingPoints[m.id] !== undefined ? editingPoints[m.id] : m.points}
                            onChange={e => setEditingPoints({...editingPoints, [m.id]: Number(e.target.value)})}
                            className="bg-transparent text-4xl font-bold text-[#4a3728] outline-none w-full"
                          />
                        </div>
                        <button onClick={async () => { await database.updateProfilePoints(m.id, editingPoints[m.id] || m.points); alert('Puntos actualizados'); refreshData(); }} className="matita-gradient-1 text-white p-5 rounded-full text-2xl shadow-lg">💾</button>
                    </div>
                  </div>
                ))}
             </div>
          )}

        </div>

        {/* Modal de Edición Mejorado con Colores y Stock Manual */}
        {editingProduct && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white p-12 md:p-16 rounded-[80px] max-w-5xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-5xl font-bold text-[#4a3728]">Curaduría de Pieza ✨</h3>
                <button onClick={() => setEditingProduct(null)} className="text-5xl text-red-500">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xl font-bold opacity-40 uppercase tracking-widest px-4">Nombre</label>
                    <input type="text" value={editingProduct.name || ''} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-8 py-6 rounded-full bg-[#fefaf0] font-bold text-3xl outline-none shadow-inner border border-black/5" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xl font-bold opacity-40 uppercase tracking-widest px-4">Categoría Boutique</label>
                    <select 
                      value={editingProduct.category || Category.ESCOLAR} 
                      onChange={e=>setEditingProduct({...editingProduct, category: e.target.value as Category})}
                      className="w-full px-8 py-6 rounded-full bg-[#fefaf0] font-bold text-2xl uppercase outline-none shadow-inner border border-black/5 appearance-none cursor-pointer"
                    >
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xl font-bold opacity-40 uppercase tracking-widest px-4">Precio $</label>
                      <input type="number" value={editingProduct.price || ''} onChange={e=>setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full px-8 py-6 rounded-full bg-[#fefaf0] font-bold text-3xl outline-none shadow-inner border border-black/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold opacity-40 uppercase tracking-widest px-4">Precio Oferta (Opcional)</label>
                      <input type="number" value={editingProduct.oldPrice || ''} onChange={e=>setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})} className="w-full px-8 py-6 rounded-full bg-[#fefaf0] font-bold text-3xl outline-none shadow-inner border border-black/5" />
                    </div>
                  </div>

                  {/* NUEVO: Selector de colores con Checkboxes y Stock Manual */}
                  <div className="space-y-4">
                    <label className="text-xl font-bold opacity-40 uppercase tracking-widest px-4 block">Variantes & Stock por Color 🎨</label>
                    <div className="grid grid-cols-1 gap-4 bg-[#fefaf0] p-8 rounded-[40px] border shadow-inner">
                      {AVAILABLE_COLORS.map(color => {
                        const isSelected = editingProduct.colorsStock?.[color] !== undefined;
                        return (
                          <div key={color} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${isSelected ? 'bg-white border-[#fadb31] shadow-md' : 'border-transparent opacity-40'}`}>
                            <label className="flex items-center gap-6 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleColorSelection(color)} 
                                className="w-10 h-10 rounded-xl accent-[#f6a118]" 
                              />
                              <span className="text-2xl font-bold uppercase">{color}</span>
                            </label>
                            {isSelected && (
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold opacity-30 uppercase">STOCK:</span>
                                <input 
                                  type="number" 
                                  value={editingProduct.colorsStock![color]} 
                                  onChange={e => updateIndividualColorStock(color, Number(e.target.value))} 
                                  className="w-24 p-4 text-center bg-[#fefaf0] rounded-2xl font-bold text-3xl shadow-inner outline-none border border-[#fadb31]/30" 
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="aspect-square bg-[#fefaf0] rounded-[60px] border-8 border-dashed border-[#fadb31]/30 flex flex-col items-center justify-center p-8 overflow-hidden shadow-inner relative group">
                    {editingProduct.imageUrl ? (
                      <img src={editingProduct.imageUrl} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-9xl">📸</span>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                       <button onClick={() => fileInputRef.current?.click()} className="p-10 matita-gradient-1 text-white rounded-full font-bold text-3xl shadow-2xl">SUBIR FOTO</button>
                    </div>
                  </div>
                  <div className="p-10 bg-blue-50 rounded-[40px] border border-blue-100">
                     <p className="text-2xl italic text-blue-600 font-bold">💡 Consejo: El stock total se calcula sumando las variantes que cargaste.</p>
                  </div>
                  <button onClick={() => setEditingProduct({...editingProduct, isNew: !editingProduct.isNew})} className={`w-full py-6 rounded-full text-2xl font-bold shadow-xl transition-all ${editingProduct.isNew ? 'matita-gradient-1 text-white' : 'bg-gray-100 text-gray-400'}`}>MARCAR COMO NOVEDAD ✨</button>
                </div>
              </div>

              <div className="flex gap-8 pt-10 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-8 bg-gray-100 rounded-[50px] text-3xl font-bold text-gray-400">DESCARTAR</button>
                <button onClick={handleSaveProduct} disabled={isLoading} className="flex-1 py-8 matita-gradient-1 text-white rounded-[50px] text-4xl font-bold shadow-2xl hover:scale-105 transition-all">
                  {isLoading ? 'GUARDANDO...' : 'GUARDAR EN VITRINA ✅'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

              
