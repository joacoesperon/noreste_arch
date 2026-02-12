import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function InfoPage() {
  return (
    <>
      <Header />
      <main className="w-full min-h-[80vh] mt-[70px]">
        <div className="py-[30px] md:py-[60px]">
          <section className="mx-auto px-4 md:px-8 max-w-[1600px]">
            
            {/* Imagen Principal */}
            <div className="w-full mb-12">
              <Image 
                src="/projects/la-martona/images/P1451010.webp"
                alt="Info"
                width={1920}
                height={1080}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Grid de 2 Columnas Centrado */}
            <div className="max-w-[1000px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 pt-4">
                
                {/* Columna "Contacto" */}
                <div className="order-1">
                  <article>
                    <div className="mb-2">
                      <h1 className="text-[var(--color-text)] text-[clamp(16px,0.278vw+0.938rem,19px)] font-normal m-0">Contacto</h1>
                    </div>
                    <div className="text-[var(--color-text)] text-base leading-[1.6]">
                      <ul className="list-none p-0 m-0">
                        <li className="mb-0">
                          <a href="mailto:tenue@tenue.uy" className="underline hover:text-[var(--color-text-hover)] transition-colors">tenue@tenue.uy</a>
                        </li>
                        <li className="mb-3">
                          <a href="https://wa.me/59893593767" target="_blank" className="underline hover:text-[var(--color-text-hover)] transition-colors">
                            + 598 93 593 767
                          </a>
                        </li>
                        <li className="mb-3">
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

                {/* Columna "Nosotros" */}
                <div className="order-2">
                  <article>
                    <div className="mb-2">
                      <h3 className="text-[var(--color-text)] text-[clamp(16px,0.278vw+0.938rem,19px)] font-normal m-0">Nosotros</h3>
                    </div>
                    <div className="text-[var(--color-text)] text-base leading-[1.6]">
                      <p className="mb-4">Es un Estudio de arquitectura y diseño con base en Punta del Este, desde donde desarrollamos proyectos residenciales de diversas escalas.</p>
                      <p>Luego de varios años de práctica en el ámbito local, el Estudio ha logrado construir un lenguaje propio mediante el uso de la madera como material predominante, tanto desde el punto de vista formal como constructivo.</p>
                    </div>
                  </article>
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}