
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import ProductModal from './components/ProductModal';
import AboutView from './components/AboutView';
import ReviewsView from './components/ReviewsView';
import SuggestionsView from './components/SuggestionsView';
import ClubView from './components/ClubView';
import FavoritesView from './components/FavoritesView';
import { Product, CartItem, Category, User, ViewType } from './types';
import { database } from './lib/database';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LOGO_URL } from './constants';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [loading, setLoading] = useState(true);
  // NUEVO: Estado para gestionar cupones activos del Club
  const [activeCoupon, setActiveCoupon] = useState<any>(null);

  // Sincronización LocalStorage (Solo Invitados)
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      localStorage.setItem('matita_cart', JSON.stringify(cart));
      localStorage.setItem('matita_favs', JSON.stringify(favorites));
    }
  }, [cart, favorites, loading, isLoggedIn]);

  // NUEVO: Efecto para cargar cupones activos del Club al iniciar
  useEffect(() => {
    const savedCoupon = localStorage.getItem('active_coupon');
    if (savedCoupon) {
      setActiveCoupon(JSON.parse(savedCoupon));
    }
  }, []);

  const refreshProducts = async () => {
    try {
      const prods = await database.getAllProducts();
      setProducts([...(prods || [])]);
    } catch (e) {
      console.error("Error refreshing products:", e);
    }
  };

  const checkSession = async () => {
    try {
      const userData = await database.getUser();
      setUser(userData);
      if (userData.id !== 'local') {
        setIsLoggedIn(true);
        setShowLogin(false);
        
        // Carga prioritaria desde Supabase
        const [dbCart, dbFavs] = await Promise.all([
          database.getUserCart(userData.id),
          database.getUserFavorites(userData.id)
        ]);
        
        setCart(dbCart);
        setFavorites(dbFavs);
        
        // Limpiamos local para evitar colisiones
        localStorage.removeItem('matita_cart');
        localStorage.removeItem('matita_favs');
      }
    } catch (e) {
      console.error("Error fetching session:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshProducts();
        
        // Carga local inicial preventiva para invitados
        if (!localStorage.getItem('supabase.auth.token')) {
          const savedCart = localStorage.getItem('matita_cart');
          const savedFavs = localStorage.getItem('matita_favs');
          if (savedCart) setCart(JSON.parse(savedCart));
          if (savedFavs) setFavorites(JSON.parse(savedFavs));
        }
        
        if (supabase && isSupabaseConfigured) {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
              await checkSession();
            } else {
              setIsLoggedIn(false);
              setUser(null);
              const localCart = localStorage.getItem('matita_cart');
              const localFavs = localStorage.getItem('matita_favs');
              setCart(localCart ? JSON.parse(localCart) : []);
              setFavorites(localFavs ? JSON.parse(localFavs) : []);
            }
          });

          const { data } = await supabase.auth.getSession();
          if (data?.session) await checkSession();
        }
      } catch (error) {
        console.error("Error init:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleGuestEntry = () => {
    setShowLogin(false); 
    setIsLoggedIn(false);
  };

  const handleLogout = async () => {
    if (supabase && isSupabaseConfigured) await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setShowLogin(true);
    setCurrentView('catalog');
    // NUEVO: Limpiar cupones al cerrar sesión por seguridad
    localStorage.removeItem('active_coupon');
    setActiveCoupon(null);
  };

  const handleAddToCart = useCallback(async (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const newQty = existing ? existing.quantity + 1 : 1;
    
    if (isLoggedIn && user) {
      await database.syncCartItem(user.id, product.id, newQty);
    }
    
    setCart(prev => {
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, [cart, isLoggedIn, user]);

  const handleUpdateQuantity = useCallback(async (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    
    if (isLoggedIn && user) {
      await database.syncCartItem(user.id, id, newQty);
    }
    
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  }, [cart, isLoggedIn, user]);

  const handleRemoveFromCart = useCallback(async (id: string) => {
    if (isLoggedIn && user) {
      await database.removeFromCart(user.id, id);
    }
    setCart(prev => prev.filter(item => item.id !== id));
  }, [isLoggedIn, user]);

  const handleClearCart = useCallback(async () => {
    if (isLoggedIn && user) {
      await database.clearCart(user.id);
    }
    setCart([]);
    localStorage.removeItem('matita_cart');
    // NUEVO: Al limpiar el carrito tras una compra exitosa, removemos el cupón usado
    localStorage.removeItem('active_coupon');
    setActiveCoupon(null);
  }, [isLoggedIn, user]);

  const handleToggleFavorite = useCallback(async (productId: string) => {
    const isFav = favorites.includes(productId);
    const newFavs = isFav ? favorites.filter(id => id !== productId) : [...favorites, productId];
    
    if (isLoggedIn && user) {
      await database.toggleFavorite(user.id, productId, !isFav);
    }
    setFavorites(newFavs);
  }, [favorites, isLoggedIn, user]);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setTimeout(refreshProducts, 2000);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col items-center justify-center p-10"> {/* NUEVO: Color de fondo actualizado */}
      <div className="w-20 h-20 rounded-full border-4 border-black bg-white p-4 flex items-center justify-center animate-bounce shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita" />
      </div>
    </div>
  );

  if (showLogin) return <LoginScreen onLogin={() => setShowLogin(false)} onGuest={handleGuestEntry} />;

  return (
    <Layout 
      cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
      onCartClick={() => setIsCartOpen(true)}
      onAdminClick={() => setIsAdminOpen(true)}
      onLoginClick={() => handleNavigate('club')}
      onNavigate={handleNavigate}
      currentView={currentView}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    >
      {currentView === 'catalog' && (
        <div className="animate-fade-in">
          <section className="mb-12 md:mb-20 text-center max-w-5xl mx-auto px-4">
            {/* NUEVO: Estilo visual actualizado para títulos */}
            <h2 style={{ fontFamily: '"Segoe Print", cursive' }} className="text-5xl md:text-9xl font-black text-black leading-tight md:leading-[0.85] mb-10 md:mb-16 tracking-tighter italic">
              Objetos <br /> <span className="text-[#F48FB1]">Boutique</span>.
            </h2>
            <div className="flex overflow-x-auto no-scrollbar pb-6 md:flex-wrap md:justify-center gap-4">
              {['Todos', ...Object.values(Category)].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat as any)} 
                  className={`whitespace-nowrap px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all border-4 ${selectedCategory === cat ? 'bg-[#FFD93D] text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black/40 border-black/10 hover:border-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
          
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-32">
            {products.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory).map(product => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                <ProductCard 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </section>
        </div>
      )}

      {currentView === 'news' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-32 animate-fade-in">
          {products.filter(p => p.isNew).map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart} 
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </section>
      )}

      {currentView === 'favorites' && (
        <FavoritesView 
          products={products.filter(p => favorites.includes(p.id))} 
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          onNavigate={() => handleNavigate('catalog')}
        />
      )}

      {currentView === 'suggestions' && <SuggestionsView />}
      {currentView === 'reviews' && <ReviewsView />}
      {currentView === 'about' && <AboutView />}
      {currentView === 'club' && <ClubView user={user} onLogout={handleLogout} />}

      {isCartOpen && (
        <Cart 
          items={cart} 
          onClose={() => setIsCartOpen(false)} 
          onUpdateQuantity={handleUpdateQuantity} 
          onRemove={handleRemoveFromCart}
          onSuccess={handleClearCart}
          // NUEVO: Pasar el cupón activo al carrito para su visualización/aplicación
          activeCoupon={activeCoupon}
        />
      )}
      
      {isAdminOpen && (
        <AdminPanel 
          products={products} 
          onClose={() => setIsAdminOpen(false)} 
          onAddProduct={refreshProducts}
          onUpdateProduct={refreshProducts}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
    </Layout>
  );
};

export default App;
