import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type RouteParams = { params: Promise<{ slug: string }> };

// POST - Subir imágenes a un proyecto (organizado por tipo)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'exterior'; // 'exterior' o 'interior'
    
    const formData = await request.formData();
    const projectDir = path.join(process.cwd(), 'public', 'projects', slug, type);
    
    // Asegurar que la carpeta existe
    await fs.mkdir(projectDir, { recursive: true });
    
    const uploadedFiles: string[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = value.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filepath = path.join(projectDir, filename);
        
        await fs.writeFile(filepath, buffer);
        uploadedFiles.push(filename);
      }
    }

    const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const { projects } = JSON.parse(data);
    
    const index = projects.findIndex((p: any) => p.slug === slug);
    if (index !== -1) {
      const field = type === 'exterior' ? 'exteriorImages' : 'interiorImages';
      const existingImages = projects[index][field] || [];
      const combinedImages = Array.from(new Set([...existingImages, ...uploadedFiles]));
      projects[index][field] = combinedImages;
      await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    }
    
    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Error al subir imágenes' }, { status: 500 });
  }
}

// DELETE - Eliminar una imagen específica
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const type = searchParams.get('type') || 'exterior';

    if (!filename) return NextResponse.json({ error: 'Nombre de archivo requerido' }, { status: 400 });

    // 1. Eliminar archivo físico
    const filepath = path.join(process.cwd(), 'public', 'projects', slug, type, filename);
    try {
      await fs.unlink(filepath);
    } catch (e) {
      console.error("Archivo no encontrado en disco, procediendo a limpiar JSON");
    }

    // 2. Actualizar JSON
    const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const { projects } = JSON.parse(data);
    
    const index = projects.findIndex((p: any) => p.slug === slug);
    if (index !== -1) {
      const field = type === 'exterior' ? 'exteriorImages' : 'interiorImages';
      projects[index][field] = (projects[index][field] || []).filter((img: string) => img !== filename);
      await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
  }
}

// GET - Listar imágenes de un proyecto por tipo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'exterior';
    
    const projectDir = path.join(process.cwd(), 'public', 'projects', slug, type);
    
    try {
      const files = await fs.readdir(projectDir);
      const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
      return NextResponse.json({ images });
    } catch {
      return NextResponse.json({ images: [] });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al listar imágenes' }, { status: 500 });
  }
}
