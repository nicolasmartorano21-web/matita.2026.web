
import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { database } from '../lib/database';

const ReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.getAllReviews().then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-24">
        <h2 className="serif text-8xl text-[#0a3d31] mb-6">Testimonios.</h2>
        <p className="text-[#c5a35d] uppercase tracking-[0.5em] font-bold text-xs italic">Lo que dicen nuestras mentes creativas</p>
      </div>

      {loading ? (
        <div className="text-center opacity-20 italic py-20">Conectando con la comunidad...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center opacity-40 italic py-10">Aún no hay reseñas públicas. ¡Sé el primero en dejar una!</div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-12 rounded-[60px] shadow-sm border border-[#0a3d31]/5 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div>
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xl ${i < rev.rating ? 'text-[#c5a35d]' : 'text-[#0a3d31]/10'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xl serif italic text-[#0a3d31] mb-8 leading-relaxed">"{rev.comment}"</p>
                </div>
                <div className="pt-8 border-t border-[#0a3d31]/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#0a3d31] uppercase text-[10px] tracking-widest">{rev.userName}</p>
                    <p className="text-[10px] text-[#c5a35d] font-bold">{rev.location || 'Cliente Matita'}</p>
                  </div>
                  <span className="text-[10px] opacity-20 font-bold">{rev.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-32 bg-[#c5a35d]/10 rounded-[100px] p-20 text-center border border-[#c5a35d]/20">
        <h3 className="serif text-4xl text-[#0a3d31] mb-6">¿Tuviste una buena experiencia?</h3>
        <p className="text-[#0a3d31]/60 mb-10 max-w-lg mx-auto">Tu opinión nos ayuda a seguir curando las mejores piezas para la comunidad.</p>
        <button className="bg-[#0a3d31] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#c5a35d] hover:text-[#0a3d31] transition-all">
          Dejar mi Reseña
        </button>
      </div>
    </div>
  );
};

export default ReviewsView;
