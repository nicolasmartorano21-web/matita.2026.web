import React, { useState } from 'react'; // NUEVO
import { Product } from '../types';
import { formatPrice } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isFavorite, onToggleFavorite }) => {
  // Estilo de fuente del Admin
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };
  
  const isOutOfStock = (product.stock || 0) <= 0;
  const hasOffer = product.oldPrice && product.oldPrice > product.price;

  // NUEVO: Estado para el color seleccionado (por defecto el primero con stock)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : null
  );

  // NUEVO: Obtener stock del color seleccionado
  const currentColorStock = product.colors?.find(c => c.name === selectedColor)?.stock ?? product.stock;
  const isColorOutOfStock = currentColorStock <= 0;

  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  return (
    <div 
      style={adminFontStyle} 
      className={`group relative bg-white rounded-[50px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-4 border-[#F8BBD0] ${isOutOfStock ? 'opacity-75' : ''} h-full flex flex-col`}
    >
      {/* Imagen / Video */}
      <div className="relative aspect-square overflow-hidden bg-[#F9F7F2]">
        {/* Favorito con color Rosa Admin */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 border-2 border-[#F8BBD0]"
        >
          <span className={`text-lg ${isFavorite ? 'text-[#F48FB1]' : 'text-gray-300'}`}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {/* Badges con estilo Admin */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isNew && !isOutOfStock && (
            <span className="bg-[#F48FB1] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg italic">
              ¡NUEVO! ✨
            </span>
          )}
          {hasOffer && !isOutOfStock && (
            <span className="bg-[#FFD93D] text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg italic">
              OFERTA 🔥
            </span>
          )}
        </div>

        {/* NUEVO: Badge de Stock dinámico por color */}
        {!isOutOfStock && currentColorStock <= 3 && currentColorStock > 0 && (
          <div className="absolute bottom-4 left-0 right-0 px-4 z-10 text-center">
            <span className="bg-black text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl border-2 border-[#FFD93D]">
              ¡SOLO QUEDAN {currentColorStock}!
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="bg-red-500 text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-2xl rotate-[-5deg]">
              AGOTADO ❌
            </span>
          </div>
        )}
        
        <div className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}>
          {product.isVideo ? (
            <video src={optimizeUrl(product.imageUrl)} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={optimizeUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-6 text-center flex-grow flex flex-col justify-between bg-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F48FB1] mb-1">{product.category}</p>
          <h3 className="text-xl font-black text-black uppercase leading-tight mb-4">{product.name}</h3>
          
          {/* NUEVO: Selector de Colores con estilo de botones Admin */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(c.name); }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all border-2 ${
                    selectedColor === c.name 
                      ? 'bg-[#FFD93D] border-black text-black shadow-md scale-105' 
                      : 'bg-[#F9F7F2] border-[#F8BBD0] text-black/40 hover:border-[#F48FB1]'
                  } ${c.stock <= 0 ? 'opacity-30 line-through' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center">
          <div className="mb-4">
            {hasOffer && (
              <span className="block text-sm font-bold text-black/30 line-through decoration-[#F48FB1] decoration-2">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
            <span className="text-3xl font-black text-black">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {/* Botón Principal estilo Admin */}
          <button 
            disabled={isOutOfStock || isColorOutOfStock}
            onClick={(e) => { 
              e.stopPropagation(); 
              onAddToCart({ ...product, selectedColor: selectedColor || undefined }); 
            }}
            className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
              (isOutOfStock || isColorOutOfStock)
                ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed' 
                : 'bg-[#FFD93D] text-black border-2 border-black hover:bg-[#F48FB1] hover:text-white active:scale-95'
            }`}
          >
            {isOutOfStock ? 'SIN STOCK' : isColorOutOfStock ? 'COLOR AGOTADO' : 'LO QUIERO! ✨'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
