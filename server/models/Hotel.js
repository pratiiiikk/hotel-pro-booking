import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    contact: {type: String, required: true},
    owner: {type: String, required: true, ref: "User"},
    city: {type: String, required: true},
}, {timestamps: true});

hotelSchema.index({ city: 1 });


const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;