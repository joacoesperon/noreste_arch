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

export default function HomeFeed({ projects, logoImage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const titleSpanRef = useRef<HTMLSpanElement>(null);
  const presentationLogoRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We scope everything to the container to ensure cleanup
    const ctx = gsap.context(() => {
      const feedItems = itemsRef.current.filter((item): item is HTMLAnchorElement => item !== null);
      const scroller = scrollerRef.current;
      const titleSpan = titleSpanRef.current;
      const presentationLogo = presentationLogoRef.current;

      if (!scroller || feedItems.length === 0) return;

      const feedScrub = 1000;

      // --- 1. Title Update Logic (Mobile) ---
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

      // --- 2. Main ScrollTrigger Logic ---
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
                yPercentDesktop = 31.75,
                animationDurationDesktop = 0.185,
                startDesktop = "0% 100%",
                endDesktop = "100% 0%",
                scrubValue: boolean | number = true;

            if (isTablet) {
                yPercentDesktop = 41;
                animationDurationDesktop = 0.24;
                scrubValue = feedScrub / 1000;
            }

            if (isMobile) {
                yPercentDesktop = 56.5;
                animationDurationDesktop = 0.3334;
                startDesktop = "0% 125%";
                endDesktop = "100% -25%";
                scrubValue = feedScrub / 1000;
            }

            feedItems.forEach((item, index) => {
                const imageElement = item.querySelector(".home__feed__item__img");
                const labelElement = item.querySelector(".home__feed__item__label");
                
                // CRITICAL FIX: Ensure elements exist before animating
                if (!imageElement || !item) return;

                // Reset transformations
                gsap.set(imageElement, { clearProps: "all" });

                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: item, // Using the ref element directly
                        start: startDesktop,
                        end: endDesktop,
                        scrub: scrubValue,
                        ease: "none",
                        onUpdate: () => {
                            if (isMobile) {
                                updateTitleOnScroll(item);
                            }
                        }
                    }
                });

                // Scale Animation
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
                    // Mobile Parallax Steps
                    timeline.fromTo(imageElement, { yPercent: -85 }, { yPercent: -28.5, duration: 1/6, ease: "linear" }, 0);
                    timeline.fromTo(imageElement, { yPercent: -28.5 }, { yPercent: 0, duration: 1/6, ease: "linear" }, 1/6);
                    timeline.fromTo(imageElement, { yPercent: 0 }, { yPercent: 28.5, duration: 1/6, ease: "linear" }, 1 - 1/3);
                    timeline.fromTo(imageElement, { yPercent: 28.5 }, { yPercent: 85, duration: 1/6, ease: "linear" }, 1 - 1/6);
                } else {
                    // Desktop Label Animation
                    if (index !== 0 && labelElement) {
                        timeline.from(labelElement, { height: `${scale * 100}%`, ease: "linear", duration: 0.5 }, "0");
                        timeline.to(labelElement, { height: `${scale * 100}%`, ease: "linear", duration: 0.5 }, "0.5");
                    }
                    
                    // Desktop Parallax
                    timeline.fromTo(imageElement, { yPercent: -yPercentDesktop }, { yPercent: 0, duration: animationDurationDesktop, ease: "linear" }, 0);
                    timeline.fromTo(imageElement, { yPercent: 0 }, { yPercent: yPercentDesktop, duration: animationDurationDesktop, ease: "linear" }, 1 - animationDurationDesktop);
                }
            });

            // Initial Title Set
            setTimeout(() => { getCurrentFeedScrollElement(); }, 0);
            scroller.addEventListener('scroll', getCurrentFeedScrollElement);
            
            return () => {
                scroller.removeEventListener('scroll', getCurrentFeedScrollElement);
            };
        });

        // Presentation (Logo) Animation
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

      // --- 3. Scroll Event Listeners for Classes ---
      const handleScroll = () => {
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
      };
      
      scroller.addEventListener('scroll', handleScroll);
      
      // Initialize
      createIndexScrollTrigger();

      // Resize Handler
      const handleResize = () => createIndexScrollTrigger();
      window.addEventListener('resize', handleResize);

      // Cleanup function for useEffect
      return () => {
          scroller.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
      };

    }, containerRef); // END GSAP CONTEXT

    return () => ctx.revert();
  }, []);

  return (
    // Outer Wrapper
    <div ref={containerRef} className="page-wrapper">
      <div ref={scrollerRef} className="page home home-scroll">
      
      {/* Spacer for Presentation */}
      <div className="presentation-spacer"></div>
      
      {/* Presentation Section (Logo) */}
      <section className="section presentation">
        <div className="container mx-auto px-4 max-w-[1600px]">
            <div ref={presentationLogoRef} className="logo w-full flex justify-center">
                <img src={logoImage} alt="Logo" className="w-full h-auto block max-w-[1200px]" />
            </div>
        </div>
      </section>

      {/* Projects Feed */}
      <section className="section projects pt-0">
        <div className="container mx-auto px-4 max-w-[1600px]">
            <div className="home__feed">
                {projects.map((project, index) => (
                    <Link 
                        href={`/projects/${project.slug}`}
                        key={project.slug}
                        className="home__feed__item"
                        data-index={index + 1}
                        ref={(el) => { itemsRef.current[index] = el; }}
                    >
                        <div className="home__feed__item__img">
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                loading={index < 3 ? "eager" : "lazy"}
                            />
                        </div>

                        <div className="home__feed__item__label">
                            <p>{project.title}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Mobile Title */}
      <div className="title_current">
        <span ref={titleSpanRef} id="titleSpan"></span>
      </div>

      </div>
    </div>
  );
}
