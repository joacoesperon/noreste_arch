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
    <header className="header flex items-center fixed top-0 left-0 w-full min-h-[60px] md:min-h-[78px] z-[999] bg-transparent transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] flex items-center justify-between md:justify-center relative h-full">
        
        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center justify-between w-full h-full">
          {/* Menu Izquierdo - 35% ancho */}
          <ul className="flex justify-start w-[35%] list-none p-0 m-0">
            <li className={pathname === "/indice" ? "current-menu-item" : ""}>
              <Link href="/indice" className="text-[#C4C4C4] hover:text-[#808080] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase transition-all duration-300 relative py-2 block after:content-[''] after:block after:border-b after:border-[#C4C4C4] after:scale-x-0 after:h-[1px] after:transition-transform after:duration-300 hover:after:scale-x-100 after:origin-left">
                index
              </Link>
            </li>
          </ul>

          {/* Logo - Centrado con la técnica exacta de Tenue */}
          <Link 
            href="/" 
            className="header-title absolute left-[calc(50%-110px)] top-[10px] md:top-[20px] min-width-[220px] text-center text-[#C4C4C4] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase tracking-normal font-sans z-[22] transition-all duration-350"
          >
            noreste arch
          </Link>

          {/* Menu Derecho - 35% ancho */}
          <ul className="flex justify-end w-[35%] list-none p-0 m-0">
            <li className={pathname === "/info" ? "current-menu-item" : ""}>
              <Link href="/info" className="text-[#C4C4C4] hover:text-[#808080] text-[clamp(16px,0.278vw+0.938rem,19px)] lowercase transition-all duration-300 relative py-2 block after:content-[''] after:block after:border-b after:border-[#C4C4C4] after:scale-x-0 after:h-[1px] after:transition-transform after:duration-300 hover:after:scale-x-100 after:origin-left">
                info
              </Link>
            </li>
          </ul>
        </nav>

        {/* Móvil: Menu Hamburguesa */}
        <div 
          className={`nav-menu md:hidden relative w-7 h-5 cursor-pointer z-[21] ${menuOpen ? 'active' : ''}`}
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