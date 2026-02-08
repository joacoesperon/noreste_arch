"use client";

import { useState } from "react";
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

export default function IndexTailwind({ projects }: Props) {
  const [activeImage, setActiveImage] = useState(projects[0]?.image || "");
  const [isVertical, setIsVertical] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const handleMouseEnter = (imageUrl: string) => {
    setIsPreloading(true);
    const img = new window.Image();
    img.onload = () => {
      setIsVertical(img.height > img.width);
      setActiveImage(imageUrl);
      setIsPreloading(false);
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-170px)]">
      {/* Columna Izquierda: 50% ancho */}
      <div className="w-full md:w-1/2">
        <div className="flex flex-col w-full">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex items-start py-[5px] w-full cursor-pointer transition-colors duration-300"
              onMouseEnter={() => handleMouseEnter(project.image)}
            >
              {/* Celda Título: 60% ancho exacto */}
              <div className="w-[60%] text-[clamp(16px,0.278vw+0.938rem,19px)] text-[#C4C4C4] group-hover:text-[#808080] capitalize font-sans leading-tight transition-colors duration-300">
                {project.title}
              </div>
              
              {/* Celda Estado: 20% ancho exacto, centrado */}
              <div className="w-[20%] text-center text-[clamp(16px,0.278vw+0.938rem,19px)] text-[#C4C4C4] group-hover:text-[#808080] capitalize font-sans transition-colors duration-300 whitespace-nowrap">
                {project.status}
              </div>
              
              {/* Celda Año: 20% ancho exacto, centrado */}
              <div className="w-[20%] text-center text-[clamp(16px,0.278vw+0.938rem,19px)] text-[#C4C4C4] group-hover:text-[#808080] font-sans transition-colors duration-300">
                {project.year}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Columna Derecha: 50% ancho, sticky thumbnail */}
      <div className="hidden md:block w-1/2 relative">
        <div className="sticky top-[78px] w-full h-[calc(100vh-170px)] flex justify-end items-start">
          <div className={`relative transition-opacity duration-500 ease-in-out ${isPreloading ? 'opacity-80' : 'opacity-100'} ${isVertical ? 'h-full w-auto' : 'w-full h-auto'}`}>
            <img
              src={activeImage}
              alt="Project preview"
              className={`block ${isVertical ? 'h-full w-auto object-contain ml-auto' : 'w-full h-auto object-contain ml-auto'}`} 
              style={{ maxHeight: 'calc(100vh - 170px)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
