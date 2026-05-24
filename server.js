import express from "express";
import connectDB from "./src/config/db.config.js";
import app from "./src/app.js";
import path from "path";

connectDB()

const port = process.env.PORT || 3000;
const _dirname = path.resolve();

// --- Serve Frontend ---
const frontendPath = path.join(_dirname, "/FRONTEND/dist");
app.use(express.static(frontendPath));

// Serve index.html for all non-API routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));