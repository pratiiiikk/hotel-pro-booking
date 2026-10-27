import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes("your_username") || uri.includes("your_mongodb")) {
        console.log("ℹ️  MONGODB_URI not configured - Database features will be paused until URI is provided in .env.");
        return;
    }

    try {
        mongoose.connection.on('connected', () =>
            console.log("Database Connected ✅")
        );
        await mongoose.connect(uri, { dbName: "Hotel-Booking" });

    } catch (error) {
        console.log("DB Error ❌", error.message);
    }
}

export default connectDB;

// import mongoose from "mongoose";

// const connectDB = async ()=> {
//     try {
//         mongoose.connection.on('connected', ()=> console.log("Database Connected"));
//         await mongoose.connect(`${process.env.MONGODB_URI}/Hotel-Booking`)
//     } catch (error) {
//         console.log(error.message);
        
//     }
// }


// export default connectDB;