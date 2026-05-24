import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📌 Single file upload with best options
export const getCloudinaryResponse = async (file) => {
    try {
        // Base64 with proper MIME type
        const mimeType = file.mimetype; // e.g., "image/jpeg"
        const base64 = file.buffer.toString("base64");
        const fileuri = `data:${mimeType};base64,${base64}`;

        const result = await cloudinary.uploader.upload(fileuri, {
            folder: "GlamGully Products", // Organize uploads
            use_filename: true,           // Keep original filename
            unique_filename: true,        // Avoid overwriting
            overwrite: false,             // Don't replace existing files
            resource_type: "auto",        // Auto-detect (image/video)
            quality: "auto:best",         // Best quality with compression
            fetch_format: "auto",         // Best format for browser (WebP/AVIF/JPEG)
            transformation: [
                { width: 1200, crop: "limit" }, // Max width 1200px
                { quality: "auto" },            // Auto compression
                { fetch_format: "auto" }        // Auto format change
            ],
            eager_async: true // Transformations run async (faster upload)
        });

        return result.secure_url;

    } catch (error) {
        console.log("Cloudinary upload error:", error.message);
    }
};

// 📌 Multiple files handler
export const uploadMultipleImages = async (files) => {
    try {
        const urls = [];

        for (const file of files) {
            const url = await getCloudinaryResponse(file);
            if (url) urls.push(url);
        }

        return urls; // array of secure URLs

    } catch (err) {
        console.log("Multiple image upload error:", err.message);
        return [];
    }
};

export default cloudinary;
