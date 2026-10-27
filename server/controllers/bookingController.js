import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

// Function to Check Availability of Room
const checkAvailability = async ({ room }) => {
    try {
        const roomData = await Room.findById(room);
        if (!roomData) {
            return { isAvailable: false, reason: "Room not found" };
        }
        if (!roomData.isAvailable) {
            return { isAvailable: false, reason: "Room is not available!" };
        }

        return { isAvailable: true };
    } catch (error) {
        console.error("Error in checkAvailability:", error.message);
        return { isAvailable: false, reason: "Internal server error" };
    }
}

//! API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room } = req.body;
        const result = await checkAvailability({ room });
        res.json({ success: true, ...result });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//! API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        //* Before Booking Check Availability
        const isAvailableResponse = await checkAvailability({
            room,
        });

        if (!isAvailableResponse.isAvailable) {
            return res.json({ success: false, message: isAvailableResponse.reason });
        }

        //* Get totalPrice from Room Model
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        //* Calculate totalPrice based on number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = (checkOut.getTime() - checkIn.getTime());
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;

        //* Create Booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        try {
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: req.user.email,
                subject: "Booking Confirmation",
                html: `
                    <h2>Your Booking Details</h2>
                    <p>Dear ${req.user.username},</p>
                    <p>Thank You for your booking! Here are your details:</p>
                    <ul>
                        <li><strong>Booking ID:</strong> ${booking._id}</li>
                        <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                        <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                        <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
                        <li><strong>Booking Amount:</strong> ${process.env.currency || '$'} ${booking.totalPrice} /night</li>
                    </ul>
                    <p>We look forward to welcome you!</p>
                    <p>If you need to make any changes, feel free to contact us.</p>
                `,
            }
            await transporter.sendMail(mailOptions)
        } catch (mailError) {
            console.log("Email Notification Error:", mailError.message);
        }

        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};

//! API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user })
            .populate("room", "roomType images pricePerNight")
            .populate("hotel", "name city address")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found" });
        }
        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room", "roomType pricePerNight")
            .populate("hotel", "name city")
            .populate("user", "username email image")
            .sort({ createdAt: -1 })
            .lean();

        //* Total Bookings
        const totalBookings = bookings.length;

        //* Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
}

export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100, // Convert to cents
                },
                quantity: 1,
            }
        ]

        //* Create Stripe Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId,
            }
        })
        res.json({ success: true, url: session.url });

    } catch (error) {
        res.json({ success: false, message: "Payment Failed" });
    }
}

export const verifyStripePayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { bookingId } = session.metadata;
            await Booking.findByIdAndUpdate(bookingId, { isPaid: true, paymentMethod: "Stripe" });
            res.json({ success: true, message: "Payment Verified" });
        } else {
            res.json({ success: false, message: "Payment not completed" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Verification Failed" });
    }
}