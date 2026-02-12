"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function IndexClient({ projects }: Props) {
  const [activeImage, setActiveImage] = useState(projects[0]?.image || "");
  const [isVertical, setIsVertical] = useState(false);
  const [isFading, setIsFading] = useState(true);

  const handleMouseEnter = (imageUrl: string) => {
    setIsFading(false);
    
    // Preload to check orientation
    const img = new window.Image();
    img.onload = () => {
      setIsVertical(img.height > img.width);
      setActiveImage(imageUrl);
      setIsFading(true);
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-170px)]">
      {/* Columna Tabla Proyectos: 50% */}
      <div className="w-full md:w-1/2 pr-4">
        <div className="w-full text-[clamp(16px,0.278vw+0.938rem,19px)]">
          <div className="flex flex-col">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="flex items-center py-[5px] group transition-colors"
                onMouseEnter={() => handleMouseEnter(project.image)}
              >
                <div className="w-[60%] text-[#C4C4C4] group-hover:text-[#808080] transition-colors">{project.title}</div>
                <div className="w-[20%] text-center whitespace-nowrap text-[#C4C4C4] group-hover:text-[#808080] transition-colors">{project.status}</div>
                <div className="w-[20%] text-center whitespace-nowrap text-[#C4C4C4] group-hover:text-[#808080] transition-colors">{project.year}</div>
              </Link>
            ))}
            {/* Espaciadores de Tenue */}
            <div className="h-10"></div>
            <div className="h-10"></div>
          </div>
        </div>
      </div>
      
      {/* Columna Imagen Thumbnail: 50% exacto, sin padding extra para llegar al centro */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="sticky top-[0px] w-full h-[calc(100vh-170px)] overflow-hidden">
          {activeImage && (
            <div className={`relative w-full h-full transition-opacity duration-500 ${isFading ? "opacity-100" : "opacity-0"}`}>
              <Image
                src={activeImage}
                alt="Project thumbnail"
                fill
                className={`object-contain object-top ${isVertical ? 'max-h-[calc(100vh-170px)]' : ''}`}
                sizes="50vw"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
