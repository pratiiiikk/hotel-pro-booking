import User from "../models/User.js";
import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            console.log("Auth Middleware: No userId found in req.auth");
            return res.json({ success: false, message: "not authenticated" });
        }

        let user = await User.findById(userId);

        // If user is not in MongoDB (e.g. webhook failed during local dev), fetch from Clerk and create
        if (!user) {
            console.log(`Auth Middleware: User ${userId} not found in DB, attempting fallback sync...`);
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                if (clerkUser) {
                    user = await User.create({
                        _id: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress,
                        username: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                        image: clerkUser.imageUrl,
                    });
                    console.log(`Auth Middleware: Successfully synced user ${userId} to MongoDB.`);
                } else {
                    return res.json({ success: false, message: "User not found in Clerk" });
                }
            } catch (clerkError) {
                console.log("Auth Middleware Sync Error:", clerkError.message);
                return res.json({ success: false, message: "Failed to sync user data" });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};