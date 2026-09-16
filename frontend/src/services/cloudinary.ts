const CLOUD_NAME = 'v4p3yjqq';
const UPLOAD_PRESET = 'mod_xclusive_v2';

export async function subirImagenCloudinary(file: File): Promise<string> {
  const formData = new FormData();

  // Petición Unsigned: Únicamente enviamos el archivo y el preset configurado
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    let mensajeError = `Error al subir imagen (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.error?.message) {
        mensajeError = errorData.error.message;
      }
    } catch {
      mensajeError = `Error en el servidor de Cloudinary (${response.statusText || response.status})`;
    }

    console.error('Error Cloudinary:', mensajeError);
    throw new Error(`Cloudinary: ${mensajeError}`);
  }

  const data = await response.json();

  if (!data?.secure_url) {
    throw new Error('Cloudinary no devolvió una URL válida para la imagen.');
  }

  return data.secure_url;
}
