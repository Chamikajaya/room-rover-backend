"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingConfirmationEmail = void 0;
const sendVerificationEmail_1 = require("./sendVerificationEmail");
const sendBookingConfirmationEmail = (email, numAdults, numChildren, checkIn, checkOut, totalPrice, hotelName, city, country) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield sendVerificationEmail_1.transporter.sendMail(mailOptions);
});
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
