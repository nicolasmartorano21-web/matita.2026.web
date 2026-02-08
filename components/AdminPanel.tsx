import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Sale, Coupon, User } from '../types';
import { ADMIN_PASSWORD, LOGO_URL, formatPrice } from '../constants';
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

  const [tempColor, setTempColor] = useState({ name: '', stock: 0 });

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

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || editingProduct.price === undefined || !editingProduct.category) return alert('Faltan datos (Nombre, Precio o Categoría).');
    setIsLoading(true);
    try {
      const productData: Product = {
        id: editingProduct.id || `prod_${Date.now()}`,
        name: editingProduct.name,
        description: editingProduct.description || '',
        curatorNote: editingProduct.curatorNote || '',
        price: Number(editingProduct.price),
        // NUEVO: Se asegura de guardar el precio viejo si existe
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        category: editingProduct.category as Category,
        imageUrl: editingProduct.imageUrl || '',
        gallery: editingProduct.gallery || [],
        stock: Number(editingProduct.stock || 0),
        isNew: editingProduct.isNew ?? false,
        isVideo: editingProduct.isVideo || false,
        reviews: editingProduct.reviews || [],
        colors: editingProduct.colors || [],
        pointsValue: editingProduct.pointsValue || 0
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

  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };

  if (!isAuthenticated) return (
    <div style={adminFontStyle} className="fixed inset-0 z-[300] bg-[#F48FB1] flex items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border-t-[15px] border-[#FFD93D]">
        <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-8 object-contain" alt="Logo" />
        <h2 className="text-3xl mb-10 text-[#000000] font-bold uppercase tracking-tight">Acceso Staff Matita 🗝️</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="PIN DE SEGURIDAD" className="w-full px-8 py-6 rounded-full border-4 border-[#F8BBD0] outline-none text-center font-bold text-xl bg-[#F9F7F2]" autoFocus />
          <button className="w-full bg-[#FFD93D] text-black py-6 rounded-full font-bold uppercase tracking-widest text-lg hover:scale-105 shadow-xl transition-all">ENTRAR AL PANEL 🚀</button>
        </form>
        <button onClick={onClose} className="mt-10 text-sm opacity-50 uppercase font-bold tracking-widest">Cerrar</button>
      </div>
    </div>
  );

  return (
    <div style={adminFontStyle} className="fixed inset-0 z-[300] bg-[#FFFFFF] flex flex-col overflow-hidden animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />

      <header className="bg-[#FFD93D] text-black p-6 flex justify-between items-center shadow-lg shrink-0 border-b-4 border-black/10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white rounded-full p-2 shadow-md">
            <img src={LOGO_URL} className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-xl md:text-2xl uppercase tracking-tighter">Panel de Control Matita 🎨</h1>
            <p className="text-xs font-bold opacity-60">ADMINISTRACIÓN PROFESIONAL</p>
          </div>
        </div>
        <button onClick={onClose} className="px-8 py-4 bg-[#F48FB1] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md">CERRAR SESIÓN 👋</button>
      </header>

      <nav className="bg-[#F8BBD0] flex overflow-x-auto no-scrollbar shrink-0 p-3 gap-3 md:justify-center border-b-4 border-black/5">
        {[
          { id: 'dashboard', label: 'Métricas', icon: '📊' },
          { id: 'inventory', label: 'Productos', icon: '📦' },
          { id: 'sales', label: 'Ventas', icon: '💰' },
          { id: 'members', label: 'Socios', icon: '⭐' },
          { id: 'coupons', label: 'Cupones', icon: '🎫' },
          { id: 'suggestions', label: 'Ideas', icon: '💡' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-black shadow-xl scale-110 border-2 border-black/10' : 'opacity-70 hover:opacity-100 hover:bg-white/50'}`}>
            <span className="text-2xl">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-grow overflow-y-auto p-6 md:p-12 no-scrollbar bg-[#FFF9FB]">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in space-y-10">
              <h2 className="text-4xl md:text-6xl text-black font-black italic">¡Hola, Staff! 🌈</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Dinero Total', value: formatPrice(stats.totalSales), icon: '💰' },
                  { label: 'Socios Activos', value: stats.membersCount, icon: '⭐' },
                  { label: 'Productos', value: stats.stockCount, icon: '📦' },
                  { label: 'Ventas', value: stats.salesCount, icon: '🎫' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-10 rounded-[50px] border-4 border-[#F8BBD0] shadow-xl text-center space-y-4 hover:rotate-1 transition-transform">
                    <span className="text-5xl block">{s.icon}</span>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">{s.label}</p>
                    <p className="text-3xl md:text-4xl text-black font-black">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
  <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-center bg-[#FFD93D] p-10 rounded-[60px] shadow-xl border-4 border-black/5 gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-5xl text-black font-black italic mb-2">Mi Vitrina 📦</h2>
        <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">CONTROL RÁPIDO DE STOCK</p>
      </div>
      <button 
        onClick={() => setEditingProduct({ category: Category.ESCOLAR, stock: 10, price: 0, isNew: false, isVideo: false, colors: [], pointsValue: 10 })} 
        className="w-full md:w-auto bg-black text-white px-12 py-6 rounded-full text-lg font-bold uppercase tracking-widest shadow-2xl hover:bg-[#F48FB1] transition-all"
      >
        + NUEVA PIEZA ✨
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {localInventory.map(p => (
        <div key={p.id} className="bg-white p-8 rounded-[50px] border-4 border-[#F8BBD0] shadow-lg flex flex-col gap-6 relative animate-fade-in hover:shadow-2xl transition-all">
          <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-[#F9F7F2] border-2 border-black/5 relative group">
            {p.isNew && <span className="absolute top-6 left-6 z-10 bg-[#F48FB1] text-white text-xs px-5 py-2 rounded-full font-bold shadow-lg italic">¡NUEVO!</span>}
            {p.isVideo ? <video src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" /> : <img src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" />}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-black text-black text-2xl uppercase truncate">{p.name}</h4>

            {/* --- CASILLAS DE STOCK POR COLOR --- */}
            <div className="bg-[#F9F7F2] p-5 rounded-[35px] border-2 border-[#F8BBD0]">
              <p className="text-[10px] font-black uppercase opacity-50 mb-3 text-center">Toca para ajustar stock 🎨</p>
              <div className="grid grid-cols-2 gap-3">
                {p.colors && p.colors.length > 0 ? (
                  p.colors.map((c, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-2xl border-2 border-black/5 flex flex-col items-center gap-1 shadow-sm">
                      <span className="text-[10px] font-bold uppercase truncate w-full text-center">{c.name}</span>
                      <div className="flex items-center gap-2 bg-[#FFF9FB] rounded-full px-2 py-1 border border-[#F48FB1]">
                        <button 
                          onClick={async () => {
                            const newColors = [...p.colors];
                            newColors[idx].stock = Math.max(0, newColors[idx].stock - 1);
                            const updatedProduct = { ...p, colors: newColors, stock: newColors.reduce((a, b) => a + b.stock, 0) };
                            await database.updateProduct(updatedProduct);
                            onUpdateProduct(updatedProduct);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-black font-bold border border-black/10 hover:bg-red-100">-</button>
                        <span className="font-black text-sm w-4 text-center">{c.stock}</span>
                        <button 
                          onClick={async () => {
                            const newColors = [...p.colors];
                            newColors[idx].stock += 1;
                            const updatedProduct = { ...p, colors: newColors, stock: newColors.reduce((a, b) => a + b.stock, 0) };
                            await database.updateProduct(updatedProduct);
                            onUpdateProduct(updatedProduct);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-[#FFD93D] rounded-full text-black font-bold hover:scale-110 shadow-sm">+</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-2 text-center opacity-30 text-[10px] italic">No hay colores configurados</div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                {p.oldPrice && p.oldPrice > p.price && (
                  <span className="text-sm font-bold text-black/30 line-through decoration-red-500">${p.oldPrice.toLocaleString()}</span>
                )}
                <p className="text-3xl font-black text-black">${p.price.toLocaleString()}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase">Total: {p.stock} units</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingProduct(p)} className="p-4 bg-[#FFD93D] text-black rounded-full text-lg hover:scale-110 shadow-md">✏️</button>
                <button onClick={() => handleDelete(p.id)} className="p-4 bg-red-100 text-red-500 rounded-full text-lg hover:bg-red-500 hover:text-white shadow-md">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                {p.oldPrice && p.oldPrice > p.price && (
                  <span className="text-sm font-bold text-black/30 line-through decoration-red-500 decoration-2">${p.oldPrice.toLocaleString()}</span>
                )}
                <p className="text-3xl font-black text-black">${p.price.toLocaleString()}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Total Stock: {p.stock}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingProduct(p)} className="p-5 bg-[#FFD93D] text-black rounded-full text-xl hover:scale-110 shadow-md transition-all">✏️</button>
                <button onClick={() => handleDelete(p.id)} className="p-5 bg-red-100 text-red-500 rounded-full text-xl hover:bg-red-500 hover:text-white shadow-md transition-all">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localInventory.map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[50px] border-4 border-[#F8BBD0] shadow-lg flex flex-col gap-6 relative animate-fade-in hover:shadow-2xl transition-all">
                    <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-[#F9F7F2] border-2 border-black/5 relative group">
                      {p.isNew && <span className="absolute top-6 left-6 z-10 bg-[#F48FB1] text-white text-xs px-5 py-2 rounded-full font-bold shadow-lg italic">¡NUEVO!</span>}
                      {p.oldPrice && p.oldPrice > p.price && <span className="absolute top-6 right-6 z-10 bg-[#FFD93D] text-black text-xs px-5 py-2 rounded-full font-bold shadow-lg italic">OFERTA 🔥</span>}
                      {p.isVideo ? <video src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" /> : <img src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-black text-black text-2xl uppercase mb-1 truncate">{p.name}</h4>
                      <p className="text-sm uppercase tracking-widest text-[#F48FB1] font-bold mb-4">{p.category} 🏷️</p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          {/* NUEVO: Visualización del precio viejo tachado en la lista */}
                          {p.oldPrice && p.oldPrice > p.price && (
                            <span className="text-sm font-bold text-black/30 line-through decoration-red-500 decoration-2">${p.oldPrice.toLocaleString()}</span>
                          )}
                          <p className="text-3xl font-black text-black">${p.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setEditingProduct(p)} className="p-5 bg-[#FFD93D] text-black rounded-full text-xl hover:scale-110 shadow-md transition-all">✏️</button>
                          <button onClick={() => handleDelete(p.id)} className="p-5 bg-red-100 text-red-500 rounded-full text-xl hover:bg-red-500 hover:text-white shadow-md transition-all">🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ... resto de las pestañas (ventas, socios, cupones, ideas) se mantienen igual ... */}
          {activeTab === 'sales' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-5xl text-black font-black italic">Ventas Realizadas 💰</h2>
              <div className="space-y-6">
                {sales.map(s => (
                  <div key={s.id} className="bg-white p-10 rounded-[50px] border-4 border-[#F8BBD0] shadow-md flex flex-col md:flex-row justify-between items-center gap-6 group">
                    <div className="text-center md:text-left">
                      <p className="font-bold text-sm uppercase text-[#F48FB1] mb-2">{s.date} 📅</p>
                      <p className="font-black text-xl text-black uppercase leading-tight">{s.itemsDetail}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-4xl font-black text-black">${s.total.toLocaleString()}</p>
                      <button onClick={async () => { if(confirm('¿Borrar historial?')) { await database.deleteSale(s.id); refreshData(); } }} className="p-5 bg-red-50 text-red-400 rounded-full opacity-20 group-hover:opacity-100 transition-all">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-5xl text-black font-black italic">Club de Socios ⭐</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {members.map(m => (
                  <div key={m.id} className="bg-white p-10 rounded-[50px] border-4 border-[#F8BBD0] shadow-md flex flex-col gap-8 group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-2xl uppercase text-black mb-1">{m.name}</p>
                        <p className="text-sm font-bold opacity-40">{m.email}</p>
                      </div>
                      <button onClick={async () => { if(confirm('¿Eliminar socio?')) { await database.deleteProfile(m.id); refreshData(); } }} className="p-4 bg-red-50 text-red-400 rounded-full opacity-20 group-hover:opacity-100 transition-all">🗑️</button>
                    </div>
                    <div className="flex items-center gap-6 bg-[#FFF9FB] p-8 rounded-[40px] border-2 border-[#F8BBD0]">
                      <div className="flex-grow">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#F48FB1] mb-2">MIS PUNTOS ACUMULADOS</p>
                        <input 
                          type="number" 
                          value={editingPoints[m.id] !== undefined ? editingPoints[m.id] : m.points}
                          onChange={e => setEditingPoints({...editingPoints, [m.id]: Number(e.target.value)})}
                          className="bg-transparent text-4xl font-black text-black outline-none w-full"
                        />
                      </div>
                      <button onClick={async () => { await database.updateProfilePoints(m.id, editingPoints[m.id]); alert('¡Puntos Guardados!'); refreshData(); }} className="bg-[#FFD93D] text-black p-6 rounded-full text-2xl shadow-lg">💾</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
             <div className="animate-fade-in space-y-10">
                <div className="bg-black p-12 rounded-[60px] text-white shadow-2xl border-b-[10px] border-[#F48FB1]">
                   <h3 className="text-3xl font-black italic mb-8 text-[#FFD93D]">Crear Ticket de Descuento 🎫</h3>
                   <div className="flex flex-col md:flex-row gap-6">
                     <input type="text" placeholder="CÓDIGO" value={newCouponCode} onChange={e=>setNewCouponCode(e.target.value.toUpperCase())} className="flex-grow bg-white/10 px-10 py-6 rounded-full font-bold uppercase text-lg outline-none border-2 border-white/20" />
                     <input type="number" placeholder="% DESC" value={newCouponDiscount} onChange={e=>setNewCouponDiscount(e.target.value)} className="md:w-48 bg-white/10 px-10 py-6 rounded-full font-bold text-lg outline-none border-2 border-white/20 text-center" />
                     <button onClick={async () => { await database.addCoupon({ code: newCouponCode, discount: Number(newCouponDiscount)/100 }); setNewCouponCode(''); setNewCouponDiscount(''); refreshData(); }} className="bg-[#FFD93D] text-black px-12 py-6 rounded-full font-black text-lg uppercase shadow-xl">CREAR YA ✨</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {coupons.map(c => (
                    <div key={c.code} className="bg-white p-10 rounded-[50px] border-4 border-[#F8BBD0] shadow-md flex justify-between items-center group">
                      <div>
                        <p className="font-black text-black text-xl uppercase mb-1">{c.code}</p>
                        <p className="text-4xl font-black text-[#F48FB1]">{c.discount * 100}% OFF</p>
                      </div>
                      <button onClick={async () => { await database.deleteCoupon(c.code); refreshData(); }} className="p-4 text-red-400 opacity-20 group-hover:opacity-100 transition-all text-2xl">🗑️</button>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'suggestions' && (
             <div className="animate-fade-in space-y-8">
                <h2 className="text-5xl text-black font-black italic">Ideas del Buzón 💡</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {suggestions.map(s => (
                    <div key={s.id} className="bg-white p-12 rounded-[60px] border-4 border-[#F8BBD0] shadow-md relative group italic">
                      <button onClick={async () => { if(confirm('¿Eliminar?')) { await database.deleteSuggestion(s.id); refreshData(); } }} className="absolute top-6 right-6 p-4 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      <p className="text-2xl text-black font-bold leading-relaxed">"{s.text}"</p>
                      <p className="text-xs opacity-40 mt-6 font-black uppercase tracking-widest">{s.type} • {s.date}</p>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* MODAL DE EDICIÓN MEJORADO CON PRECIO VIEJO */}
        {editingProduct && (
          <div style={adminFontStyle} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white p-10 md:p-16 rounded-[60px] md:rounded-[80px] max-w-5xl w-full max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl relative border-[10px] border-[#FFD93D]">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-4xl md:text-6xl text-black font-black italic">Editar Producto 🎨</h3>
                <button onClick={() => setEditingProduct(null)} className="p-6 text-black text-4xl hover:scale-125 transition-transform">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase opacity-60 px-6 italic">Nombre del Producto ⭐</label>
                    <input type="text" value={editingProduct.name || ''} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-10 py-6 rounded-full bg-[#F9F7F2] font-black text-lg outline-none border-4 border-[#F8BBD0] shadow-inner" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase opacity-60 px-6 italic">Categoría Boutique 🗂️</label>
                    <select 
                      value={editingProduct.category || Category.ESCOLAR} 
                      onChange={e=>setEditingProduct({...editingProduct, category: e.target.value as Category})}
                      className="w-full px-10 py-6 rounded-full bg-[#FFF] font-black text-lg uppercase tracking-widest outline-none border-4 border-[#F8BBD0] appearance-none cursor-pointer shadow-md"
                    >
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* SECCIÓN DE PRECIOS MEJORADA */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-[#FFF9FB] rounded-[40px] border-4 border-[#F48FB1]">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase text-[#F48FB1] px-6 italic">Precio Actual 💰</label>
                      <input type="number" value={editingProduct.price || ''} onChange={e=>setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full px-8 py-5 rounded-full bg-white font-black text-lg outline-none border-2 border-[#F48FB1]" />
                    </div>
                    {/* NUEVO: Campo de Precio Anterior (Tachado) */}
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase text-black/40 px-6 italic">Precio Viejo ❌</label>
                      <input type="number" value={editingProduct.oldPrice || ''} onChange={e=>setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})} placeholder="Ej: 5000" className="w-full px-8 py-5 rounded-full bg-white font-black text-lg outline-none border-2 border-black/10 italic" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase opacity-60 px-6 italic">Stock Total 📊</label>
                      <input type="number" value={editingProduct.stock || ''} onChange={e=>setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full px-10 py-6 rounded-full bg-[#F9F7F2] font-black text-lg outline-none border-4 border-[#F8BBD0]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase opacity-60 px-6 italic">Puntos ⭐</label>
                      <input type="number" value={editingProduct.pointsValue || 0} onChange={e=>setEditingProduct({...editingProduct, pointsValue: Number(e.target.value)})} className="w-full px-10 py-6 rounded-full bg-[#F9F7F2] font-black text-lg outline-none border-4 border-[#F8BBD0]" />
                    </div>
                  </div>

                  <div className="p-8 bg-[#F9F7F2] rounded-[40px] border-4 border-dashed border-[#F48FB1] space-y-4">
                    <label className="text-sm font-black uppercase opacity-60 italic">Variantes de Color 🎨</label>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Color" value={tempColor.name} onChange={e=>setTempColor({...tempColor, name: e.target.value})} className="flex-grow px-6 py-4 rounded-full border-2 border-[#F8BBD0] font-bold" />
                      <input type="number" placeholder="Stock" value={tempColor.stock} onChange={e=>setTempColor({...tempColor, stock: Number(e.target.value)})} className="w-24 px-6 py-4 rounded-full border-2 border-[#F8BBD0] font-bold" />
                      <button 
                        onClick={() => {
                          if(!tempColor.name) return;
                          const newColors = [...(editingProduct.colors || []), tempColor];
                          setEditingProduct({...editingProduct, colors: newColors});
                          setTempColor({name: '', stock: 0});
                        }}
                        className="bg-black text-white px-6 rounded-full font-black"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingProduct.colors?.map((c, i) => (
                        <div key={i} className="bg-white px-5 py-2 rounded-full border-2 border-black flex items-center gap-3 font-bold">
                          {c.name} ({c.stock})
                          <button onClick={() => setEditingProduct({...editingProduct, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="text-red-500">x</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase opacity-60 px-6 italic">Descripción ✍️</label>
                    <textarea value={editingProduct.description || ''} onChange={e=>setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-10 py-8 rounded-[40px] bg-[#F9F7F2] text-lg font-bold outline-none border-4 border-[#F8BBD0] resize-none" rows={3} />
                  </div>
                </div>

                <div className="space-y-8">
                  <label className="text-sm font-black uppercase opacity-60 px-6 italic text-center block">Multimedia 📸</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-20 rounded-[60px] border-4 border-dashed border-[#F48FB1] bg-[#FFF9FB] flex flex-col items-center gap-6 hover:bg-[#F8BBD0]/20 transition-all group"
                  >
                    <span className="text-7xl group-hover:scale-110 transition-transform">{isLoading ? '⏳' : '📸'}</span>
                    <p className="text-lg font-black uppercase tracking-widest">{isLoading ? 'SUBIENDO...' : 'SUBIR ARCHIVO'}</p>
                  </button>
                  
                  {editingProduct.imageUrl && (
                    <div className="p-6 bg-white rounded-[40px] border-4 border-[#FFD93D] flex items-center gap-6 animate-fade-in shadow-xl">
                      <div className="w-24 h-24 rounded-[20px] overflow-hidden shrink-0 border-2 border-black/5 shadow-md">
                         {editingProduct.isVideo ? <video src={optimizeUrl(editingProduct.imageUrl)} className="w-full h-full object-cover" /> : <img src={optimizeUrl(editingProduct.imageUrl)} className="w-full h-full object-cover" />}
                      </div>
                      <div className="truncate flex-grow">
                        <p className="text-xs font-black text-[#F48FB1] uppercase">¡ARCHIVO LISTO! ✅</p>
                        <p className="text-xs opacity-30 truncate font-mono">{editingProduct.imageUrl}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 p-6 bg-[#F9F7F2] rounded-[40px] border-4 border-[#F8BBD0]">
                    <button 
                      onClick={() => setEditingProduct({...editingProduct, isNew: !editingProduct.isNew})}
                      className={`w-full py-6 rounded-full text-lg font-black uppercase tracking-widest transition-all ${editingProduct.isNew ? 'bg-[#FFD93D] text-black shadow-lg scale-105' : 'bg-white text-black/20 border-2 border-black/5'}`}
                    >
                      ✨ ES UNA NOVEDAD
                    </button>
                    <button 
                      onClick={() => setEditingProduct({...editingProduct, isVideo: !editingProduct.isVideo})}
                      className={`w-full py-6 rounded-full text-lg font-black uppercase tracking-widest transition-all ${editingProduct.isVideo ? 'bg-[#F48FB1] text-white shadow-lg scale-105' : 'bg-white text-black/20 border-2 border-black/5'}`}
                    >
                      🎬 ES UN VIDEO
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-12 mt-12 border-t-8 border-[#F9F7F2]">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-8 border-4 border-black rounded-full font-black uppercase text-lg tracking-widest hover:bg-black hover:text-white transition-all">CANCELAR ❌</button>
                <button onClick={handleSaveProduct} disabled={isLoading} className="flex-1 py-8 rounded-full font-black uppercase text-xl tracking-widest text-black bg-[#FFD93D] hover:bg-[#F48FB1] hover:text-white shadow-2xl transition-all disabled:opacity-50">
                  {isLoading ? 'GUARDANDO...' : 'GUARDAR EN VITRINA 💖'}
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
