const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar almacenamiento de Cloudinary para multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'autoamericas/vehiculos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
  }
});

// Configurar multer con Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Función para eliminar imagen de Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    // Extraer public_id de la URL de Cloudinary
    // URL formato: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      // Obtener todo después de 'upload/vXXX/' sin la extensión
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Quitar extensión

      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Imagen eliminada de Cloudinary:', publicId, result);
      return result;
    }
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  upload,
  deleteImage
};
