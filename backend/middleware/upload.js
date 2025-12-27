// In upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "visa_images",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 1200, crop: "limit" }],
      public_id: `visa-${Date.now()}` // Add unique public_id
    };
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadVisaImage = upload.single('coverImage');

export default uploadVisaImage;