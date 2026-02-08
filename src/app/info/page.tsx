import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function InfoPage() {
  return (
    <>
      <Header />
      <main className="main clearfix wrapper">
        <div className="page contact pt-[94px] pb-12">
          <section className="container mx-auto px-4 max-w-[1600px]">
            
            {/* Imagen Principal */}
            <div className="image w-full mb-12">
              <Image 
                src="/projects/la-martona/exterior/P1451010.webp" // Placeholder o imagen real de info
                alt="Info Tenue"
                width={1920}
                height={1080}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Grid de Contenido: Mobile (Flex Col) / Desktop (Grid 12 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 pt-4">
              
              {/* Columna "Nosotros" (Md: Col 5, Order 2) */}
              <div className="md:col-span-5 order-2 md:order-2">
                <article>
                  <div className="mb-6">
                    <h3 className="text-[#C4C4C4] font-sans text-[clamp(16px,0.278vw+0.938rem,19px)] font-normal m-0 mb-2">Nosotros</h3>
                  </div>
                  <div className="text-[#C4C4C4] font-sans text-base leading-[1.6]">
                    <p className="mb-4">Es un Estudio de arquitectura y diseño con base en Punta del Este, desde donde desarrollamos proyectos residenciales de diversas escalas.</p>
                    <p>Luego de varios años de práctica en el ámbito local, el Estudio ha logrado construir un lenguaje propio mediante el uso de la madera como material predominante, tanto desde el punto de vista formal como constructivo. Nuestros proyectos se caracterizan por una lectura precisa del contexto, el clima y la geografía esteña.</p>
                  </div>
                </article>
              </div>

              {/* Columna "Contacto" (Md: Col 4, Order 1) */}
              <div className="md:col-span-4 order-1 md:order-1">
                <article>
                  <div className="mb-6">
                    <h1 className="text-[#C4C4C4] font-sans text-[clamp(16px,0.278vw+0.938rem,19px)] font-normal m-0 mb-2">Contacto</h1>
                  </div>
                  <div className="text-[#C4C4C4] font-sans text-base leading-[1.6]">
                    <ul className="list-none p-0 m-0">
                      <li className="mb-0">
                        <a href="mailto:tenue@tenue.uy" className="underline hover:text-[#808080] transition-colors">tenue@tenue.uy</a>
                      </li>
                      <li className="mb-4">
                        <a href="https://wa.me/59893593767" target="_blank" className="underline hover:text-[#808080] transition-colors">
                          + 598 93 593 767
                        </a>
                      </li>
                      <li className="mb-4">
                        Paseo de La Barra,<br />
                        Local 28,<br />
                        La Barra, Uruguay.
                      </li>
                    </ul>
                    <div className="mt-4">
                      <ul className="list-none p-0 m-0">
                        <li>@tenue_estudio</li>
                      </ul>
                    </div>
                  </div>
                </article>
              </div>

              {/* Columna "Escribinos" (Md: Col 3, Order 3) */}
              <div className="md:col-span-3 order-3 md:order-3 text-left md:text-right">
                <a href="mailto:tenue@tenue.uy" className="text-[#C4C4C4] font-sans text-base hover:underline transition-colors">
                  Escribinos!
                </a>
              </div>

            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}