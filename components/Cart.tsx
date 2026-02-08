import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, Sale, User } from '../types';
import { CONTACT_INFO, formatPrice, PAYMENT_METHODS, ICONS } from '../constants';
import { database } from '../lib/database';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSuccess?: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onClose, onUpdateQuantity, onRemove, onSuccess }) => {
  // Estilo de fuente del Admin para mantener coherencia
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' }; // NUEVO

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);

  const GIFT_WRAP_PRICE = 2000;
  const POINTS_CONVERSION = 0.5; 
  const MIN_PURCHASE_FOR_BIENVENIDA = 15000;

  useEffect(() => {
    database.getAllCoupons().then(setAvailableCoupons);
    database.getUser().then(u => {
      if (u && u.id !== 'local') setUser(u);
    });
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // NUEVO: Contador total de productos
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'BIENVENIDA') {
      if (subtotal < MIN_PURCHASE_FOR_BIENVENIDA) {
        alert(`¡Fiera! El cupón BIENVENIDA es para compras mayores a ${formatPrice(MIN_PURCHASE_FOR_BIENVENIDA)}.`);
        return;
      }
      setAppliedDiscount(0.15);
      alert('¡Bienvenido! 15% de descuento boutique aplicado.');
      return;
    }
    const found = availableCoupons.find(c => c.code === code);
    if (found) {
      setAppliedDiscount(found.discount);
      alert(`Descuento del ${found.discount * 100}% aplicado.`);
    } else alert('Cupón no válido o expirado.');
  };

  const couponReduction = subtotal * appliedDiscount;
  const maxPointsDiscount = subtotal * 0.5; 
  const pointsDiscountValue = user && usePoints ? Math.min(user.points * POINTS_CONVERSION, maxPointsDiscount) : 0;
  const pointsUsed = pointsDiscountValue / POINTS_CONVERSION;

  const total = Math.max(0, subtotal - couponReduction - pointsDiscountValue + (isGift ? GIFT_WRAP_PRICE : 0));

  const handleCheckout = async () => {
    const selectedPay = PAYMENT_METHODS.find(p => p.id === paymentMethod);
    
    const newSale: Sale = {
      id: `s_${Date.now()}`,
      date: new Date().toLocaleString(),
      total: total,
      itemsCount: totalItemsCount,
      itemsDetail: items.map(i => `${i.name}${i.selectedColor ? ` (${i.selectedColor})` : ''} (x${i.quantity})`).join(', ') + 
                   (isGift ? ' + Pack Regalo' : '') + 
                   (usePoints ? ` (✨-${pointsUsed} pts)` : '') +
                   ` [Pago: ${selectedPay?.label}]`
    };
    
    await database.addSale(newSale);
    if (user && usePoints) await database.updateProfilePoints(user.id, user.points - pointsUsed);

    const message = `*✨ RESERVA MATITA BOUTIQUE ✨*\n` +
      `--------------------------------\n` +
      `Socio: ${user ? user.name : 'Invitado'}\n\n` +
      items.map(i => `📦 *${i.name}* ${i.selectedColor ? `[${i.selectedColor}]` : ''} (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join('\n') +
      (isGift ? `\n\n🎁 *REGALO:* Pack Premium\n📜 *DEDICATORIA:* "${giftNote}"` : '') +
      (usePoints ? `\n\n✨ *CLUB MATITA:* -${formatPrice(pointsDiscountValue)}` : '') +
      (appliedDiscount > 0 ? `\n🎫 *DESCUENTO:* -${formatPrice(couponReduction)}` : '') +
      `\n\n💳 *MÉTODO DE PAGO:* ${selectedPay?.label}\n` +
      `💰 *TOTAL A ABONAR:* ${formatPrice(total)}\n\n` +
      `_Retiro en: Simón Bolivar 1206, La Calera._`;
    
    window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div style={adminFontStyle} className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-[#0a3d31]/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#f9f7f2] h-full shadow-2xl flex flex-col animate-fade-in border-l-4 border-[#F8BBD0]">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b-4 border-[#FFD93D] bg-white flex justify-between items-center relative">
          <div className="text-center w-full">
            {/* NUEVO: Ícono de carrito y contador */}
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <span className="bg-[#F48FB1] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {totalItemsCount}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black italic leading-none">Tu Bolsa.</h2>
          </div>
          <button onClick={onClose} className="absolute right-6 bg-[#F8BBD0]/30 p-2 rounded-full hover:bg-[#F48FB1] hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-40 opacity-20 italic font-black text-2xl">La bolsa espera ser llenada...</div>
          ) : (
            <>
              {/* Lista de Productos */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedColor || idx}`} className="flex gap-4 items-center group bg-white p-4 rounded-[35px] border-2 border-[#F8BBD0]/30 shadow-sm">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FFD93D] flex-shrink-0">
                      <img src={item.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-black text-[10px] text-black uppercase tracking-tight leading-tight">{item.name}</h3>
                      
                      {/* NUEVO: Mostrar Color Elegido */}
                      {item.selectedColor && (
                        <p className="text-[9px] font-black text-[#F48FB1] uppercase italic mt-1">
                          🎨 Color: {item.selectedColor}
                        </p>
                      )}
                      
                      <p className="font-black text-lg text-black mt-1">{formatPrice(item.price)}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-[#F9F7F2] rounded-full px-3 py-1 border border-black/5 shadow-inner">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-black font-black hover:text-[#F48FB1]">-</button>
                          <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                          <button 
                            // NUEVO: Validación de stock por color (si aplica)
                            onClick={() => {
                              const colorStock = item.colors?.find(c => c.name === item.selectedColor)?.stock ?? item.stock;
                              if (item.quantity < colorStock) {
                                onUpdateQuantity(item.id, 1);
                              } else {
                                alert("¡Opa! Alcanzaste el límite de stock para esta variante.");
                              }
                            }} 
                            className="text-black font-black hover:text-[#F48FB1]"
                          >+</button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-[8px] text-[#F48FB1] font-black uppercase tracking-tighter border-b border-[#F48FB1]/30">Quitar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Club Matita */}
              {user && (
                <div className="bg-black p-6 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="text-[8px] uppercase font-black text-[#FFD93D]">Membresía Socio</p>
                        <p className="text-xs font-black italic">{user.points.toLocaleString()} puntos disponibles</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUsePoints(!usePoints)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${usePoints ? 'bg-[#FFD93D]' : 'bg-white/20'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${usePoints ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Cupones */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase font-black text-black/40 px-2 italic">¿Tenés un código de regalo?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ESCRIBILO ACÁ..."
                    className="flex-grow bg-white border-2 border-[#F8BBD0] rounded-full px-5 py-3 text-[10px] font-black outline-none focus:border-[#FFD93D]"
                  />
                  <button onClick={handleApplyCoupon} className="bg-[#FFD93D] text-black px-6 rounded-full text-[9px] font-black uppercase border-2 border-black hover:bg-black hover:text-white transition-all">OK</button>
                </div>
              </div>

              {/* Pago */}
              <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-black uppercase italic">Pagar con:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_METHODS.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setPaymentMethod(p.id)}
                      className={`w-full p-4 rounded-[25px] border-2 transition-all text-left flex items-center gap-4 ${paymentMethod === p.id ? 'bg-[#FFD93D] border-black shadow-md scale-[1.02]' : 'bg-white border-[#F8BBD0]/40 text-black/40'}`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <p className="text-[9px] font-black uppercase">{p.label}</p>
                        <p className={`text-[8px] font-bold italic ${paymentMethod === p.id ? 'text-black/60' : 'text-black/20'}`}>{p.detail}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regalo */}
              <div className="bg-white p-6 rounded-[35px] border-2 border-[#F8BBD0] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎁</span>
                    <p className="text-[9px] uppercase font-black text-black italic">¿Es para regalo?</p>
                  </div>
                  <button onClick={() => setIsGift(!isGift)} className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${isGift ? 'bg-[#F48FB1]' : 'bg-black/10'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${isGift ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                {isGift && (
                  <textarea 
                    value={giftNote} 
                    onChange={e => setGiftNote(e.target.value)} 
                    placeholder="Escribí tu dedicatoria..." 
                    className="w-full bg-[#F9F7F2] border-2 border-[#F8BBD0] rounded-2xl p-4 text-[10px] font-bold italic outline-none" 
                    rows={2} 
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-8 bg-white border-t-4 border-[#FFD93D] rounded-t-[40px] shadow-2xl space-y-4">
            <div className="space-y-1 text-[10px] font-black uppercase text-black/40">
               <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
               {appliedDiscount > 0 && <div className="flex justify-between text-[#F48FB1]"><span>Cortesía</span><span>-{formatPrice(couponReduction)}</span></div>}
               {usePoints && <div className="flex justify-between text-[#F48FB1]"><span>Club</span><span>-{formatPrice(pointsDiscountValue)}</span></div>}
               {isGift && <div className="flex justify-between"><span>Pack Regalo</span><span>+{formatPrice(GIFT_WRAP_PRICE)}</span></div>}
               
               <div className="pt-4 mt-2 border-t-2 border-black/5 flex justify-between items-end text-black">
                  <span className="text-xl italic font-black">Total</span>
                  <span className="text-3xl font-black tracking-tighter">{formatPrice(total)}</span>
               </div>
            </div>
            <button 
              onClick={handleCheckout} 
              className="w-full bg-[#FFD93D] text-black py-5 rounded-full font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all shadow-xl active:scale-95"
            >
              🚀 Confirmar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
