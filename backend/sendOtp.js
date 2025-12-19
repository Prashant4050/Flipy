// backend/sendOtp.js
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER1, // Your Gmail
    pass: process.env.EMAIL_PASS1, // App password
  },
});

// In-memory store for dev/testing. Use Redis or DB in production.
// Structure: { [email]: { code: string, createdAt: number, attempts: number } }
let otpStore = {};

// ✅ Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, msg: "Email is required" });

  const otp = crypto.randomInt(100000, 1000000); // 6-digit OTP, upper bound exclusive
  const code = String(otp);
  otpStore[email] = { code, createdAt: Date.now(), attempts: 0 };

  const mailOptions = {
    from: process.env.EMAIL_USER1,
    to: email,
    subject: "Your Email Verification Code",
    text: `Your OTP is ${code}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') console.log(`OTP sent to ${email}`);
    res.json({ success: true, msg: "OTP sent successfully" });

    // Auto-clear OTP after 5 minutes
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
  } catch (err) {
    console.error("OTP Email Error:", err);
    res.status(500).json({ success: false, msg: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, msg: "Email and OTP required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });

  const maxAge = 5 * 60 * 1000; // 5 minutes
  if (Date.now() - record.createdAt > maxAge) {
    delete otpStore[email];
    return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
  }

  const maxAttempts = 5;
  if (record.attempts >= maxAttempts) {
    delete otpStore[email];
    return res.status(429).json({ success: false, msg: "Too many attempts. Request a new OTP." });
  }

  if (record.code === String(otp)) {
    delete otpStore[email];
    return res.json({ success: true, msg: "OTP verified successfully" });
  } else {
    record.attempts += 1;
    const attemptsLeft = Math.max(0, maxAttempts - record.attempts);
    return res.status(400).json({ success: false, msg: `Invalid OTP (${attemptsLeft} attempts left)` });
  }
};
