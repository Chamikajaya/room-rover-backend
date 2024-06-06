import { transporter } from "./sendVerificationEmail";

export const sendBookingConfirmationEmail = async (
    email: string,
    numAdults: number,
    numChildren: number,
    checkIn: string,
    checkOut: string,
    totalPrice: number,
    hotelName: string,
    city: string,
    country: string
) => {


    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Booking Confirmation @RoomRover',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="text-align: center; color: #b33dc9;">Booking Confirmation</h1>
            <p>Dear Customer,</p>
            <p>Thank you for your booking at <b style="color: #b33dc9;">${hotelName}, ${city} - ${country}</b>. Here are your booking details:</p>
            <ul style="list-style-type: none;">
                <li><b>Number of Adults:</b> ${numAdults}</li>
                <li><b>Number of Children:</b> ${numChildren}</li>
                <li><b>Check-in Date:</b> ${checkIn}</li>
                <li><b>Check-out Date:</b> ${checkOut}</li>
                <li><b>Total Price:</b> $${totalPrice.toFixed(2)}</li>
            </ul>
            <p>We look forward to welcoming you soon!</p>
            <p>Best Regards,</p>
            <p style="color: #b33dc9;"><b>RoomRover Team</b></p>
        </div>
    `
    };

    await transporter.sendMail(mailOptions);
};
