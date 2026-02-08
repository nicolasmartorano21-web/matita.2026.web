
import { Product, Category, Review, User, Coupon, Sale, CartItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export const database = {
  async uploadFile(file: File): Promise<string> {
    if (!supabase) throw new Error("Supabase no inicializado");
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;
    try {
      const { error } = await supabase.storage.from('productos').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      throw new Error(err.message || "Error al subir archivo.");
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase.from('products').select('*, reviews(*)');
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        curatorNote: p.curator_note,
        price: Number(p.price),
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        category: p.category as Category,
        imageUrl: p.image_url,
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
        isNew: !!p.is_new,
        isVideo: !!p.is_video,
        stock: Number(p.stock || 0),
        reviews: (p.reviews || []).map((r: any) => ({ id: r.id, userName: r.user_name, rating: r.rating, comment: r.comment, date: r.date }))
      }));
    } catch (err) {
      return [];
    }
  },

  // GESTIÓN DE CARRITO (CRÍTICA)
  async getUserCart(userId: string): Promise<CartItem[]> {
    if (userId === 'local') return [];
    const { data, error } = await supabase.from('cart_items').select('quantity, products(*)').eq('user_id', userId);
    if (error) return [];
    return (data || []).map(item => ({
      ...item.products,
      quantity: item.quantity,
      id: item.products.id,
      name: item.products.name,
      price: Number(item.products.price),
      imageUrl: item.products.image_url,
      category: item.products.category
    })) as CartItem[];
  },

  async syncCartItem(userId: string, productId: string, quantity: number) {
    if (userId === 'local') return;
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return;
    }
    await supabase.from('cart_items').upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' });
  },

  async removeFromCart(userId: string, productId: string) {
    if (userId === 'local') return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
    if (error) console.error("Error removing from cart DB:", error);
  },

  async clearCart(userId: string) {
    if (userId === 'local') return;
    await supabase.from('cart_items').delete().eq('user_id', userId);
  },

  // FAVORITOS
  async getUserFavorites(userId: string): Promise<string[]> {
    if (userId === 'local') return [];
    const { data, error } = await supabase.from('user_favorites').select('product_id').eq('user_id', userId);
    if (error) return [];
    return (data || []).map(f => f.product_id);
  },

  async toggleFavorite(userId: string, productId: string, isFavorite: boolean) {
    if (userId === 'local') return;
    if (isFavorite) {
      await supabase.from('user_favorites').insert([{ user_id: userId, product_id: productId }]);
    } else {
      await supabase.from('user_favorites').delete().eq('user_id', userId).eq('product_id', productId);
    }
  },

  async addProduct(product: Product) {
    await supabase.from('products').insert([{ id: product.id, name: product.name, description: product.description, curator_note: product.curatorNote, price: product.price, old_price: product.oldPrice, category: product.category, image_url: product.imageUrl, gallery: product.gallery || [], stock: product.stock, is_new: product.isNew, is_video: product.isVideo }]);
  },

  async updateProduct(product: Product) {
    await supabase.from('products').update({ name: product.name, description: product.description, curator_note: product.curatorNote, price: product.price, old_price: product.oldPrice, category: product.category, image_url: product.imageUrl, gallery: product.gallery || [], stock: product.stock, is_new: product.isNew, is_video: product.isVideo }).eq('id', product.id);
  },

  async deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
  },

  async getAllProfiles(): Promise<User[]> {
    const { data } = await supabase.from('profiles').select('*').order('points', { ascending: false });
    return (data || []).map(p => ({ id: p.id, email: p.email, name: p.name || 'Socio', points: Number(p.points || 0) }));
  },

  async deleteProfile(id: string) {
    await supabase.from('profiles').delete().eq('id', id);
  },

  async updateProfilePoints(userId: string, newPoints: number) {
    await supabase.from('profiles').update({ points: newPoints }).eq('id', userId);
  },

  async getUser(): Promise<User> {
    const guestUser: User = { id: 'local', email: 'guest@matita.com', name: 'Invitado', points: 0 };
    if (!supabase || !isSupabaseConfigured) return guestUser;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
      if (profile) return { id: profile.id, email: profile.email, name: profile.name || 'Socio', points: Number(profile.points || 0) };
    }
    return guestUser;
  },

  async getAllReviews(): Promise<Review[]> {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({ id: r.id, userName: r.user_name, rating: r.rating, comment: r.comment, date: r.date }));
  },

  async addReview(productId: string, review: Review) {
    await supabase.from('reviews').insert([{ id: review.id, product_id: productId, user_name: review.userName, rating: review.rating, comment: review.comment, date: review.date }]);
  },

  async getAllSuggestions(): Promise<any[]> {
    const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async addSuggestion(suggestion: any) {
    await supabase.from('suggestions').insert([{ id: suggestion.id, text: suggestion.text, type: suggestion.type, date: suggestion.date }]);
  },

  async deleteSuggestion(id: string) {
    await supabase.from('suggestions').delete().eq('id', id);
  },

  async getAllCoupons(): Promise<Coupon[]> {
    const { data } = await supabase.from('coupons').select('*');
    return (data || []).map(c => ({ code: c.code, discount: c.discount }));
  },

  async addCoupon(coupon: Coupon) {
    await supabase.from('coupons').insert([{ code: coupon.code, discount: coupon.discount }]);
  },

  async deleteCoupon(code: string) {
    await supabase.from('coupons').delete().eq('code', code);
  },

  async getAllSales(): Promise<Sale[]> {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    return (data || []).map(s => ({ id: s.id, date: s.date, total: Number(s.total || 0), items_count: s.items_count, items_detail: s.items_detail }));
  },

  async addSale(sale: Sale) {
    await supabase.from('sales').insert([{ id: sale.id, total: sale.total, items_count: sale.itemsCount, items_detail: sale.itemsDetail, date: sale.date }]);
  },

  async deleteSale(id: string) {
    await supabase.from('sales').delete().eq('id', id);
  }
};
