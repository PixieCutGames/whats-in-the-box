import { Resend } from "resend";
import { forgotPasswordTemplate } from "./forgotPasswordTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendForgotPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return resend.emails.send({
    from: `Whats in the box <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Reset your What’s in the Box password",
    html: forgotPasswordTemplate(resetUrl),
  });
}
