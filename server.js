const express = require("express");
const cors = require("cors");
const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
});

// Load environment variables
dotenv.config({ path: "/config/config.env" });

// Enable CORS
app.use(cors({
    origin: "https://frontend-2-2vjy.vercel.app" ||  process.env.FRONTEND_URL,
    credentials: true,
}));
app.options("*", cors());

// Connect to database
connectDatabase();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Start the server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");
    server.close(() => {
        process.exit(1);
    });
});
