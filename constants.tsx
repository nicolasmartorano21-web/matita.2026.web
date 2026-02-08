import React from 'react';

// ACTUALIZADO: Mantengo COLORS original pero preparo la nueva paleta para la transición visual
export const COLORS = {
  primary: '#0a3d31', // Verde Oscuro Boutique (Original)
  secondary: '#c5a35d', // Dorado Premium (Original)
  background: '#f9f7f2', // Crema Natural (Original)
  accent: '#f3f0e8',
  // NUEVO: Paleta de colores "Matita Boutique" (Sin Verdes)
  brandYellow: '#FFD93D', 
  brandPink: '#F48FB1',
  brandBlack: '#000000',
  brandCream: '#FFF9FB',
};

// NUEVO: Categorías para uso global en la App
export const PRODUCT_CATEGORIES = [
  'Escolar',
  'Oficina',
  'Técnica',
  'Mercería',
  'Juguetería',
  'Regalería'
];

export const LOGO_URL = "https://i.ibb.co/nN1YJp9g/logo2.png";
export const ADMIN_PASSWORD = 'libreriaM2026';

export const CONTACT_INFO = {
  whatsapp: '5493517587003',
  instagram: 'libreriamatita',
  address: 'Simón Bolivar 1206 Local 2 y 3, Altos de la Calera, Córdoba',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Simón+Bolivar+1206+Altos+de+la+Calera+La+Calera+Córdoba',
  alias: 'MATITA.BOUTIQUE.MP',
};

export const PAYMENT_METHODS = [
  { id: 'transfer', label: 'Transferencia / Alias', icon: '🏦', detail: 'Alias: Matita.2020.mp o Matita.2023' },
  { id: 'cash', label: 'Efectivo en Local', icon: '💵', detail: '10% de cortesía extra' },
  { id: 'card', label: 'Tarjeta de Crédito/Débito', icon: '💳', detail: 'En el local vía Posnet' }
];

export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// NUEVO: Constante para puntos del Club
export const CLUB_REWARDS = {
  STEP_1: { points: 100, label: '5% de descuento', value: 0.05, type: 'percent' },
  STEP_2: { points: 200, label: '10% de descuento', value: 0.10, type: 'percent' },
  STEP_3: { points: 300, label: 'Descuento fijo $1.500', value: 1500, type: 'fixed' },
};

export const ICONS = {
  Cart: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 16.825a1.875 1.875 0 1 1-3.75 0l-1.113-16.825a1.875 1.875 0 1 1 3.75 0Z" />
    </svg>
  ),
  User: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Admin: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  Eye: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  EyeSlash: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
};
