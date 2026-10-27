import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: {type: String, required: true, ref: "Hotel"},
    roomType: {type: String, required: true},
    pricePerNight: {type: Number, required: true},
    amenities: {type: Array, required: true},
    images: [{type: String, required: true}],
    isAvailable: {type: Boolean, default: true},
}, {timestamps: true});

roomSchema.index({ isAvailable: 1 });


const Room = mongoose.models.Room || mongoose.model("Room", roomSchema); // Use existing model if it exists, otherwise create a new one

export default Room;