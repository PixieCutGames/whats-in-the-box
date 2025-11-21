export function welcomeEmailTemplate(appUrl: string) {
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
                      <h2 style="margin:0 0 10px; font-size:24px; color:#111827;">
                        Welcome to What’s in the Box 🎉
                      </h2>
  
                      <p style="color:#4b5563; font-size:14px; margin-bottom:24px;">
                        We're excited to have you on board! Your storage life is about to get 
                        a whole lot easier.
                      </p>
  
                      <p style="color:#4b5563; font-size:14px; text-align:left; line-height:1.6;">
                        Here’s what you can do next:
                      </p>
                      <ul style="color:#4b5563; font-size:14px; text-align:left; padding-left:20px; line-height:1.6;">
                        <li>Create your first box</li>
                        <li>Add items with photos and descriptions</li>
                        <li>Search instantly across all your boxes</li>
                      </ul>
  
                      <a href="${appUrl}"
                         style="background:#3b82f6; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:16px; display:inline-block; margin-top:24px;">
                        Go to Home Page
                      </a>
  
                      <hr style="margin:32px 0; border:none; border-top:1px solid #e5e7eb;" />
  
                      <p style="color:#9ca3af; font-size:12px;">
                        If you didn’t create this account, please ignore this email.
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
