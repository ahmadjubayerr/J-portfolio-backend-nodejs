import nodemailer from "nodemailer";

/**
 * Create SMTP transporter based on environment
 */
const createTransporter = async () => {
  // Option 1: Use specific Email Service (default to gmail if not set)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.trim(), // Handle spaces in password
      },
    });
  }

  // Option 2: Use specific SMTP Host if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Option 3: Fallback to Ethereal (Fake SMTP) for development only if no credentials provided
  if (process.env.NODE_ENV !== "production") {
    console.log("No email credentials found in .env, using Ethereal (fake) email service.");
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // TLS
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  throw new Error("Missing email configuration. Please set EMAIL_SERVICE/USER/PASS or SMTP details in .env");
};

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = await createTransporter();

    const fromEmail =
      process.env.EMAIL_FROM ||
      (process.env.NODE_ENV === "production"
        ? process.env.SMTP_USER
        : "noreply@ethereal.email");

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: "Verify Your Email - OTP Code",
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .otp-box { background: #f8f9ff; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering! Use the OTP below to verify your email:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This OTP expires in 10 minutes.
              </div>
              
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br><strong>Your App Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message — please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent successfully!");
    console.log("Message ID:", info.messageId);

    // Only show preview URL in development (Ethereal)
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, userName = "there") => {
  try {
    const transporter = await createTransporter();

    const fromEmail =
      process.env.EMAIL_FROM ||
      (process.env.NODE_ENV === "production"
        ? process.env.SMTP_USER
        : "noreply@ethereal.email");

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: "Welcome! Your Account is Verified 🎉",
      text: `Welcome ${userName}! Your email has been successfully verified.\n\nThank you for joining us!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .success-icon { font-size: 60px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard! 🎉</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p><strong>Hello ${userName},</strong></p>
              <p>Your email has been successfully verified!</p>
              <p>You now have full access to your account.</p>
              <p>We're excited to have you with us!</p>
              <p>Best regards,<br><strong>Your App Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Non-critical — don't throw
  }
};

/**
 * Send contact form notification email to admin
 * Matches Django's send_contact_email behavior
 */
export const sendContactNotificationEmail = async (contact) => {
  try {
    const transporter = await createTransporter();

    const fromEmail =
      process.env.EMAIL_FROM ||
      (process.env.NODE_ENV === "production"
        ? process.env.SMTP_USER
        : "noreply@ethereal.email");

    const adminEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || "jubayeruiuxjvai@gmail.com";

    const mailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: `New contact in my portfolio Confirmation. - ${contact.name}`,
      text: `Contact Name: ${contact.name}\n\nContact Email:\n${contact.email}\n\nMessage: ${contact.message}\n\n`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: bold; color: #667eea; font-size: 14px; margin-bottom: 5px; }
            .field-value { background: #f8f9ff; border-left: 3px solid #667eea; padding: 12px 15px; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Portfolio Contact</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${contact.name}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${contact.email}</div>
              </div>
              <div class="field">
                <div class="field-label">Message</div>
                <div class="field-value">${contact.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from your portfolio contact form.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact notification email sent for:", contact.name);
  } catch (error) {
    console.error("Error sending contact notification email:", error);
    // Non-critical — don't throw
  }
};
