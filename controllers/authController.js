const bcrypt = require('bcrypt'); // Untuk enkripsi password
const jwt = require('jsonwebtoken'); // Untuk membuat token JWT
const crypto = require('crypto');
const User = require('../models/userModel'); // Model pengguna
const nodemailer = require('nodemailer');

// Fungsi untuk mengirimkan email reset password
async function sendResetEmail(email, resetCode) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Email pengirim dari .env
            pass: process.env.EMAIL_PASS, // Password pengirim dari .env
        },
    });

    let info = await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`, // Pengirim
        to: email, // Tujuan email
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`,
    });

    console.log('Message sent: %s', info.messageId);
}

// Fungsi Registrasi Pengguna (register)
const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Enkripsi password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Simpan pengguna baru ke database
        await User.createUser(email, passwordHash);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fungsi Login Pengguna (login)
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Buat token JWT jika login berhasil
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fungsi Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Buat kode reset
        const resetCode = crypto.randomBytes(6).toString('hex'); // Kode reset 6 karakter

        // Simpan kode reset ke pengguna
        await User.updateResetCode(email, resetCode);

        // Kirim email dengan kode reset
        await sendResetEmail(email, resetCode);

        res.status(200).json({ message: 'Password reset link has been sent to your email' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fungsi Reset Password (menggunakan kode reset)
const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        // Cari pengguna berdasarkan email
        const user = await User.findUserByEmail(email);

        if (!user || user.reset_code !== resetCode) {
            return res.status(404).json({ message: 'Invalid or expired reset code' });
        }

        // Enkripsi password baru
        const salt = await bcrypt.genSalt(10); // Menambahkan salt untuk keamanan
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password dan reset kode
        await User.updatePassword(email, newPasswordHash);

        res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };
