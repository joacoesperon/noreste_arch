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
  images: string[];
  videos?: string[];
  cover?: string; // Can be an image filename or video filename
  visible?: boolean;
};

// Variable global para cachear los proyectos en memoria (persiste en next dev)
const globalForProjects = globalThis as unknown as {
  projectsCache: Project[] | null;
};

// Leer proyectos desde el JSON
export function getProjects(): Project[] {
  if (globalForProjects.projectsCache) {
    return globalForProjects.projectsCache;
  }

  try {
    const filePath = path.join(process.cwd(), 'content', 'projects.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    globalForProjects.projectsCache = data.projects;
    return data.projects;
  } catch (e) {
    console.error("Error reading projects.json:", e);
    return [];
  }
}

// Función para limpiar cache (útil para el admin cuando actualiza datos)
export function clearProjectsCache() {
  globalForProjects.projectsCache = null;
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
  
  // 1. Intentar usar la portada definida si es válida
  if (project.cover && project.cover.trim() !== "") {
    const isVideo = project.videos?.includes(project.cover);
    const isImage = project.images?.includes(project.cover);

    if (isVideo) return `${basePath}/videos/${project.cover}`;
    if (isImage) return `${basePath}/images/${project.cover}`;
  }

  // 2. Si no hay portada válida, usar la primera imagen de la galería
  if (project.images && project.images.length > 0) {
    return `${basePath}/images/${project.images[0]}`;
  }

  // 3. Si no hay imágenes, usar el primer video
  if (project.videos && project.videos.length > 0) {
    return `${basePath}/videos/${project.videos[0]}`;
  }
  
  // 4. Fallback final
  return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80';
}

// Obtener todas las imágenes de un proyecto
export function getProjectImages(project: Project): { src: string; type: 'image' | 'video' }[] {
  const basePath = `/projects/${project.slug}`;
  const gallery: { src: string; type: 'image' | 'video' }[] = [];
  
  // Imágenes
  if (project.images) {
    project.images.forEach(img => {
      gallery.push({ src: `${basePath}/images/${img}`, type: 'image' });
    });
  }
  
  // Videos
  if (project.videos) {
    project.videos.forEach(vid => {
      gallery.push({ src: `${basePath}/videos/${vid}`, type: 'video' });
    });
  }
  
  return gallery;
}