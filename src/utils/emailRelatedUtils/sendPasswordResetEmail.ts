import {transporter} from "./sendVerificationEmail";



export const sendPasswordResetEmail = async (email: string, resetToken: string) => {

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;  // 👉 the URL to which the user will be redirected to reset the password

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Reset Your Password @RoomRover ',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    };

    await transporter.sendMail(mailOptions);
};