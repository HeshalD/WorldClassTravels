import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/visa/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only (jpeg, jpg, png, gif)');
    }
}

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Create a function to handle the file upload
const handleUpload = upload.single('coverImage');

// Middleware to handle file upload
const uploadVisaImage = (req, res, next) => {
    // First handle the file upload
    handleUpload(req, res, function (err) {
        // Log after the file has been processed
        console.log("After upload - BODY:", req.body);
        console.log("After upload - FILE:", req.file);
        
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size exceeds 5MB limit'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        // If there's a file, add its path to the request body
        if (req.file) {
            // Create a relative path for the database
            const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
            // Ensure path uses forward slashes
            const normalizedPath = `/${relativePath.replace(/\\/g, '/')}`;
            
            // Add to req.body for the next middleware
            req.body.coverImage = normalizedPath;
            req.body.imagePath = req.file.path;
            
            console.log("Processed file path:", normalizedPath);
        } else {
            console.log("No file was uploaded");
        }

        next();
    });
};

export default uploadVisaImage;
