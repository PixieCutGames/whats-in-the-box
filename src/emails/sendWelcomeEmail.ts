import { Resend } from "resend";
import { welcomeEmailTemplate } from "./welcomeEmailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  const html = welcomeEmailTemplate(process.env.FRONTEND_URL!);

  return resend.emails.send({
    from: `Whats in the box <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Welcome to What’s in the Box 🎉",
    html,
  });
}
