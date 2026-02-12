"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

type ProjectForFeed = {
  slug: string;
  title: string;
  image: string;
};

type Props = {
  projects: ProjectForFeed[];
  logoImage: string;
};

export default function HomeFeedVideo({ projects, logoImage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const titleSpanRef = useRef<HTMLSpanElement>(null);
  const presentationLogoRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Bloquear scroll del root solo en esta página para evitar doble scroll con el contenedor .home-scroll
    document.documentElement.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const feedItems = itemsRef.current.filter((item): item is HTMLAnchorElement => item !== null);
      const scroller = scrollerRef.current;
      const titleSpan = titleSpanRef.current;
      const presentationLogo = presentationLogoRef.current;

      if (!scroller || feedItems.length === 0) return;

      const feedScrub = 1000;

      // --- 1. Lógica de Títulos (Mobile) ---
      const getCurrentFeedScrollElement = function() {
        const scrollPosition = scroller.scrollTop;
        let currentItemIndex = 0;

        feedItems.forEach((item, index) => {
          const itemTop = item.offsetTop; 
          const itemHeight = item.offsetHeight;
          if (scrollPosition >= itemTop && scrollPosition < itemTop + itemHeight) {
            currentItemIndex = index;
          }
        });

        if (titleSpan) {
          const currentItem = feedItems[currentItemIndex];
          if (currentItem) {
            const labelText = currentItem.querySelector(".home__feed__item__label p")?.textContent;
            if (labelText) titleSpan.textContent = labelText;
          }
        }
      };

      const updateTitleOnScroll = (item: Element) => {
        if (!titleSpan) return;
        const newTitle = item.querySelector('.home__feed__item__label')?.textContent;
        if (newTitle) titleSpan.textContent = newTitle;
      };

      // --- 2. Lógica de Autoplay Inteligente ---
      const checkAndPlayVideos = () => {
        feedItems.forEach((item, index) => {
          const video = videoRefs.current[index];
          if (!video) return;

          const imageWrapper = item.querySelector(".home__feed__item__img");
          if (!imageWrapper) return;

          // Leemos la escala actual animada por GSAP
          const currentScale = gsap.getProperty(imageWrapper, "scale") as number;

          // Si la escala es >= 0.8, está lo suficientemente centrado para arrancar
          if (currentScale >= 0.8) {
            video.play().catch(() => {}); // Catch por si el navegador bloquea el play
          } else {
            video.pause();
          }
        });
      };

      const handleScroll = () => {
        // Pausar videos inmediatamente al scrollear para ahorrar recursos
        videoRefs.current.forEach(v => v?.pause());

        // Manejo de clases del header/logo
        const scrollTop = scroller.scrollTop;
        const titleCurrent = document.querySelector(".title_current");
        if (titleCurrent) {
          if (scrollTop > 0) titleCurrent.classList.add('scroll');
          else titleCurrent.classList.remove('scroll');
        }
        if (presentationLogo) {
          if (scrollTop > 200) presentationLogo.classList.add('scroll');
          else presentationLogo.classList.remove('scroll');
        }

        // Timer para detectar parada de scroll (0.5 segundos)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          checkAndPlayVideos();
        }, 500);
      };

      scroller.addEventListener('scroll', handleScroll);
      scroller.addEventListener('scroll', getCurrentFeedScrollElement);

      // --- 3. ScrollTrigger Principal (Copiado de HomeFeed) ---
      function createIndexScrollTrigger() {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        ScrollTrigger.defaults({ scroller: scroller });

        gsap.matchMedia().add({
            desktop: "(min-aspect-ratio: 1068/798)",
            tablet: "(max-aspect-ratio: 1068/798)",
            mobile: "(max-aspect-ratio: 695/924)"
        }, context => {
            const { desktop: isDesktop, tablet: isTablet, mobile: isMobile } = context.conditions || {};
            
            let scale = 0.15,
                yPercentVal = 31.75,
                animDuration = 0.185,
                startPos = "0% 100%",
                endPos = "100% 0%",
                scrubValue: boolean | number = true;

            if (isTablet) {
                yPercentVal = 41;
                animDuration = 0.24;
                scrubValue = feedScrub / 1000;
            }

            if (isMobile) {
                yPercentVal = 56.5;
                animDuration = 0.3334;
                startPos = "0% 125%";
                endPos = "100% -25%";
                scrubValue = feedScrub / 1000;
            }

            feedItems.forEach((item, index) => {
                const imageElement = item.querySelector(".home__feed__item__img");
                const labelElement = item.querySelector(".home__feed__item__label");
                
                if (!imageElement || !item) return;

                gsap.set(imageElement, { clearProps: "all" });

                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: item,
                        start: startPos,
                        end: endPos,
                        scrub: scrubValue,
                        ease: "none",
                        onUpdate: () => {
                            if (isMobile) updateTitleOnScroll(item);
                        }
                    }
                });

                timeline.from(imageElement, {
                    scale: scale,
                    ease: "linear",
                    duration: 0.5
                }, "0").to(imageElement, {
                    scale: scale,
                    ease: "linear",
                    duration: 0.5
                }, "0.5");

                if (isMobile) {
                    timeline.fromTo(imageElement, { yPercent: -85 }, { yPercent: -28.5, duration: 1/6, ease: "linear" }, 0);
                    timeline.fromTo(imageElement, { yPercent: -28.5 }, { yPercent: 0, duration: 1/6, ease: "linear" }, 1/6);
                    timeline.fromTo(imageElement, { yPercent: 0 }, { yPercent: 28.5, duration: 1/6, ease: "linear" }, 1 - 1/3);
                    timeline.fromTo(imageElement, { yPercent: 28.5 }, { yPercent: 85, duration: 1/6, ease: "linear" }, 1 - 1/6);
                } else {
                    if (index !== 0 && labelElement) {
                        timeline.from(labelElement, { height: `${scale * 100}%`, ease: "linear", duration: 0.5 }, "0");
                        timeline.to(labelElement, { height: `${scale * 100}%`, ease: "linear", duration: 0.5 }, "0.5");
                    }
                    timeline.fromTo(imageElement, { yPercent: -yPercentVal }, { yPercent: 0, duration: animDuration, ease: "linear" }, 0);
                    timeline.fromTo(imageElement, { yPercent: 0 }, { yPercent: yPercentVal, duration: animDuration, ease: "linear" }, 1 - animDuration);
                }
            });

            setTimeout(() => { getCurrentFeedScrollElement(); }, 0);
        });

        if (presentationLogo) {
              gsap.to(presentationLogo, {
                opacity: 0,
                scrollTrigger: {
                  trigger: ".presentation-spacer",
                  start: "top top",
                  end: "center top",
                  scrub: 0.5,
                }
              });
        }
        ScrollTrigger.refresh();
      }

      createIndexScrollTrigger();
      window.addEventListener('resize', createIndexScrollTrigger);

      return () => {
        document.documentElement.style.overflow = "auto";
        scroller.removeEventListener('scroll', handleScroll);
        scroller.removeEventListener('scroll', getCurrentFeedScrollElement);
        window.removeEventListener('resize', createIndexScrollTrigger);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };

    }, containerRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <div ref={containerRef} className="page-wrapper">
      <div ref={scrollerRef} className="page home home-scroll">
        <div className="presentation-spacer"></div>
        
        <section className="section presentation">
          <div className="container mx-auto px-4 max-w-[1600px]">
            <div ref={presentationLogoRef} className="logo w-full flex justify-center">
              <img src={logoImage} alt="Logo" className="w-full h-auto block max-w-[1200px]" />
            </div>
          </div>
        </section>

        <section className="section projects pt-0">
          <div className="container mx-auto px-4 max-w-[1600px]">
            <div className="home__feed">
              {projects.map((project, index) => {
                const isVideo = project.image.toLowerCase().endsWith('.mp4') || project.image.toLowerCase().endsWith('.webm');
                return (
                  <Link 
                    href={`/projects/${project.slug}`}
                    key={project.slug}
                    className="home__feed__item"
                    ref={(el) => { itemsRef.current[index] = el; }}
                  >
                    <div className="home__feed__item__img relative overflow-hidden">
                      {isVideo ? (
                        <video
                          ref={(el) => { videoRefs.current[index] = el; }}
                          src={project.image}
                          muted
                          loop
                          playsInline
                          preload="auto"
                          poster="" 
                          className="w-auto max-w-full h-full block object-cover z-10"
                        />
                      ) : (
                        <img src={project.image} alt={project.title} loading={index < 3 ? "eager" : "lazy"} className="relative z-10" />
                      )}
                    </div>

                    <div className="home__feed__item__label">
                      <p>{project.title}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="title_current">
          <span ref={titleSpanRef} id="titleSpan"></span>
        </div>
      </div>
    </div>
  );
}
