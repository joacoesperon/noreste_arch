"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/lib/projects";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Link from "next/link";
import Masonry from "react-masonry-css";

type ProjectMedia = {
  src: string;
  type: "image" | "video";
};

type Props = {
  project: Project;
  media: ProjectMedia[]; // Ahora recibimos media unificada
  prevProject: Project | null;
  nextProject: Project | null;
};

export default function ProjectClient({ project, media, prevProject, nextProject }: Props) {
  const [showCredits, setShowCredits] = useState(false);

  // Initialize Fancybox
  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {
      Hash: false,
      Thumbs: {
        autoStart: false,
      },
    } as any);

    return () => {
      Fancybox.destroy();
    };
  }, [project.slug, media]);

  const toggleCredits = () => {
    setShowCredits(!showCredits);
  };

  const breakpointColumnsObj = {
    default: 2,
    768: 1
  };

  return (
    <div className="w-full">
      {/* Content - Info del proyecto */}
      <section className="mt-[70px] py-[30px] md:py-[60px]">
        <div className="mx-auto px-4 md:px-8 max-w-[1600px]">
          <div className="text-center">
            <h1 className="text-[clamp(16px,0.278vw+0.938rem,19px)] font-medium mb-0 text-[#C4C4C4]">
              {project.title}, {project.m2}M2 , {project.year}
            </h1>
            <p className="text-[clamp(16px,0.278vw+0.938rem,19px)] text-[#C4C4C4]">
              {project.location}.
            </p>

            {/* Acordeón para créditos */}
            <div className="mt-4">
              <div className="relative inline-block">
                <button
                  type="button"
                  className={`relative w-[30px] h-[30px] bg-transparent border-none cursor-pointer after:content-['+'] after:text-[#C4C4C4] after:text-2xl after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:transition-all after:duration-300 ${showCredits ? 'after:content-["-"]' : ''}`}
                  onClick={toggleCredits}
                  aria-expanded={showCredits}
                ></button>

                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${showCredits ? 'max-h-[3000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
                >
                  <div className="pt-4 pb-5 text-[#C4C4C4]">
                    {Object.entries(project.credits).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key} className="mb-4 text-[clamp(14px,0.2vw+0.8rem,16px)]">
                          <p className="m-0 capitalize font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</p>
                          <p className="m-0">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pt-0 pb-[30px] md:pb-[60px]">
        <div className="mx-auto px-4 md:px-8 max-w-[1600px]">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-[20px] md:-ml-[60px]"
            columnClassName="pl-[20px] md:pl-[60px] bg-clip-padding even:mt-0 md:even:mt-[100px]"
          >
            {media.map((item, index) => (
              <div key={index} className="mb-[20px] md:mb-[60px] group transition-transform duration-300 hover:scale-[1.01]">
                {item.type === "image" ? (
                  <a 
                    href={item.src} 
                    data-fancybox="gallery" 
                    className="block relative w-full h-auto"
                  >
                    <img
                      src={item.src}
                      alt={`${project.title} - ${index + 1}`}
                      className="w-full h-auto block"
                      loading={index < 4 ? "eager" : "lazy"}
                    />
                  </a>
                ) : (
                  <div className="relative w-full h-auto overflow-hidden">
                    <video
                      src={item.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-auto block"
                    />
                  </div>
                )}
              </div>
            ))}
          </Masonry>
        </div>
      </section>

      {/* Nav Projects */}
      <div className="mx-auto px-4 md:px-8 max-w-[1600px] flex justify-between py-12 text-[#C4C4C4]">
        <div className="text-left">
          {prevProject && (
            <Link href={`/projects/${prevProject.slug}`} className="group">
              <span className="text-sm md:text-base group-hover:text-[#808080] transition-colors">{prevProject.title}</span>
              <br />
              <span className="text-xl md:text-2xl group-hover:text-[#808080] transition-colors">&lt;</span>
            </Link>
          )}
        </div>

        <div className="text-right">
          {nextProject && (
            <Link href={`/projects/${nextProject.slug}`} className="group">
              <span className="text-sm md:text-base group-hover:text-[#808080] transition-colors">{nextProject.title}</span>
              <br />
              <span className="text-xl md:text-2xl group-hover:text-[#808080] transition-colors">&gt;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
