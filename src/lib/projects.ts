import fs from 'fs';
import path from 'path';

export type ProjectCredits = {
  proyecto?: string | null;
  equipo?: string | null;
  obra?: string | null;
  paisajismo?: string | null;
  interiorismo?: string | null;
  instalaciones?: string | null;
  estructura?: string | null;
  fotografias?: string | null;
};

export type Project = {
  slug: string;
  title: string;
  m2: number;
  status: "Construido" | "Proyecto" | "En obra";
  year: number;
  location: string;
  credits: ProjectCredits;
  exteriorImages: string[];
  interiorImages: string[];
  coverImage?: string;
  visible?: boolean; // Nuevo campo para ocultar/mostrar
};

// Leer proyectos desde el JSON
export function getProjects(): Project[] {
  try {
    const filePath = path.join(process.cwd(), 'content', 'projects.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.projects;
  } catch (e) {
    console.error("Error reading projects.json:", e);
    return [];
  }
}

// Obtener proyectos visibles (para la web pública)
export function getVisibleProjects(): Project[] {
  return getProjects().filter(p => p.visible !== false);
}

// Obtener proyectos ordenados por año (solo visibles)
export function getProjectsSortedByYear(): Project[] {
  const projects = getVisibleProjects();
  return projects.sort((a, b) => b.year - a.year);
}

// Obtener proyectos en orden pseudo-aleatorio consistente (solo visibles)
export function getProjectsShuffled(): Project[] {
  const projects = getVisibleProjects();
  
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const seed = hashString(projects.map(p => p.slug).join(''));
  
  const shuffled = [...projects];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i * 31) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Obtener un proyecto por slug
export function getProjectBySlug(slug: string): Project | undefined {
  const projects = getProjects();
  return projects.find(p => p.slug === slug);
}

// Obtener proyecto anterior y siguiente (circular, solo visibles)
export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const projects = getProjectsSortedByYear();
  const currentIndex = projects.findIndex(p => p.slug === slug);
  
  if (currentIndex === -1) return { prev: null, next: null };

  const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;

  return {
    prev: projects[prevIndex],
    next: projects[nextIndex],
  };
}

// Obtener la imagen de portada de un proyecto
export function getProjectCoverImage(project: Project): string {
  const basePath = `/projects/${project.slug}`;
  
  // Si el proyecto tiene una coverImage específica definida en el JSON, usar esa
  if (project.coverImage) {
    return `${basePath}/exterior/${project.coverImage}`;
  }

  // Por defecto usamos la primera imagen exterior como cover
  if (project.exteriorImages && project.exteriorImages.length > 0) {
    return `${basePath}/exterior/${project.exteriorImages[0]}`;
  }
  
  // Fallback a imagen de arquitectura genérica
  return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80';
}

// Obtener todas las imágenes de un proyecto (exterior primero, luego interior)
export function getProjectImages(project: Project): { src: string; type: 'exterior' | 'interior' }[] {
  const basePath = `/projects/${project.slug}`;
  const images: { src: string; type: 'exterior' | 'interior' }[] = [];
  
  // Primero exterior
  if (project.exteriorImages) {
    project.exteriorImages.forEach(img => {
      images.push({ src: `${basePath}/exterior/${img}`, type: 'exterior' });
    });
  }
  
  // Luego interior
  if (project.interiorImages) {
    project.interiorImages.forEach(img => {
      images.push({ src: `${basePath}/interior/${img}`, type: 'interior' });
    });
  }
  
  return images;
}