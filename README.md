# 📚 Flipy - Book Swap Platform

A modern book exchange platform where users can swap books with each other. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 User Authentication (Sign Up, Login, Forgot Password)
- 📧 Email Verification with OTP
- 📚 Book Swap Requests
- 🔄 Password Reset via Email
- 💌 Beautiful HTML Email Templates
- 🎨 Modern UI with Responsive Design

## 🚀 Tech Stack

### Frontend
- React.js
- React Router
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (Email Service)
- bcryptjs (Password Hashing)

## 📋 Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas)
- [Gmail Account](https://gmail.com) with 2FA enabled for email service
- [Git](https://git-scm.com/)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bookswap.git
cd bookswap
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env
# On Mac/Linux: cp .env.example .env

# Edit .env with your credentials (see Configuration section below)
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install
```

### 4. Configure Environment Variables

Edit `backend/.env` with your credentials:

```env
MONGO_URI=mongodb://localhost:27017/authdb
JWT_SECRET=your_random_secret_key_here
PORT=5000

EMAIL_USER1=your-email@gmail.com
EMAIL_PASS1=your-gmail-app-password

EMAIL_USER2=your-second-email@gmail.com
EMAIL_PASS2=your-gmail-app-password
```

#### 🔑 How to Get Gmail App Password:

1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Copy the 16-character password
5. **Remove all spaces** and paste into `.env`

For detailed instructions, see: `backend/SETUP_GMAIL_APP_PASSWORD.md`

## 🏃‍♂️ Running the Application

### Start MongoDB

Make sure MongoDB is running:

```bash
# Windows
mongod

# Mac (via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Start Backend Server

```bash
cd backend
node server.js
```

Server will run on: http://localhost:5000

### Start Frontend

In a new terminal:

```bash
cd frontend
npm start
```

Frontend will run on: http://localhost:3000

## 🧪 Testing

### Test Email Configuration

```bash
cd backend
node testEmail.js
```

This will:
- Verify email credentials
- Send test emails
- Show any configuration errors

### Test Forgot Password Flow

```bash
cd backend
node testForgotPassword.js
```

### Check System Status

```bash
cd backend
node CHECK_STATUS.js
```

## 📁 Project Structure

```
bookswap/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js
│   ├── sendOtp.js
│   ├── package.json
│   └── [documentation files]
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
├── .gitignore
├── README.md
└── SECURITY_SETUP.md
```

## 📬 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Email Verification
- `POST /api/send-otp` - Send signup OTP
- `POST /api/verify-otp` - Verify signup OTP

### Password Reset
- `POST /api/forgot-password` - Send password reset OTP
- `POST /api/forgot-password/verify` - Verify reset OTP
- `POST /api/forgot-password/reset` - Reset password

### Book Swap
- `POST /api/swap` - Send book swap request

## 🔐 Security

- Passwords hashed with bcrypt
- JWT for authentication
- Environment variables for secrets
- Email OTPs expire after 5 minutes
- .env file excluded from Git

See `SECURITY_SETUP.md` for detailed security information.

## 🐛 Troubleshooting

### Emails not arriving?
1. Check spam/junk folder
2. Verify Gmail app password is correct (no spaces)
3. Check server console for OTP codes
4. See `backend/EMAIL_TROUBLESHOOTING.md`

### MongoDB connection error?
1. Ensure MongoDB is running
2. Check MONGO_URI in .env
3. Verify MongoDB port (default: 27017)

### Server won't start?
1. Check if port 5000 is available
2. Verify all dependencies installed
3. Check .env file exists and is configured

For more help, see documentation in `backend/` folder.

## 📚 Documentation

Detailed documentation available in the `backend/` folder:

- `COMPLETE_EMAIL_SETUP.md` - Full email setup guide
- `EMAIL_TROUBLESHOOTING.md` - Email issues and solutions
- `SETUP_GMAIL_APP_PASSWORD.md` - Gmail app password setup
- `QUICK_REFERENCE.md` - Quick commands and examples
- `SECURITY_SETUP.md` - Security best practices

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- MongoDB for database
- Nodemailer for email service
- React team for amazing frontend framework
- Express team for backend framework

## 📧 Contact

For support or queries, please email: your-email@gmail.com

---

**Made with ❤️ for book lovers**
