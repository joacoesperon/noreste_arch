"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="flex items-center fixed top-0 left-0 w-full min-h-[60px] md:min-h-[78px] z-[999] bg-transparent transition-all duration-300">
      <div className="mx-auto px-4 md:px-8 max-w-[1600px] flex items-center justify-between md:justify-center relative h-full w-full">
        
        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center justify-between w-full h-full">
          {/* Menu Izquierdo - 35% ancho */}
          <ul className="flex justify-start w-[35%] list-none p-0 m-0">
            <li>
              <Link href="/indice" className={`text-[#C4C4C4] hover:text-[#808080] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase transition-all duration-300 relative py-2 block after:content-[''] after:block after:border-b after:border-[#C4C4C4] after:h-[1px] after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100 ${pathname === "/indice" ? 'after:scale-x-100' : 'after:scale-x-0'}`}>
                index
              </Link>
            </li>
          </ul>

          {/* Logo - Centrado con la técnica exacta de Tenue */}
          <Link 
            href="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-width-[220px] text-center text-[#C4C4C4] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase tracking-normal font-sans z-[22] transition-all duration-350 hover:text-[#808080] group"
          >
            noreste arch
            <span className="block border-b border-[#C4C4C4] h-[1px] w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left"></span>
          </Link>

          {/* Menu Derecho - 35% ancho */}
          <ul className="flex justify-end w-[35%] list-none p-0 m-0">
            <li>
              <Link href="/info" className={`text-[#C4C4C4] hover:text-[#808080] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase transition-all duration-300 relative py-2 block after:content-[''] after:block after:border-b after:border-[#C4C4C4] after:h-[1px] after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100 ${pathname === "/info" ? 'after:scale-x-100' : 'after:scale-x-0'}`}>
                info
              </Link>
            </li>
          </ul>
        </nav>

        {/* Móvil: Menu Hamburguesa */}
        <div 
          className="md:hidden relative w-7 h-5 cursor-pointer z-[21]"
          onClick={toggleMenu}
        >
          <span className={`block w-full h-[2px] bg-black transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : 'mb-[3px]'}`}></span>
          <span className={`block w-full h-[2px] bg-black transition-all duration-300 ${menuOpen ? 'opacity-0' : 'mb-[3px]'}`}></span>
          <span className={`block w-full h-[2px] bg-black transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
        </div>
      </div>
    </header>
  );
}