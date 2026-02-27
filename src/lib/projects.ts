import { supabase } from './supabase';

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
  id?: string;
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
  order?: number;
};

/**
 * Obtener todos los proyectos desde Supabase
 */
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error("Error fetching projects from Supabase:", error);
    return [];
  }

  return data as Project[];
}

/**
 * Limpiar caché (En Supabase/Vercel usaremos revalidatePath de Next.js si es necesario)
 */
export function clearProjectsCache() {
  // En Serverless no usamos cache global manual, confiamos en el Data Cache de Next.js
}

/**
 * Obtener proyectos visibles (para la web pública)
 */
export async function getVisibleProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visible', true)
    .order('order', { ascending: true });

  if (error) {
    console.error("Error fetching visible projects:", error);
    return [];
  }

  return data as Project[];
}

/**
 * Obtener proyectos ordenados por año (solo visibles)
 */
export async function getProjectsSortedByYear(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visible', true)
    .order('year', { ascending: false });

  if (error) {
    console.error("Error fetching sorted projects:", error);
    return [];
  }

  return data as Project[];
}

/**
 * Obtener proyectos en orden pseudo-aleatorio consistente
 */
export async function getProjectsShuffled(): Promise<Project[]> {
  const projects = await getVisibleProjects();
  
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

/**
 * Obtener un proyecto por slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching project by slug ${slug}:`, error);
    return undefined;
  }

  return data as Project;
}

/**
 * Obtener proyecto anterior y siguiente (circular, solo visibles)
 */
export async function getAdjacentProjects(slug: string): Promise<{ prev: Project | null; next: Project | null }> {
  const projects = await getProjectsSortedByYear();
  const currentIndex = projects.findIndex(p => p.slug === slug);
  
  if (currentIndex === -1) return { prev: null, next: null };

  const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;

  return {
    prev: projects[prevIndex],
    next: projects[nextIndex],
  };
}

/**
 * Obtener la imagen de portada de un proyecto
 */
export function getProjectCoverImage(project: Project): string {
  // 1. Usar la portada definida (asumimos URL completa o path absoluto)
  if (project.cover && project.cover.trim() !== "") {
    return project.cover;
  }

  // 2. Fallback a la primera imagen
  if (project.images && project.images.length > 0) {
    return project.images[0];
  }

  // 3. Fallback al primer video
  if (project.videos && project.videos.length > 0) {
    return project.videos[0];
  }
  
  return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80';
}

/**
 * Obtener todas las imágenes de un proyecto
 */
export function getProjectImages(project: Project): { src: string; type: 'image' | 'video' }[] {
  const gallery: { src: string; type: 'image' | 'video' }[] = [];
  
  if (project.images) {
    project.images.forEach(img => {
      gallery.push({ src: img, type: 'image' });
    });
  }
  
  if (project.videos) {
    project.videos.forEach(vid => {
      gallery.push({ src: vid, type: 'video' });
    });
  }
  
  return gallery;
}
