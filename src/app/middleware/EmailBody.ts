export const emailBody = (fullName: string, otp: string) => {
  const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(90deg, #007BFF, #FF6B35); padding: 15px 20px; color: white; text-align: center;">
      <h2 style="margin: 0;">Account Verification</h2>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px;">Hi <b>${fullName}</b>,</p>
      <p style="font-size: 15px;">Your One-Time Password (OTP) for account verification is:</p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #007BFF; background-color: #eaf3ff; padding: 10px 20px; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">⚠ This OTP is valid for <b style="color: #FF6B35;">5 minutes</b>. If you didn’t request this, please ignore this email.</p>
      <p style="font-size: 14px; margin-top: 20px;">Thanks,<br><b>The Support Team</b></p>
    </div>
    <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #777;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
</div>
`;
return html
};
export const emailBodyOtp = (fullName: string, otp: string) => {
 const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(90deg, #007BFF, #FF6B35); padding: 15px 20px; color: white; text-align: center;">
      <h2 style="margin: 0;">Password Reset Request</h2>
    </div>
    
    <!-- Body -->
    <div style="padding: 20px;">
      <p style="font-size: 16px;">Hi <b>${fullName}</b>,</p>
      <p style="font-size: 15px;">Your OTP for password reset is:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #007BFF; background-color: #eaf3ff; padding: 10px 20px; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 14px; color: #555;">⚠ This OTP is valid for <b style="color: #FF6B35;">5 minutes</b>. If you did not request this, please ignore this email.</p>
      <p style="font-size: 14px; margin-top: 20px;">Thanks,<br><b>The Support Team</b></p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #777;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
</div>
`;

return html
};
