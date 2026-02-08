import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { getGeminiConcierge } from '../services/geminiService';
import { LOGO_URL } from '../constants';

interface AIConciergeProps {
  products: Product[];
}

const AIConcierge: React.FC<AIConciergeProps> = ({ products }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // NUEVO: Estilo global de fuente Segoe Print para el chat
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const reply = await getGeminiConcierge(userText, products);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Che fiera, se me chispoteó el sistema. Probá en un ratito." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminFontStyle} className="fixed bottom-6 right-6 z-[200]">
      {isOpen ? (
        // NUEVO: Cambio de colores a Crema, bordes negros y sombras sólidas
        <div className="bg-[#FFF9FB] w-[320px] sm:w-[400px] h-[600px] rounded-[50px] shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border-4 border-black animate-fade-in">
          
          {/* Header: NUEVO Color Amarillo Matita */}
          <div className="bg-[#FFD93D] p-6 flex justify-between items-center border-b-4 border-black">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black bg-white p-1 shadow-sm">
                <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita" />
              </div>
              <div>
                <h3 className="text-black font-black text-sm tracking-tight uppercase leading-none">Concierge Matita</h3>
                <p className="text-[9px] text-black/60 font-black tracking-widest uppercase">Asistente Virtual</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-black text-white rounded-full p-1 hover:bg-[#F48FB1] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Chat Body: NUEVO mayor legibilidad y tipografía */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-white/50 scroll-smooth">
            <div className="bg-[#FFD93D]/20 p-4 rounded-3xl rounded-tl-none border-2 border-black/10 text-xs md:text-sm text-black font-bold italic">
              "¡Hola fiera! ✨ ¿Buscás algo especial hoy? Soy el asistente de la boutique. Preguntame por stock o libros, viste."
            </div>
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] p-4 rounded-[25px] text-[12px] md:text-[13px] leading-relaxed shadow-sm border-2 ${
                  m.role === 'user' 
                    ? 'bg-[#F48FB1] text-white border-black rounded-tr-none font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white border-black rounded-tl-none text-black font-bold'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 p-2 ml-2">
                <div className="w-2 h-2 bg-[#F48FB1] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#F48FB1] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-[#F48FB1] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input: NUEVO diseño botones y campos */}
          <div className="p-4 bg-white border-t-4 border-black">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí aquí, fiera..."
                className="w-full pl-6 pr-14 py-4 bg-[#FFF9FB] border-2 border-black rounded-full text-sm outline-none focus:bg-[#FFD93D]/10 text-black font-black placeholder:text-black/20"
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 bg-black text-white p-3 rounded-full hover:bg-[#F48FB1] transition-all disabled:opacity-20 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        // NUEVO: Botón flotante estilo Sticker Matita
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-4 bg-[#FFD93D] text-black p-2 pr-8 rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-[2px] active:shadow-none transition-all duration-300 border-4 border-black"
        >
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black bg-white p-1.5 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-black/50 tracking-tighter uppercase leading-none">Concierge</p>
            <p className="font-black text-sm md:text-base uppercase italic">Chatear</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default AIConcierge;
