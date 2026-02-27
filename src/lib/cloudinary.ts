import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Helper para subir una imagen a Cloudinary desde un buffer o base64
 */
export async function uploadToCloudinary(fileUri: string, folder: string) {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: `noreste-arq/${folder}`,
      resource_type: 'auto', // Detecta si es imagen o video
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Helper para eliminar un recurso de Cloudinary
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}
