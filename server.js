import connectDB from "./src/config/db.config.js";
import app from "./src/app.js";

const port = process.env.PORT || 3000;


await connectDB()

app.listen(port, () => console.log(`✅ Server running on port ${port}`));