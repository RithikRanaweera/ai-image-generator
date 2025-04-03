import exp from "constants";
import express from "express";
import mongoose from "mongoose";


const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("Database Connected");
    });

    // Connect using the MONGODB_URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export default connectDB;