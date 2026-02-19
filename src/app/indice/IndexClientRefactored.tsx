"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(projects[0]?.image || "");
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug || "");
  const [interactionMode, setInteractionMode] = useState<"mouse" | "touch" | "loading">("loading");
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const wheelTouching = useRef(false);

  // Detectar modo touch vs mouse
  useEffect(() => {
    const checkUI = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setInteractionMode(hasTouch ? "touch" : "mouse");
    };
    checkUI();
    window.addEventListener("resize", checkUI);
    return () => window.removeEventListener("resize", checkUI);
  }, []);

  // Bloquear scroll de página en modo touch
  useEffect(() => {
    if (interactionMode !== "touch") return;

    const preventScroll = (e: TouchEvent) => {
        // Solo prevenimos si no estamos haciendo scroll dentro de algo que lo permita
        // Pero como aquí queremos pantalla fija, lo bloqueamos.
        if (e.cancelable) e.preventDefault();
    };
    
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [interactionMode]);

  const updateMedia = (imageUrl: string, slug: string) => {
    if (activeSlug === slug && activeImage === imageUrl) return;
    setActiveSlug(slug);
    setActiveImage(imageUrl);
  };

  const handleMouseEnter = (imageUrl: string, slug: string) => {
    if (interactionMode === "mouse") {
      updateMedia(imageUrl, slug);
    }
  };

  const handleWheelChange = (slug: string) => {
    wheelTouching.current = true;
    const project = projects.find((p) => p.slug === slug);
    if (project) {
      updateMedia(project.image, project.slug);
    }
    // Resetear después de un breve delay para no confundir con tap
    setTimeout(() => {
      wheelTouching.current = false;
    }, 300);
  };

  if (interactionMode === "loading") {
    return <div className="w-full bg-white" style={{ height: "calc(100vh - 60px)" }} />;
  }

  const wheelOptions: WheelPickerOption[] = projects.map((p) => ({
    label: (
      <div className="flex w-full h-full items-center px-4 text-[clamp(13px,0.278vw+0.7rem,16px)]">
        <span className="flex-1 text-left truncate pr-2">{p.title}</span>
        <span className="w-[70px] text-center opacity-60 text-[10px]">
          {p.status}
        </span>
        <span className="w-[35px] text-right opacity-60 text-[10px]">
          {p.year}
        </span>
      </div>
    ),
    value: p.slug,
  }));

  const isVideoActive =
    activeImage.toLowerCase().endsWith(".mp4") ||
    activeImage.toLowerCase().endsWith(".webm");

  // ─── MODO TOUCH ────────────────────────────────────────────────────────────
  if (interactionMode === "touch") {
    return (
      <div
        className="
          flex flex-col landscape:flex-row
          w-full overflow-hidden
          h-[calc(100svh-60px)]
          md:landscape:h-[calc(100svh-78px)]
          fixed inset-0 top-[60px] md:top-[78px]
        "
      >
        {/* --- Wheel Picker --- */}
        <div
          className="
            w-full landscape:w-1/2
            h-1/2 landscape:h-full
            flex items-center justify-center
            bg-white
          "
          onTouchStart={(e) => {
            touchStartPos.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            if (!touchStartPos.current) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const dist = Math.sqrt(
              Math.pow(endX - touchStartPos.current.x, 2) +
                Math.pow(endY - touchStartPos.current.y, 2)
            );

            // Solo consideramos tap si no hubo movimiento Y el wheel no giró
            if (dist < 10 && !wheelTouching.current) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = endY - rect.top;
              const centerY = rect.height / 2;
              const zoneHeight = 60; 

              if (
                clickY > centerY - zoneHeight / 2 &&
                clickY < centerY + zoneHeight / 2
              ) {
                if (activeSlug) router.push(`/projects/${activeSlug}`);
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
              visibleCount={12}
              classNames={{
                optionItem: "text-gray-400 transition-colors duration-300",
                highlightWrapper:
                  "bg-white border-y border-gray-100 h-[60px] z-10",
                highlightItem:
                  "text-[var(--color-text-hover)] font-semibold text-lg z-20 [&_span]:opacity-100",
              }}
            />
          </WheelPickerWrapper>
        </div>

        {/* --- Imagen / Video --- */}
        <div
          className="
            w-full landscape:w-1/2
            h-1/2 landscape:h-full
            relative bg-white
            flex items-center justify-center
          "
        >
          {activeImage && (
            <div key={activeImage} className="relative w-full h-full">
              {isVideoActive ? (
                <video
                  src={activeImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <Image
                  src={activeImage}
                  alt="Project thumbnail"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── MODO MOUSE ────────────────────────────────────────────────────────────
  return (
    <div
      className="
        flex flex-row
        w-full
        h-[70vh] min-h-[500px]
      "
    >
      {/* Lista de proyectos con hover */}
      <div className="w-1/2 h-full flex items-start justify-start bg-white z-10 overflow-y-auto custom-scrollbar">
        <div
          className="
            w-full
            text-[clamp(15px,0.278vw+0.938rem,19px)]
            pr-8
            flex flex-col
          "
        >
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={`
                flex items-baseline py-[5px] transition-colors duration-200
                ${
                  activeSlug === project.slug
                    ? "text-[var(--color-text-hover)] font-medium"
                    : "text-gray-400"
                }
                hover:text-[var(--color-text-hover)]
              `}
              onMouseEnter={() =>
                handleMouseEnter(project.image, project.slug)
              }
            >
              <div className="flex-1 pr-4">{project.title}</div>
              <div className="w-[120px] text-center whitespace-nowrap px-2">
                {project.status}
              </div>
              <div className="w-[60px] text-right whitespace-nowrap">
                {project.year}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Imagen / Video */}
      <div className="w-1/2 h-full relative">
        <div className="w-full h-full overflow-hidden relative">
          {activeImage && (
            <div key={activeImage} className="relative w-full h-full">
              {isVideoActive ? (
                <video
                  src={activeImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain object-top"
                />
              ) : (
                <Image
                  src={activeImage}
                  alt="Project thumbnail"
                  fill
                  className="object-contain object-top"
                  sizes="50vw"
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
