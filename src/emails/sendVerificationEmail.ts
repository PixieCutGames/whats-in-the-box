import { Resend } from "resend";
import { verificationEmailTemplate } from "./verificationEmailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  console.log(process.env.RESEND_API_KEY);

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = verificationEmailTemplate(verificationUrl); // from template below

  return resend.emails.send({
    from: `Whats in the box <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Verify your email for What’s in the Box",
    html,
  });
}
