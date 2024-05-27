import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


export const sendVerificationEmail = async (email: string, verificationToken: string) => {

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;  // 👉 the URL to which the user will be redirected to verify the email

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verify Your Email Address @RoomRover ',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    };
    
    await transporter.sendMail(mailOptions);
};