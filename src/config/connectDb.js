import mongoose from "mongoose";

// Connect to MongoDB
const connectDb = async (mongoUri) => {
    try {
        await mongoose.connect(mongoUri);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDb;
