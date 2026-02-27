import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { clearProjectsCache } from '@/lib/projects';

type RouteParams = { params: Promise<{ slug: string }> };

// GET - Obtener un proyecto por slug desde Supabase
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer proyecto' }, { status: 500 });
  }
}

// PUT - Actualizar proyecto en Supabase
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const updatedData = await request.json();
    
    // Limpiamos el objeto para enviar solo lo que la base de datos espera
    // Evitamos enviar id, created_at o campos que no deben cambiar
    const { id, created_at, slug: bodySlug, ...dataToUpdate } = updatedData;

    const { data, error } = await supabase
      .from('projects')
      .update(dataToUpdate)
      .eq('slug', slug)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    clearProjectsCache();
    
    return NextResponse.json({ success: true, project: data });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar proyecto' }, { status: 500 });
  }
}

// DELETE - Eliminar proyecto de Supabase
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase Delete Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    clearProjectsCache();
    
    return NextResponse.json({ success: true, deleted: data });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar proyecto' }, { status: 500 });
  }
}
