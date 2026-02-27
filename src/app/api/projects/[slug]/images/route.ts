import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

type RouteParams = { params: Promise<{ slug: string }> };

// POST - Subir archivos directamente a Cloudinary y guardar URL en Supabase
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'images'; // 'images' o 'videos'
    
    const formData = await request.formData();
    const uploadedUrls: string[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Convertir File a base64 para subir a Cloudinary
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64File = `data:${value.type};base64,${buffer.toString('base64')}`;
        
        // Subir a la carpeta del proyecto en Cloudinary
        const result = await uploadToCloudinary(base64File, slug);
        uploadedUrls.push(result.url);
      }
    }

    // 1. Obtener proyecto actual de Supabase
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('images, videos')
      .eq('slug', slug)
      .single();

    if (fetchError || !project) throw new Error('Proyecto no encontrado');

    // 2. Actualizar el array correspondiente (imágenes o videos)
    const field = type === 'videos' ? 'videos' : 'images';
    const existingFiles = project[field] || [];
    const updatedFiles = [...existingFiles, ...uploadedUrls];

    const { error: updateError } = await supabase
      .from('projects')
      .update({ [field]: updatedFiles })
      .eq('slug', slug);

    if (updateError) throw updateError;
    
    return NextResponse.json({ success: true, files: uploadedUrls });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: error.message || 'Error al subir archivos' }, { status: 500 });
  }
}

// DELETE - Eliminar un archivo de Cloudinary y de Supabase
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('filename'); // Ahora recibimos la URL completa
    const type = searchParams.get('type') || 'images';

    if (!fileUrl) return NextResponse.json({ error: 'URL de archivo requerida' }, { status: 400 });

    // 1. Extraer public_id de la URL para borrar en Cloudinary
    // Formato típico: .../noreste-arq/slug/public_id.jpg
    const parts = fileUrl.split('/');
    const lastPart = parts[parts.length - 1];
    const folderPart = parts[parts.length - 2];
    const rootPart = parts[parts.length - 3];
    const publicId = `${rootPart}/${folderPart}/${lastPart.split('.')[0]}`;

    await deleteFromCloudinary(publicId);

    // 2. Actualizar Supabase
    const { data: project } = await supabase
      .from('projects')
      .select('images, videos, cover')
      .eq('slug', slug)
      .single();

    if (project) {
      const field = type === 'videos' ? 'videos' : 'images';
      const updatedFiles = (project[field] || []).filter((f: string) => f !== fileUrl);
      
      const updateData: any = { [field]: updatedFiles };
      
      // Si era la portada, resetear
      if (project.cover === fileUrl) {
        updateData.cover = updatedFiles[0] || '';
      }
      
      await supabase.from('projects').update(updateData).eq('slug', slug);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 });
  }
}
