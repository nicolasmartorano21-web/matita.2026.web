import React, { useState } from 'react';
import { User } from '../types';
import { LOGO_URL } from '../constants';
import { supabase } from '../lib/supabase';

interface ClubViewProps {
  user: User | null;
  onLogout?: () => void;
}

const ClubView: React.FC<ClubViewProps> = ({ user, onLogout }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };

  if (!user) return (
    <div style={adminFontStyle} className="max-w-xl mx-auto text-center py-20 animate-fade-in bg-white rounded-[40px] md:rounded-[60px] shadow-2xl p-8 md:p-12 mt-10 border border-[#F48FB1]/10 mx-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FFD93D]/20 rounded-full flex items-center justify-center mx-auto mb-10">
        <span className="text-4xl animate-pulse">✨</span>
      </div>
      <h3 className="text-3xl md:text-4xl text-black mb-6 leading-tight italic font-black">Club Matita.</h3>
      <p className="text-sm md:text-base opacity-60 mb-10 leading-relaxed italic px-4 font-bold text-black">
        Sumate a la comunidad literaria más exclusiva de La Calera. Registrate para acumular puntos por tus compras y canjearlos por beneficios únicos.
      </p>
      <p className="text-[10px] md:text-[12px] font-black text-[#F48FB1] uppercase tracking-[0.4em] bg-[#FFF9FB] py-4 rounded-full inline-block px-10 border-2 border-[#F48FB1]">
        Ingresá para acceder a tus beneficios
      </p>
    </div>
  );

  const handleRedeem = async (pointsRequired: number, rewardLabel: string, rewardValue: number, type: 'percent' | 'fixed') => {
    if (user.points < pointsRequired) return;
    
    setIsProcessing(true);
    try {
      const newTotal = user.points - pointsRequired;
      
      const { error } = await supabase
        .from('profiles')
        .update({ points: newTotal })
        .eq('id', user.id);

      if (error) throw error;

      const coupon = {
        label: rewardLabel,
        value: rewardValue,
        type: type,
        code: `MATITA-${Math.random().toString(36).toUpperCase().substring(2, 7)}`
      };
      localStorage.setItem('active_coupon', JSON.stringify(coupon));
      
      alert(`¡Canje exitoso! Tenés un ${rewardLabel} guardado para tu próxima compra. ✨`);
      window.location.reload(); 
    } catch (err) {
      alert("Error al canjear: " + (err as any).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getLevelColor = (points: number) => {
    if (points >= 5000) return 'from-[#FFD93D] to-[#F48FB1] text-black border-black/10';
    if (points >= 2000) return 'from-[#F8BBD0] to-[#FFF9FB] text-black border-black/10';
    return 'from-[#FFD93D] to-white text-black border-black/10';
  };

  return (
    <div style={adminFontStyle} className="max-w-4xl mx-auto animate-fade-in pb-20 px-4 text-center">
      <div className="mb-8 md:mb-16">
        <h2 className="text-5xl md:text-7xl text-black mb-4 italic font-black">Mi Club.</h2>
        <p className="text-[#F48FB1] uppercase tracking-[0.4em] font-black text-[10px] md:text-[12px]">Membresía Digital Activa</p>
      </div>

      {/* Tarjeta de Socio */}
      <div className={`relative w-full aspect-auto md:aspect-[1.6/1] min-h-[250px] md:min-h-0 rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-2xl border-4 border-black bg-gradient-to-br ${getLevelColor(user.points)} mb-12 md:mb-20 overflow-hidden group flex flex-col justify-between text-left`}>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-2 flex items-center justify-center shadow-lg border-4 border-black">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="text-right">
             <p className="text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase opacity-60 italic">Socio Activo</p>
          </div>
        </div>

        <div className="mt-8 relative z-10">
          <p className="text-[10px] md:text-[12px] font-black tracking-[0.5em] uppercase opacity-50 mb-2">Titular de la cuenta</p>
          <h3 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none truncate">{user.name}</h3>
        </div>

        <div className="mt-8 flex justify-between items-end relative z-10">
          <div>
            <p className="text-[10px] md:text-[12px] font-black tracking-[0.5em] uppercase opacity-50 mb-2">Tus Puntos</p>
            <p className="text-5xl md:text-7xl font-black tracking-tighter">⭐ {user.points.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 🎁 SECCIÓN DE CANJE DE PUNTOS ACTUALIZADA */}
      <section className="mt-20 py-16 px-6 md:px-12 bg-white border-8 border-black rounded-[60px] shadow-[15px_15px_0px_0px_rgba(244,143,177,1)] relative">
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="bg-[#FFD93D] w-24 h-24 rounded-full border-4 border-black flex items-center justify-center shadow-xl -mt-28 transform -rotate-12 group-hover:rotate-0 transition-transform">
            <span className="text-5xl">🎁</span>
          </div>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic leading-none">Canje de Regalos</h3>
          <p className="text-sm md:text-xl text-black/60 font-black uppercase tracking-widest">
            ¡Tenés <span className="text-black bg-[#FFD93D] px-2 italic">⭐ {user.points.toLocaleString()}</span> para canjear hoy!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Opción 1: 5% */}
          <div className="flex flex-col items-center p-8 border-4 border-black rounded-[40px] bg-[#FFF9FB] hover:translate-y-[-10px] transition-all">
            <span className="text-5xl mb-4">🎟️</span>
            <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">100 PUNTOS</p>
            <h4 className="text-3xl font-black mb-6 italic leading-none">5% DESC.</h4>
            <button 
              disabled={user.points < 100 || isProcessing}
              onClick={() => handleRedeem(100, '5% OFF', 0.05, 'percent')}
              className={`w-full py-5 rounded-full text-sm font-black uppercase tracking-widest border-4 border-black transition-all ${
                user.points >= 100 
                ? 'bg-[#FFD93D] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F48FB1] hover:text-white' 
                : 'bg-gray-100 opacity-30 cursor-not-allowed'
              }`}
            >
              ¡LO QUIERO!
            </button>
          </div>

          {/* Opción 2: 10% */}
          <div className="flex flex-col items-center p-8 border-4 border-black rounded-[40px] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:translate-y-[-10px] transition-all">
            <span className="text-5xl mb-4">🔥</span>
            <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">200 PUNTOS</p>
            <h4 className="text-3xl font-black mb-6 italic leading-none">10% DESC.</h4>
            <button 
              disabled={user.points < 200 || isProcessing}
              onClick={() => handleRedeem(200, '10% OFF', 0.10, 'percent')}
              className={`w-full py-5 rounded-full text-sm font-black uppercase tracking-widest border-4 border-black transition-all ${
                user.points >= 200 
                ? 'bg-[#FFD93D] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F48FB1] hover:text-white' 
                : 'bg-gray-100 opacity-30 cursor-not-allowed'
              }`}
            >
              ¡LO QUIERO!
            </button>
          </div>

          {/* Opción 3: Especial */}
          <div className="flex flex-col items-center p-8 border-4 border-black rounded-[40px] bg-[#FFF9FB] hover:translate-y-[-10px] transition-all">
            <span className="text-5xl mb-4">💎</span>
            <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">300 PUNTOS</p>
            <h4 className="text-3xl font-black mb-6 italic leading-none">$1.500 OFF</h4>
            <button 
              disabled={user.points < 300 || isProcessing}
              onClick={() => handleRedeem(300, '$1500 OFF', 1500, 'fixed')}
              className={`w-full py-5 rounded-full text-sm font-black uppercase tracking-widest border-4 border-black transition-all ${
                user.points >= 300 
                ? 'bg-[#FFD93D] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F48FB1] hover:text-white' 
                : 'bg-gray-100 opacity-30 cursor-not-allowed'
              }`}
            >
              ¡LO QUIERO!
            </button>
          </div>
        </div>

        <p className="mt-12 text-[11px] font-black uppercase text-[#F48FB1] tracking-[0.3em] leading-relaxed">
          * El beneficio se aplicará automáticamente en tu próximo carrito. <br/>
          Válido solo para compras online en Matita.
        </p>
      </section>

      {/* Botón Salir Socio */}
      <div className="mt-24">
        <button 
          onClick={onLogout}
          className="group flex items-center gap-4 mx-auto px-12 py-6 bg-black text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-2xl active:scale-95"
        >
          <span>Cerrar Sesión de Socio</span>
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
        </button>
      </div>
    </div>
  );
};

export default ClubView;
