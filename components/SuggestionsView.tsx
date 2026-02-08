
import React, { useState, useEffect } from 'react';
import { database } from '../lib/database';
import { LOGO_URL } from '../constants';

interface UserSuggestion {
  id: string;
  text: string;
  type: 'pedido' | 'tendencia';
  date: string;
}

const SuggestionsView: React.FC = () => {
  const [suggestion, setSuggestion] = useState('');
  const [type, setType] = useState<'pedido' | 'tendencia'>('pedido');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    const newSugg: UserSuggestion = {
      id: Date.now().toString(),
      text: suggestion,
      type,
      date: new Date().toLocaleDateString()
    };

    await database.addSuggestion(newSugg);
    
    setSuggestion('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-20 relative">
        <div className="w-24 h-24 mx-auto mb-10 rounded-full overflow-hidden border-2 border-[#c5a35d] bg-white p-1 shadow-xl flex items-center justify-center">
           <img src={LOGO_URL} className="w-full h-full object-contain" />
        </div>
        <h2 className="serif text-7xl text-[#0a3d31] mb-6 tracking-tighter">
          ¿Qué nos está <span className="italic text-[#c5a35d]">faltando</span>?
        </h2>
        <p className="text-lg text-[#0a3d31]/50 max-w-xl mx-auto italic serif">
          "Contanos qué pieza creativa te gustaría ver en nuestra curaduría de Altos de La Calera."
        </p>
      </div>

      <div className="bg-white rounded-[80px] p-12 md:p-20 shadow-2xl border border-[#0a3d31]/5 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a35d]/5 rounded-full -mr-32 -mt-32"></div>
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              type="button"
              onClick={() => setType('pedido')}
              className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${type === 'pedido' ? 'bg-[#0a3d31] text-white shadow-xl' : 'bg-[#f9f7f2] text-[#0a3d31]/40 hover:text-[#0a3d31]'}`}
            >
              Un Pedido Específico
            </button>
            <button 
              type="button"
              onClick={() => setType('tendencia')}
              className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${type === 'tendencia' ? 'bg-[#c5a35d] text-[#0a3d31] shadow-xl' : 'bg-[#f9f7f2] text-[#0a3d31]/40 hover:text-[#0a3d31]'}`}
            >
              Algo que se está usando
            </button>
          </div>

          <textarea 
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder={type === 'pedido' ? "Ej: 'Me gustaría que traigan repuestos para los Roller Uni-ball'..." : "Ej: 'Se están usando mucho los marcadores metalizados para dibujo técnico'..."}
            className="w-full h-64 bg-[#f9f7f2] rounded-[50px] p-12 text-xl serif italic border-2 border-transparent focus:border-[#c5a35d] transition-all resize-none outline-none shadow-inner text-[#0a3d31]"
            required
          />

          <div className="text-center">
            <button 
              type="submit"
              disabled={submitted}
              className={`bg-[#0a3d31] text-white px-20 py-6 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-[#c5a35d] hover:text-[#0a3d31] transition-all transform active:scale-95 ${submitted ? 'opacity-50' : ''}`}
            >
              {submitted ? '¡Gracias, che! Recibido.' : 'Enviar a la Boutique'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionsView;
