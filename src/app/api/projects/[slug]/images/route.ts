import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type RouteParams = { params: Promise<{ slug: string }> };

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

// POST - Subir archivos (imágenes o videos)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'images'; // 'images' o 'videos'
    
    const formData = await request.formData();
    const projectDir = path.join(process.cwd(), 'public', 'projects', slug, type);
    
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

    // Actualizar JSON
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const { projects } = JSON.parse(data);
    
    const index = projects.findIndex((p: any) => p.slug === slug);
    if (index !== -1) {
      const field = type === 'videos' ? 'videos' : 'images';
      const existingFiles = projects[index][field] || [];
      const combinedFiles = Array.from(new Set([...existingFiles, ...uploadedFiles]));
      projects[index][field] = combinedFiles;
      await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    }
    
    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Error al subir archivos' }, { status: 500 });
  }
}

// DELETE - Eliminar un archivo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const type = searchParams.get('type') || 'images';

    if (!filename) return NextResponse.json({ error: 'Nombre de archivo requerido' }, { status: 400 });

    // 1. Eliminar archivo físico
    const filepath = path.join(process.cwd(), 'public', 'projects', slug, type, filename);
    try {
      await fs.unlink(filepath);
    } catch (e) {
      console.warn("Archivo no encontrado en disco");
    }

    // 2. Actualizar JSON
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const { projects } = JSON.parse(data);
    
    const index = projects.findIndex((p: any) => p.slug === slug);
    if (index !== -1) {
      const field = type === 'videos' ? 'videos' : 'images';
      projects[index][field] = (projects[index][field] || []).filter((f: string) => f !== filename);
      
      // Si el archivo borrado era la portada, resetear cover
      if (projects[index].cover === filename) {
        projects[index].cover = projects[index].images[0] || '';
      }
      
      await fs.writeFile(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 });
  }
}
