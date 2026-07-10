import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

const uploadStream = (fileBuffer , folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
            if (error) {
                reject(error);
            } else {      
                resolve(result);
            }
        }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const CloudinaryProvider = {
  uploadStream,
};