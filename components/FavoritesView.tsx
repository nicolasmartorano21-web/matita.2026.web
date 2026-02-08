
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FavoritesViewProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onToggleFavorite: (id: string) => void;
  onNavigate: () => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ products, onAddToCart, onToggleFavorite, onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 px-4">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❤️</span>
        </div>
        <h2 className="serif text-6xl text-[#0a3d31] mb-4 italic">Deseados.</h2>
        <p className="text-[#c5a35d] uppercase tracking-[0.4em] font-bold text-[10px]">Tu Curaduría Personal</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-20 rounded-[60px] text-center border border-black/5 shadow-sm space-y-8">
          <p className="serif italic text-2xl text-[#0a3d31]/40">Tu lista de deseos está esperando piezas especiales...</p>
          <button 
            onClick={onNavigate} 
            className="bg-[#0a3d31] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#c5a35d] transition-all"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={onAddToCart} 
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
