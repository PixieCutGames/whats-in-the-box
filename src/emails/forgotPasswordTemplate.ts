export function forgotPasswordTemplate(resetUrl: string) {
  return `
      <!DOCTYPE html>
      <html>
        <body style="background:#f9fafb; padding:40px 0; font-family:Arial, sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="480" style="background:white; border-radius:8px; padding:32px; border:1px solid #e5e7eb;">
                  <tr>
                    <td style="text-align:center;">
                      <h2 style="margin:0; font-size:24px; color:#111827;">
                        Reset Your Password
                      </h2>
  
                      <p style="margin:16px 0 24px; color:#4b5563; font-size:14px;">
                        We received a request to reset your password for 
                        <strong>What’s in the Box</strong>. Click the button below to continue.
                      </p>
  
                      <a href="${resetUrl}"
                         style="background:#3b82f6; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:16px; display:inline-block;">
                        Reset Password
                      </a>
  
                      <p style="margin-top:24px; color:#6b7280; font-size:12px;">
                        If the button doesn't work, copy and paste this link:<br />
                        <a href="${resetUrl}" style="color:#3b82f6; word-break:break-all;">
                          ${resetUrl}
                        </a>
                      </p>
  
                      <hr style="margin:32px 0; border:none; border-top:1px solid #e5e7eb;" />
  
                      <p style="color:#9ca3af; font-size:12px;">
                        If you didn’t request this reset, please ignore this message.
                      </p>
  
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
}
