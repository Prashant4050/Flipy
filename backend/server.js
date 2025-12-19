// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------ User Model ------------------
const User = require('./models/User');

// ------------------ JWT Helper ------------------
const createToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2d' });
};

// ------------------ Email Transporters ------------------
const transporter1 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER1,
    pass: process.env.EMAIL_PASS1,
  },
});

const transporter2 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER2,
    pass: process.env.EMAIL_PASS2,
  },
});

// ------------------ OTP Store ------------------
let otpStore = {}; // { email: otp }

// ------------------ SignUp OTP ------------------

// 1️⃣ Send OTP for SignUp
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "❗ Email is required" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ msg: "⚠️ Email already registered" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER1,
    to: email,
    subject: "Flipy Email Verification OTP",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter1.sendMail(mailOptions);
    console.log(`✅ SignUp OTP sent to ${email}`);
    res.status(200).json({ msg: "✅ OTP sent successfully!" });

    // Auto-delete OTP after 5 minutes
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
  } catch (err) {
    console.error("❌ SignUp OTP error:", err.message);
    res.status(500).json({ msg: "❌ Failed to send OTP" });
  }
});

// 2️⃣ Verify OTP for SignUp
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email];
    return res.json({ success: true, msg: "✅ OTP verified successfully!" });
  } else {
    return res.status(400).json({ success: false, msg: "❌ Invalid OTP" });
  }
});

// ------------------ Register ------------------
app.post('/api/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !mobile || !password) return res.status(400).json({ msg: '❗ All fields required.' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ msg: '⚠️ User already exists.' });

    // Let the User model pre-save hook hash the password
    const newUser = new User({ name, email, mobile, password });
    await newUser.save();

    res.status(201).json({ msg: '✅ Account created successfully!' });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ msg: '❌ Server error.' });
  }
});

// ------------------ Login ------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: '❗ Email and password required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: '❌ Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: '❌ Invalid credentials.' });

    const token = createToken(user);
    res.status(200).json({ token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ msg: '❌ Server error.' });
  }
});

// ------------------ Forgot Password ------------------

// 1️⃣ Send OTP
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: '❗ Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: '❌ User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: `"Flipy Support" <${process.env.EMAIL_USER1}>`,
    to: email,
    subject: '🔑 Password Reset OTP - Flipy',
    text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter1.sendMail(mailOptions);
    console.log(`✅ Forgot Password OTP sent to ${email}`);
    res.json({ msg: '✅ OTP sent to your email.' });

    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
  } catch (err) {
    console.error('❌ OTP send error:', err.message);
    res.status(500).json({ msg: '❌ Failed to send OTP' });
  }
});

// 2️⃣ Verify OTP
app.post('/api/forgot-password/verify', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] == otp) {
    return res.json({ success: true, msg: '✅ OTP verified' });
  } else {
    return res.status(400).json({ success: false, msg: '❌ Invalid OTP' });
  }
});

// 3️⃣ Reset Password
app.post('/api/forgot-password/reset', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ msg: '❗ Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    delete otpStore[email];
    res.json({ msg: '✅ Password updated successfully!' });
  } catch (err) {
    console.error('❌ Password reset error:', err.message);
    res.status(500).json({ msg: '❌ Failed to reset password' });
  }
});

// ------------------ Book Swap Email ------------------
app.post('/api/swap', async (req, res) => {
  const { name, email, giveBook, wantBook } = req.body;
  if (!name || !email || !giveBook || !wantBook) return res.status(400).json({ message: '❗ All fields required.' });

  const useFirst = Math.random() < 0.5;
  const transporter = useFirst ? transporter1 : transporter2;
  const receiverEmail = useFirst ? process.env.EMAIL_USER1 : process.env.EMAIL_USER2;

  const mailOptions = {
    from: `"Flipy Book Swap" <${email}>`,
    to: receiverEmail,
    subject: `📚 Book Swap Request from ${name}`,
    text: `
📚 Book Swap Request

👤 Name: ${name}
📧 Email: ${email}
📘 Book to Give: ${giveBook}
📗 Book Wanted: ${wantBook}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: `✅ Email sent successfully via ${receiverEmail}` });
  } catch (err) {
    console.error(`❌ Email failed:`, err.message);
    res.status(500).json({ message: '❌ Email failed to send' });
  }
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
