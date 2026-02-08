"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export default function HomeFeedTailwind({ projects, logoImage }: Props) {
  const feedItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const titleCurrentRef = useRef<HTMLSpanElement>(null);
  const presentationLogoRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feedItems = feedItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
    const titleSpan = titleCurrentRef.current;
    const presentationLogo = presentationLogoRef.current;
    const titleCurrent = document.querySelector('.title_current');
    const page = pageRef.current;
    const scroller = document.querySelector('.home-scroll');

    if (!page || feedItems.length === 0 || !scroller) return;

    const feedScrub = 1000;

    const getCurrentFeedScrollElement = () => {
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
          const labelElement = currentItem.querySelector(".home__feed__item__label p");
          if (labelElement) {
            titleSpan.textContent = labelElement.textContent;
          }
        }
      }
    };

    const updateTitleOnScroll = (item: HTMLAnchorElement) => {
      if (titleSpan) {
        const labelElement = item.querySelector('.home__feed__item__label');
        if (labelElement) {
          titleSpan.textContent = labelElement.textContent;
        }
      }
    };

    const createIndexScrollTrigger = () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      ScrollTrigger.defaults({
        scroller: ".home-scroll"
      });

      if (presentationLogo) {
        gsap.to(presentationLogo, {
          opacity: 0,
          scrollTrigger: {
            trigger: ".presentation-spacer",
            start: "top top",
            end: "center top",
            scrub: 0.5,
            scroller: ".home-scroll",
          },
        });
      }

      gsap.matchMedia().add({
        desktop: "(min-aspect-ratio: 1068/798)",
        tablet: "(max-aspect-ratio: 1068/798)",
        mobile: "(max-aspect-ratio: 695/924)"
      }, context => {
        const { desktop: isDesktop, tablet: isTablet, mobile: isMobile } = context.conditions || {};
        
        let scale = 0.15;
        let yPercentDesktop = 31.75;
        let animationDurationDesktop = 0.185;
        let startDesktop = "0% 100%";
        let endDesktop = "100% 0%";
        let scrubValue: boolean | number = true;

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
          const imageElement = item.querySelector(".home__feed__item__img") as HTMLElement;
          const labelElement = item.querySelector(".home__feed__item__label") as HTMLElement;
          const imgElement = item.querySelector(".home__feed__item__img") as HTMLElement;

          if (!imageElement) return;

          gsap.set(imageElement, { clearProps: "all" });

          const timeline = gsap.timeline({
            scrollTrigger: {
              scroller: ".home-scroll",
              trigger: item,
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

          timeline.from(imageElement, {
            scale: scale,
            ease: "linear",
            duration: 0.5
          }, "0");

          timeline.to(imageElement, {
            scale: scale,
            ease: "linear",
            duration: 0.5
          }, "0.5");

          if (isMobile) {
            timeline.fromTo(imgElement,
              { yPercent: -85 },
              { yPercent: -28.5, duration: 1 / 6, ease: "linear" },
              0
            );
            timeline.fromTo(imgElement,
              { yPercent: -28.5 },
              { yPercent: 0, duration: 1 / 6, ease: "linear" },
              1 / 6
            );
            timeline.fromTo(imgElement,
              { yPercent: 0 },
              { yPercent: 28.5, duration: 1 / 6, ease: "linear" },
              1 - 1 / 3
            );
            timeline.fromTo(imgElement,
              { yPercent: 28.5 },
              { yPercent: 85, duration: 1 / 6, ease: "linear" },
              1 - 1 / 6
            );
          } else {
            if (index !== 0 && labelElement) {
              timeline.from(labelElement, {
                height: scale * 100 + "%",
                ease: "linear",
                duration: 0.5
              }, "0");
              timeline.to(labelElement, {
                height: scale * 100 + "%",
                ease: "linear",
                duration: 0.5
              }, "0.5");
            }

            timeline.fromTo(imgElement,
              { yPercent: -yPercentDesktop },
              { yPercent: 0, duration: animationDurationDesktop, ease: "linear" },
              0
            );
            timeline.fromTo(imgElement,
              { yPercent: 0 },
              { yPercent: yPercentDesktop, duration: animationDurationDesktop, ease: "linear" },
              1 - animationDurationDesktop
            );
          }
        });

        setTimeout(() => {
          getCurrentFeedScrollElement();
        }, 0);

        scroller.addEventListener('scroll', getCurrentFeedScrollElement);

        return () => {
          scroller.removeEventListener('scroll', getCurrentFeedScrollElement);
        };
      });

      ScrollTrigger.refresh();
    };

    createIndexScrollTrigger();

    const handleScroll = () => {
      const scrollTop = scroller.scrollTop;
      
      if (titleCurrent) {
        if (scrollTop > 0) {
          titleCurrent.classList.add('scroll');
        } else {
          titleCurrent.classList.remove('scroll');
        }
      }

      if (presentationLogo && scrollTop > 200) {
        presentationLogo.classList.add('scroll');
      } else {
        presentationLogo?.classList.remove('scroll');
      }
    };

    scroller.addEventListener('scroll', handleScroll);

    const handleResize = () => {
      createIndexScrollTrigger();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      scroller.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [projects]);

  return (
    <div className="page home home-scroll" ref={pageRef}>
      <div className="presentation-spacer h-screen"></div>
      
      <section className="section presentation fixed inset-0 flex items-center justify-center pointer-events-none z-10 p-0">
        <div className="container mx-auto px-4 max-w-[1600px] flex justify-center">
          <div className="logo transition-opacity duration-300 opacity-100 w-full max-w-[1200px] p-0 flex justify-center" ref={presentationLogoRef}>
            <img src={logoImage} alt="noreste arq" className="max-w-full h-auto w-full block" />
          </div>
        </div>
      </section>

      <section className="section projects pt-0 pb-8 md:pb-16 relative">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="home__feed flex flex-col pointer-events-none">
            {projects.map((project, index) => (
              <a
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="home__feed__item relative flex items-center justify-center w-full h-[75vh] py-[3px] box-border perspective-[800px] mt-[-20vh] first:mt-[50px]"
                data-index={index + 1}
                ref={(el) => { feedItemsRef.current[index] = el; }}
              >
                <div className="home__feed__item__img relative flex items-center h-full cursor-pointer pointer-events-auto will-change-transform">
                  <picture className="w-full h-full">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-auto block max-w-full"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </picture>
                </div>

                <div className="home__feed__item__label absolute left-0 h-full">
                  <p className="relative self-start top-0 left-0 mb-[-10vh] pt-[10px] pb-[15px] first:mb-[14.4vh]">
                    {project.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="title_current fixed bottom-[15px] left-[20px] opacity-0 transition-opacity duration-300 md:hidden pointer-events-none">
        <span ref={titleCurrentRef}></span>
      </div>
    </div>
  );
}
