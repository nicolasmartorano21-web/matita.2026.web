import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ICONS, LOGO_URL } from '../constants';

interface LoginScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuest }) => {
  // Mantenemos tu fuente de admin como base por instrucción previa
  const adminFontStyle = { fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif' };

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorInfo, setErrorInfo] = useState<{message: string, type: 'error' | 'info' | 'unconfirmed'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorInfo(null);

    try {
      if (!supabase || !isSupabaseConfigured) {
        onLogin();
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() }
          }
        });
        if (error) throw error;
        
        setErrorInfo({
          type: 'info',
          message: "¡Casi listo! Enviamos un mail a tu casilla. Revisá SPAM si no lo ves."
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setErrorInfo({
              type: 'unconfirmed',
              message: "Tu email aún no fue confirmado. Revisá tu correo."
            });
            return;
          }
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Datos incorrectos. Revisá el mail y la contraseña.");
          }
          throw error;
        }
        onLogin();
      }
    } catch (error: any) {
      setErrorInfo({
        type: 'error',
        message: error.message || "Algo falló. Probá de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setErrorInfo({
        type: 'info',
        message: "¡Correo reenviado! Revisá tu SPAM."
      });
    } catch (err: any) {
      alert("Error al reenvíar: " + err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div 
      style={adminFontStyle} 
      className="fixed inset-0 z-[200] bg-[#f9f7f2] flex flex-col items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-[450px] animate-fade-in py-8 flex flex-col items-center">
        
        {/* Header con Logo Refinado */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-[#c5a35d]/20 shadow-sm mb-4 bg-white p-4 flex items-center justify-center transition-transform hover:scale-105">
            <img 
              src={LOGO_URL} 
              className="w-full h-full object-contain" 
              alt="Matita Logo"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#0a3d31] tracking-tight mb-1">Matita</h1>
          <p className="text-[#c5a35d] uppercase tracking-[0.3em] text-[10px] md:text-[12px] font-semibold">Boutique Literaria</p>
        </div>
        
        {/* Card de Login Premium */}
        <div className="w-full bg-white p-8 md:p-12 rounded-[40px] shadow-[0px_10px_30px_rgba(10,61,49,0.05)] border border-[#c5a35d]/10 relative">
          
          <h2 className="text-3xl md:text-4xl text-[#0a3d31] mb-2 font-serif text-center">
            {isSignUp ? 'Crear Cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-[13px] text-[#7d7d7d] mb-8 text-center">
            {isSignUp ? 'Sumate a nuestra comunidad de lectores.' : 'Ingresa tus credenciales para continuar.'}
          </p>
          
          {errorInfo && (
            <div className={`mb-6 p-4 rounded-2xl text-[13px] border text-center ${
              errorInfo.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
              errorInfo.type === 'unconfirmed' ? 'bg-[#fff8e7] text-[#f6a118] border-[#fadb31]' :
              'bg-[#fde2e4] text-[#ea7e9c] border-[#ea7e9c]/20'
            }`}>
              <p className="mb-3">{errorInfo.message}</p>
              {errorInfo.type === 'unconfirmed' && (
                <button 
                  onClick={handleResend}
                  disabled={resending}
                  className="bg-[#0a3d31] text-white px-6 py-2 rounded-full text-[11px] hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {resending ? 'Reenviando...' : 'Reenviar Email'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <input 
                  type="text" 
                  placeholder="Nombre completo"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#f9f7f2] border-none rounded-xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-[#c5a35d]/30 transition-all placeholder:text-[#7d7d7d]/50"
                />
              </div>
            )}
            <div>
              <input 
                type="email" 
                placeholder="Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#f9f7f2] border-none rounded-xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-[#c5a35d]/30 transition-all placeholder:text-[#7d7d7d]/50"
              />
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Contraseña"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#f9f7f2] border-none rounded-xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-[#c5a35d]/30 transition-all placeholder:text-[#7d7d7d]/50 pr-14"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d7d7d] hover:text-[#0a3d31] transition-colors p-2"
              >
                {showPassword ? <ICONS.EyeSlash className="w-5 h-5" /> : <ICONS.Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f6a118] to-[#fadb31] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-[14px] hover:shadow-lg hover:shadow-[#f6a118]/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? 'Procesando...' : (isSignUp ? 'Registrarme' : 'Entrar')}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorInfo(null);
              }}
              className="text-[13px] text-[#0a3d31] font-medium hover:text-[#ea7e9c] transition-all"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
            
            <div className="flex items-center justify-center gap-3">
               <div className="h-[1px] bg-[#c5a35d]/20 w-10"></div>
               <span className="text-[11px] text-[#7d7d7d] uppercase tracking-widest">o</span>
               <div className="h-[1px] bg-[#c5a35d]/20 w-10"></div>
            </div>

            <button 
              onClick={onGuest}
              className="text-[12px] text-[#c5a35d] font-semibold uppercase tracking-widest hover:text-[#0a3d31] transition-colors py-2 block w-full text-center"
            >
              Continuar como invitado
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[#7d7d7d]/40 text-[10px] uppercase tracking-[0.4em]">
          Matita • Librería Boutique
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
