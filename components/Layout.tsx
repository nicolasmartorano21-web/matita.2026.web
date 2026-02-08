import React, { useState } from 'react';
import { ICONS, CONTACT_INFO, LOGO_URL } from '../constants';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onLoginClick: () => void;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  cartCount, 
  onCartClick, 
  onAdminClick, 
  onLoginClick, 
  onNavigate,
  currentView,
  isLoggedIn
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };

  const navItems = [
    { id: 'catalog', label: 'Catálogo' },
    { id: 'news', label: 'Novedades' },
    { id: 'favorites', label: 'Deseados' },
    { id: 'club', label: 'Mi Club' },
    { id: 'suggestions', label: 'Ideas' },
    { id: 'about', label: 'Boutique' }
  ];

  const handleNav = (id: ViewType) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div style={adminFontStyle} className="min-h-screen flex flex-col bg-[#FFF9FB] relative overflow-x-hidden text-black">
      
      {/* --- BOTONES FLOTANTES --- */}
      <div className="fixed bottom-6 right-4 z-[150] flex flex-col gap-4">
        <a href={`https://instagram.com/${CONTACT_INFO.instagram}`} target="_blank" rel="noreferrer" 
           className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-xl border-4 border-black hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noreferrer" 
           className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-black hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.196 1.608 6.03L0 24l6.117-1.605a11.847 11.847 0 005.933 1.598h.005c6.635 0 12.045-5.407 12.049-12.044a11.821 11.821 0 00-3.535-8.503z"/></svg>
        </a>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-[100] bg-white border-b-8 border-[#F48FB1] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 bg-[#FFD93D] rounded-full border-2 border-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('catalog')}>
              <img src={LOGO_URL} className="w-10 h-10 md:w-14 md:h-14 object-contain border-2 border-black rounded-full p-1" alt="Logo" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-black leading-none">MATITA</h1>
                <p className="text-[8px] text-[#F48FB1] uppercase font-black">Boutique Literaria</p>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleNav(item.id as ViewType)} 
                className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border-2 transition-all ${currentView === item.id ? 'bg-[#FFD93D] border-black shadow-md' : 'border-transparent hover:text-[#F48FB1]'}`}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onAdminClick} className="p-2 opacity-30 hover:opacity-100"><ICONS.Admin className="w-5 h-5" /></button>
            <button onClick={() => handleNav('favorites')} className={`p-2 ${currentView === 'favorites' ? 'text-[#F48FB1]' : 'text-black/40'}`}><ICONS.Heart className="w-5 h-5" /></button>
            <button onClick={onLoginClick} className={`p-2 ${isLoggedIn ? 'text-[#F48FB1]' : 'text-black/40'}`}><ICONS.User className="w-5 h-5" /></button>
            <button onClick={onCartClick} className="relative p-3 bg-[#FFD93D] border-2 border-black rounded-full shadow-md active:scale-90 transition-transform">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F48FB1] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-black animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#FFD93D] border-t-4 border-black mt-4 p-4 flex flex-col gap-2 rounded-xl">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleNav(item.id as ViewType)} className="font-black uppercase text-sm py-2 border-b border-black/10 last:border-0 text-left">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* --- CONTENIDO --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-10">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white p-10 border-t-[10px] border-[#FFD93D]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h2 className="text-2xl font-black italic">MATITA</h2>
            <p className="text-xs opacity-60 italic">Curaduría analógica para mentes creativas.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
             <p className="text-xs font-black uppercase text-[#FFD93D]">📍 Encuéntranos</p>
             <p className="text-sm">Simón Bolivar 1206, Locales 2 y 3<br/>La Calera, Córdoba</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <a href={CONTACT_INFO.mapLink} target="_blank" rel="noreferrer" className="bg-[#F48FB1] text-white px-6 py-2 rounded-full text-[10px] font-black border-2 border-black shadow-lg">VER EN MAPA</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
