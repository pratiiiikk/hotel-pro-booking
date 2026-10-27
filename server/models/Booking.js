
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true },
    status: { type: String, default: "booked" },
    paymentMethod: { type: String, default: "Pay at Hotel" },
    isPaid: { type: Boolean, default: false },
}, { timestamps: true, strict: false });

bookingSchema.index({ room: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ hotel: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;




// =========================================================
// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//     user: {type: String, required: true, ref: "User"},
//     room: {type: String, required: true, ref: "Room"},
//     hotel: {type: String, required: true, ref: "Hotel"},
//     checkInDate: {type: Date, required: true},
//     checkOutDate: {type: Date, required: true},
//     totalPrice: {type: Number, required: true},
//     guests: {type: Number, required: true},
//     status: {
//         type: String,
//         enum: ["pending", "confirmed", "cancelled"],
//         default: "pending",
//     },
//     paymentMethod: {
//         type: String, 
//         required: true,
//         default: "Pay at Hotel",
//     },
//     isPaid: {type: Boolean, default: false},
// }, {timestamps: true}
// );


// const Booking = mongoose.model("Room", bookingSchema);

// export default Booking;