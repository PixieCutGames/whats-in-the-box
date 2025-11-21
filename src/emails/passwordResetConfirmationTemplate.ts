export function passwordResetConfirmationTemplate(loginUrl: string) {
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
                      <h2 style="margin:0 0 10px; font-size:22px; color:#111827;">
                        Your Password Was Successfully Reset
                      </h2>
  
                      <p style="color:#4b5563; font-size:14px; margin-bottom:24px;">
                        This is a confirmation that your password for <strong>What’s in the Box</strong>
                        has been changed.
                      </p>
  
                      <p style="color:#4b5563; font-size:14px; text-align:left; line-height:1.6;">
                        If this was you — you’re good to go!  
                        If not, please reset your password again and contact support.
                      </p>
  
                      <a href="${loginUrl}"
                         style="background:#3b82f6; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:16px; display:inline-block; margin-top:24px;">
                        Log In
                      </a>
  
                      <hr style="margin:32px 0; border:none; border-top:1px solid #e5e7eb;" />
  
                      <p style="color:#9ca3af; font-size:12px;">
                        If you didn’t request this password change, please secure your account immediately.
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
