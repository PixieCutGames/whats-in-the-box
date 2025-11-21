import { Resend } from "resend";
import { passwordResetConfirmationTemplate } from "./passwordResetConfirmationTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetConfirmationEmail(email: string) {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  return resend.emails.send({
    from: `Whats in the box <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Your What’s in the Box password was reset",
    html: passwordResetConfirmationTemplate(loginUrl),
  });
}
