import React, { useState, useRef } from 'react';
import { Product, Review } from '../types';
import { database } from '../lib/database';
import { formatPrice } from '../constants';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  // Estilo de fuente del Admin
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };
  
  const [activeMedia, setActiveMedia] = useState(product.imageUrl);
  const [comment, setComment] = useState('');
  const actionSectionRef = useRef<HTMLDivElement>(null);

  // NUEVO: Estado para el color seleccionado (Toma el primero disponible si existen)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : null
  );

  // NUEVO: El stock depende de si hay un color elegido o es stock general
  const currentColorStock = product.colors && product.colors.length > 0
    ? product.colors.find(c => c.name === selectedColor)?.stock ?? 0
    : product.stock;

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newReview: Review = {
      id: Date.now().toString(),
      userName: 'Socio Matita',
      rating: 5,
      comment: comment,
      date: new Date().toISOString().split('T')[0]
    };
    await database.addReview(product.id, newReview);
    alert('¡Gracias, fiera! Tu opinión es oro.');
    setComment('');
  };

  const scrollToReserve = () => {
    actionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isOutOfStock = product.stock <= 0;
  const isColorOutOfStock = currentColorStock <= 0;
  const gallery = product.gallery || [product.imageUrl];

  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  return (
    <div style={adminFontStyle} className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#f9f7f2] h-[94vh] md:h-auto md:max-h-[88vh] rounded-t-[50px] md:rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-fade-in border-t-8 border-[#FFD93D]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-[180] bg-[#F48FB1] hover:bg-black p-3 rounded-full text-white transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Galería Multimedia */}
        <div className="w-full md:w-1/2 flex flex-col h-[35vh] md:h-auto bg-white flex-shrink-0 relative group border-b-4 md:border-b-0 md:border-r-4 border-[#F8BBD0]">
          <div className="flex-grow relative overflow-hidden cursor-s-resize" onClick={scrollToReserve}>
            {product.isVideo ? (
               <video src={optimizeUrl(activeMedia)} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
               <img src={optimizeUrl(activeMedia)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#FFD93D] px-5 py-2 rounded-full shadow-lg md:hidden animate-bounce">
              <span className="text-[10px] text-black font-black uppercase tracking-widest">Tocar para comprar ↓</span>
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="h-20 flex gap-3 p-3 overflow-x-auto no-scrollbar bg-[#F9F7F2]">
               {gallery.map((media, i) => (
                 <button key={i} onClick={() => setActiveMedia(media)} className={`w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeMedia === media ? 'border-[#FFD93D] scale-105 shadow-md' : 'border-transparent opacity-50'}`}>
                    <img src={optimizeUrl(media)} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto no-scrollbar bg-[#FFF9FB]">
          <div className="max-w-md mx-auto flex flex-col">
            
            <header className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[#F48FB1] font-black mb-2 italic">{product.category} ✨</p>
              <h2 className="text-4xl md:text-5xl text-black font-black leading-tight uppercase italic mb-4">{product.name}</h2>
            </header>
            
            {/* SECCIÓN DE ACCIÓN (Estilo Admin) */}
            <div 
              ref={actionSectionRef}
              className="bg-white p-8 rounded-[50px] shadow-xl border-4 border-[#F8BBD0] mb-8 flex flex-col items-center text-center space-y-6"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">Precio Especial</p>
                <div className="flex flex-col items-center">
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-lg font-bold text-black/20 line-through decoration-[#F48FB1] decoration-2">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  <span className="text-6xl font-black text-black tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* NUEVO: Selector de colores dinámico */}
                {product.colors && product.colors.length > 0 && (
                  <div className="pt-6 space-y-3">
                    <p className="text-[10px] font-black uppercase text-[#F48FB1] italic">Elige tu variante favorita:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {product.colors.map((c, i) => (
                        <button
                          key={i}
                          disabled={c.stock <= 0}
                          onClick={() => setSelectedColor(c.name)}
                          className={`px-5 py-2 rounded-full text-[11px] font-black uppercase transition-all border-4 ${
                            selectedColor === c.name 
                              ? 'bg-[#FFD93D] border-black text-black shadow-md scale-110' 
                              : 'bg-white border-[#F8BBD0] text-black/40 hover:border-[#F48FB1]'
                          } ${c.stock <= 0 ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border-2 ${isColorOutOfStock ? 'bg-red-50 text-red-400 border-red-200' : 'bg-[#F9F7F2] text-black border-black/5'}`}>
                    {isColorOutOfStock ? '⚠️ Variante sin stock' : `¡Quedan ${currentColorStock} disponibles!`}
                  </span>
                </div>
              </div>

              <button 
                disabled={isColorOutOfStock}
                onClick={() => { onAddToCart({ ...product, selectedColor: selectedColor || undefined }); onClose(); }}
                className={`w-full py-6 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 border-b-8 ${
                  isColorOutOfStock ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none' : 'bg-[#FFD93D] text-black border-black/10 hover:bg-[#F48FB1] hover:text-white'
                }`}
              >
                {!isColorOutOfStock && <span className="text-xl">🛍️</span>}
                {isColorOutOfStock ? 'AGOTADO' : 'LO QUIERO AHORA'}
              </button>
            </div>

            {/* Descripción y Curaduría */}
            <div className="space-y-8 pb-10">
              <div className="text-center">
                <p className="text-black/70 leading-relaxed font-bold italic text-lg">"{product.description}"</p>
              </div>

              {product.curatorNote && (
                <div className="p-6 bg-[#FFD93D]/10 rounded-[40px] border-4 border-dashed border-[#FFD93D] text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a35d] mb-2 italic">Nota del Staff 🖍️</p>
                   <p className="text-sm text-black font-bold italic">"{product.curatorNote}"</p>
                </div>
              )}

              {/* Reseñas */}
              <div className="pt-8 border-t-4 border-[#F8BBD0] border-dotted">
                <h3 className="text-2xl font-black italic text-black text-center mb-6">¿Qué dicen los socios? 💬</h3>
                <div className="space-y-6 mb-8">
                  {product.reviews.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-[30px] shadow-sm border-2 border-black/5">
                      <p className="text-sm font-bold italic text-black/80">"{r.comment}"</p>
                      <p className="text-[10px] font-black uppercase text-[#F48FB1] mt-3">— {r.userName}</p>
                    </div>
                  ))}
                  {product.reviews.length === 0 && <p className="text-xs opacity-30 italic text-center font-bold">Aún no hay reseñas de esta pieza.</p>}
                </div>

                <form onSubmit={handleReview} className="flex flex-col gap-4">
                   <input 
                    type="text" 
                    value={comment} 
                    onChange={e=>setComment(e.target.value)} 
                    placeholder="Deja tu comentario aquí..." 
                    className="bg-white rounded-full px-8 py-5 text-sm font-bold outline-none border-4 border-[#F8BBD0] focus:border-[#FFD93D] transition-all shadow-inner" 
                   />
                   <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F48FB1] hover:text-black transition-colors">Enviar mi reseña 🚀</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
