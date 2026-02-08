
import React from 'react';
import { CONTACT_INFO, LOGO_URL } from '../constants';

const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="text-center mb-12 relative">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-[#c5a35d] bg-white shadow-lg">
           <img src={LOGO_URL} className="w-full h-full object-cover" alt="Esencia Matita" />
        </div>
        <h2 className="serif text-5xl md:text-7xl text-[#0a3d31] mb-2 tracking-tighter">Esencia <span className="italic text-[#c5a35d]">Matita</span>.</h2>
        <div className="w-16 h-0.5 bg-[#c5a35d] mx-auto mb-3"></div>
        <p className="text-[#c5a35d] uppercase tracking-[0.4em] font-bold text-[9px]">Altos de La Calera / Córdoba</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        <div className="space-y-6">
          <p className="text-2xl serif italic text-[#0a3d31]/60 leading-tight">
            "Un rincón donde lo analógico cobra vida."
          </p>
          <p className="text-[#0a3d31]/70 leading-relaxed text-sm">
            Matita combina la precisión técnica con la calidez de la mercería boutique. No somos una librería común; curamos cada pieza pensando en mentes creativas.
          </p>
          <div className="p-8 bg-[#0a3d31] text-white rounded-[40px] shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
             <h4 className="font-bold text-[#c5a35d] uppercase tracking-widest text-[9px] mb-3 relative z-10">Retiro en Boutique</h4>
             <p className="text-xs opacity-70 leading-relaxed mb-6 relative z-10">Valoramos la experiencia física de elegir. Te invitamos a nuestra boutique para que sientas el papel y pruebes las plumas antes de llevarlas.</p>
             <div className="flex items-center gap-3 text-[#c5a35d] text-[10px] font-bold tracking-widest relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <span>Simón Bolivar 1206, Local 2 y 3</span>
             </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="rounded-[60px] overflow-hidden shadow-2xl border-4 border-white bg-white aspect-video lg:aspect-square">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13627.574450220725!2d-64.35931746658284!3d-31.36191487929823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d61158a0b1287%3A0xbf3671aeb05d68a5!2sLibrer%C3%ADa%20MATITA!5e0!3m2!1ses!2sar!4v1769298256632!5m2!1ses!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              title="Ubicación Matita"
            ></iframe>
          </div>
          <div className="text-center">
            <a href={CONTACT_INFO.mapLink} target="_blank" className="text-[9px] font-bold uppercase tracking-widest border-b-2 border-[#c5a35d] pb-1 hover:text-[#c5a35d] transition-colors">Abrir en Google Maps</a>
          </div>
        </div>
      </div>

      <div className="bg-[#c5a35d] text-[#0a3d31] rounded-[80px] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h3 className="serif text-4xl md:text-5xl mb-6 relative z-10 leading-tight">Vení a visitarnos a Altos.</h3>
        <p className="max-w-md mx-auto opacity-70 text-sm mb-10 italic relative z-10 leading-relaxed">
          Desde impresiones de alta precisión hasta el regalo más delicado, estamos acá para acompañar cada etapa de tu vida creativa.
        </p>
        <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" className="inline-block bg-[#0a3d31] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-transform relative z-10">Consultar Disponibilidad</a>
      </div>
    </div>
  );
};

export default AboutView;
