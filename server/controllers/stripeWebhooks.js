import stripe from 'stripe';
import Booking from '../models/Booking.js';

//* API to handle Stripe Webhooks

export const stripeWebhooks = async (request, response) => {
    console.log("Stripe Webhook received!");
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Webhook Event Type:", event.type);
    } catch (error) {
        console.log("Webhook Signature Verification Failed:", error.message);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { bookingId } = session.metadata;

        console.log("Session Metadata Booking ID:", bookingId);

        if (bookingId) {
            try {
                // Mark Payment as Paid
                const updatedBooking = await Booking.findByIdAndUpdate(bookingId, 
                    { isPaid: true, paymentMethod: "Stripe" }, 
                    { new: true }
                );
                
                if (updatedBooking) {
                    console.log(`Successfully updated Booking ID: ${bookingId} to Paid`);
                } else {
                    console.log(`Booking ID: ${bookingId} not found in database during webhook update`);
                }
            } catch (dbError) {
                console.log("Database Update Error during Webhook:", dbError.message);
            }
        } else {
            console.log("No bookingId found in session metadata");
        }

    } else {
        console.log("Unhandled event type:", event.type);
    }
    response.json({ received: true });
}