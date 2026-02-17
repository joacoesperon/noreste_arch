"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";

type ProjectForIndex = {
  slug: string;
  title: string;
  status: "Construido" | "Proyecto" | "En obra";
  year: number;
  image: string;
};

type Props = {
  projects: ProjectForIndex[];
};

export default function IndexClientRefactored({ projects }: Props) {
  const [activeImage, setActiveImage] = useState(projects[0]?.image || "");
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug || "");
  const [isVertical, setIsVertical] = useState(false);
  const [isFading, setIsFading] = useState(true);
  const [isTouchUI, setIsTouchUI] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Detect Touch UI vs Desktop
  useEffect(() => {
    const checkUI = () => {
        // We consider Touch UI anything that has touch points or is below 1367px (iPad Pro)
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const isSmallScreen = window.innerWidth < 1367;
        setIsTouchUI(hasTouch || isSmallScreen);
    };
    checkUI();
    window.addEventListener("resize", checkUI);
    return () => window.removeEventListener("resize", checkUI);
  }, []);

  const updateMedia = (imageUrl: string, slug: string) => {
    if (activeSlug === slug && activeImage === imageUrl) return;

    setIsFading(false);
    setActiveSlug(slug);

    const isVideo = imageUrl.toLowerCase().endsWith('.mp4') || imageUrl.toLowerCase().endsWith('.webm');

    if (isVideo) {
      setIsVertical(false);
      setActiveImage(imageUrl);
      // Timeout to ensure the fade animation triggers correctly
      setTimeout(() => setIsFading(true), 50);
    } else {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setIsVertical(img.height > img.width);
        setActiveImage(imageUrl);
        setIsFading(true);
      };
      // Fallback if image fails or is already cached
      if (img.complete) {
        setIsVertical(img.height > img.width);
        setActiveImage(imageUrl);
        setIsFading(true);
      }
    }
  };

  const handleMouseEnter = (imageUrl: string, slug: string) => {
    if (!isTouchUI) {
      updateMedia(imageUrl, slug);
    }
  };

  const handleWheelChange = (slug: string) => {
    const project = projects.find(p => p.slug === slug);
    if (project) {
      updateMedia(project.image, project.slug);
    }
  };

  const wheelOptions: WheelPickerOption[] = projects.map(p => ({
    label: (
      <div className="flex w-full h-full items-center px-4 text-[clamp(13px,0.278vw+0.7rem,16px)]">
        <span className="flex-1 text-left truncate pr-2">{p.title}</span>
        <span className="w-[70px] text-center opacity-60 text-[10px]">{p.status}</span>
        <span className="w-[35px] text-right opacity-60 text-[10px]">{p.year}</span>
      </div>
    ),
    value: p.slug
  }));

  const isVideoActive = activeImage.toLowerCase().endsWith('.mp4') || activeImage.toLowerCase().endsWith('.webm');

  return (
    <div className="flex flex-col lg:flex-row landscape:flex-row w-full h-[calc(100vh-120px)] lg:h-auto overflow-hidden lg:overflow-visible">

      {/* Columna Tabla Proyectos */}
      <div className="w-full lg:w-1/2 landscape:w-1/2 h-[45%] lg:h-full landscape:h-full flex items-center lg:items-start justify-center lg:justify-start bg-white z-10">
        {isTouchUI ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center relative"
            onTouchStart={(e) => {
                touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
                if (!touchStartPos.current) return;
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const dist = Math.sqrt(Math.pow(endX - touchStartPos.current.x, 2) + Math.pow(endY - touchStartPos.current.y, 2));

                if (dist < 10) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickY = endY - rect.top;
                    const centerY = rect.height / 2;
                    const zoneHeight = 70;
                    if (clickY > centerY - zoneHeight/2 && clickY < centerY + zoneHeight/2) {
                        if (activeSlug) window.location.href = `/projects/${activeSlug}`;
                    }
                }
                touchStartPos.current = null;
            }}
          >
            <WheelPickerWrapper className="w-full h-full border-none bg-transparent">
              <WheelPicker
                options={wheelOptions}
                value={activeSlug}
                onValueChange={handleWheelChange}
                optionItemHeight={60}
                visibleCount={11}
                classNames={{
                  optionItem: "text-gray-400 transition-colors duration-300",
                  highlightWrapper: "bg-white border-y border-gray-100 h-[60px] z-10",
                  highlightItem: "text-[#2c2c2c] font-semibold text-lg z-20 [&_span]:opacity-100"
                }}
              />
            </WheelPickerWrapper>
          </div>
        ) : (
          <div className="w-full text-[clamp(15px,0.278vw+0.938rem,19px)] pr-8 h-full flex flex-col justify-start">
            <div className="flex flex-col">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className={`flex items-baseline py-[5px] transition-colors
                    ${activeSlug === project.slug ? 'text-black font-medium' : 'text-[var(--color-text)]'}
                    hover:text-black`}
                  onMouseEnter={() => handleMouseEnter(project.image, project.slug)}
                >
                  <div className="flex-1 pr-4">{project.title}</div>
                  <div className="w-[120px] text-center whitespace-nowrap px-2">{project.status}</div>
                  <div className="w-[60px] text-right whitespace-nowrap">{project.year}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visualizador de Imagen */}
      <div className="w-full lg:w-1/2 landscape:w-1/2 h-[55%] lg:h-full landscape:h-full relative bg-white lg:bg-transparent">
        <div className="lg:sticky lg:top-0 w-full h-full overflow-hidden">
          {activeImage && (
            <div className={`relative w-full h-full transition-opacity duration-500 ${isFading ? "opacity-100" : "opacity-0"}`}>
              {isVideoActive ? (
                <video
                  key={activeImage}
                  src={activeImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain object-center lg:object-top"
                />
              ) : (
                <Image
                  src={activeImage}
                  alt="Project thumbnail"
                  fill
                  className={`object-contain object-center lg:object-top ${isVertical ? 'lg:max-h-full' : ''}`}
                  sizes="(max-width: 1366px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
