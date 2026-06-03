import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../config/env.config.js";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

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