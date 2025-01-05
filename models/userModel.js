const db = require('../config/db');

// Fungsi untuk membuat pengguna baru
const createUser = async (email, passwordHash) => {
  return db.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
};

// Fungsi untuk mencari pengguna berdasarkan email
const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0]; // Mengembalikan pengguna pertama jika ditemukan
};

// Fungsi untuk memperbarui resetCode pengguna
const updateResetCode = async (email, resetCode) => {
  return db.query('UPDATE users SET reset_code = ? WHERE email = ?', [resetCode, email]);
};

// Fungsi untuk memperbarui password pengguna
const updatePassword = async (email, newPasswordHash) => {
  return db.query('UPDATE users SET password_hash = ?, reset_code = NULL WHERE email = ?', [newPasswordHash, email]);
};

module.exports = { createUser, findUserByEmail, updateResetCode, updatePassword };
