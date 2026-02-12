import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { clearProjectsCache } from '@/lib/projects';

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

// GET - Obtener todos los proyectos
export async function GET() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(data);
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer proyectos' }, { status: 500 });
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const newProject = await request.json();
    
    // Leer proyectos existentes
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const { projects } = JSON.parse(data);
    
    // Verificar que no exista un proyecto con el mismo slug
    if (projects.find((p: { slug: string }) => p.slug === newProject.slug)) {
      return NextResponse.json({ error: 'Ya existe un proyecto con ese slug' }, { status: 400 });
    }
    
    // Crear carpeta para imágenes del proyecto
    const projectImagesDir = path.join(process.cwd(), 'public', 'projects', newProject.slug);
    await fs.mkdir(projectImagesDir, { recursive: true });
    
    // Agregar proyecto
    projects.push(newProject);
    
    // Guardar
    await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    
    // Limpiar cache para que los cambios se vean reflejados
    clearProjectsCache();
    
    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Error al crear proyecto' }, { status: 500 });
  }
}

// PUT - Actualizar el orden de todos los proyectos
export async function PUT(request: NextRequest) {
  try {
    const { projects } = await request.json();
    
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    console.log("💾 Guardando nuevo orden de proyectos en JSON...");
    
    await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    
    // Limpiar cache
    clearProjectsCache();
    console.log("✅ Cache de proyectos limpiada.");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating projects order:', error);
    return NextResponse.json({ error: 'Error al actualizar el orden' }, { status: 500 });
  }
}
