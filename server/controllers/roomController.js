import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from 'cloudinary';
import Room from "../models/Room.js";
import { getCache, setCache, delCache } from "../configs/redis.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const {roomType, pricePerNight, amenities} = req.body;
        const hotel = await Hotel.findOne({owner: req.user._id});

        if(!hotel) return res.json({success: false, message: "No Hotel Found"});
        
        // Upload Images to Cloudinary
        const uploadedImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        })
        // Wait for all uploads to compelete
        const images = await Promise.all(uploadedImages)

        await Room.create({
            hotel: hotel._id, 
            roomType, 
            pricePerNight: +pricePerNight, 
            amenities: JSON.parse(amenities), 
            images,
        })

        // Invalidate Redis cache
        await delCache("cache:rooms:all");

        res.json({success: true, message: "Room Created Successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        // Try fetching from Redis cache first
        const cachedRooms = await getCache("cache:rooms:all");
        if (cachedRooms) {
            return res.json({success: true, rooms: cachedRooms, fromCache: true});
        }

        const rooms = await Room.find({isAvailable: true}).populate({
            path: "hotel",
            select: "name address city",
            populate: {
                path: "owner",
                select: "image"
            }
        }).sort({createdAt: -1}).lean();

        // Cache in Redis for 5 minutes (300 seconds)
        await setCache("cache:rooms:all", rooms, 300);

        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({owner: req.user._id})
        const rooms = await Room.find({hotel: hotelData._id.toString()})
            .populate("hotel", "name city address")
            .lean();
        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API to toggle room availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const {roomId} = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();

        // Invalidate Redis cache
        await delCache("cache:rooms:all");

        res.json({success: true, message: "Room Availability Updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
