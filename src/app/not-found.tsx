"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[120px] md:text-[180px] font-light leading-none tracking-tighter text-[var(--color-text)] opacity-20 select-none">
            404
          </h1>
          
          <div className="mt-[-20px] md:mt-[-40px]">
            <h2 className="text-[clamp(18px,1vw+1rem,24px)] font-normal text-[var(--color-text-hover)] lowercase tracking-widest">
              página no encontrada
            </h2>
            
            <p className="mt-6 text-[var(--color-text)] text-sm md:text-base lowercase max-w-xs mx-auto leading-relaxed">
              El enlace que sigues puede estar roto o la página puede haber sido eliminada.
            </p>
            
            <div className="mt-12">
              <Link 
                href="/" 
                className="inline-block border border-[var(--color-text)] px-8 py-3 text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white transition-all duration-300 text-xs uppercase tracking-[0.3em]"
              >
                volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}