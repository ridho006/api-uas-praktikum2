const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { authenticateToken, authorizeRole } = require('./middleware/auth.js');


const app = express();
const PORT = process.env.PORT || 3300;
// const JWT_SECRET = process.env.JWT_SECRET;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// Import vendor routes
const vendorA = require("./vendors/vendor1");
const vendorB = require("./vendors/vendor2");
const vendorC = require("./vendors/vendor3");

// Registrasi route
app.use("/vendor1", vendorA);
app.use("/vendor2", vendorB);
app.use("/vendor3", vendorC);


// === ROUTES ===
app.get('/status', (req, res) => {
    res.json({ ok: true, service: 'film-api' });
});

// === AUTH ROUTES (Refactored for pg) ===
// app.post('/auth/register', async (req, res, next) => {
//     const { username, password } = req.body;

//     if (!username || !password || password.length < 6) {
//         return res.status(400).json({ error: 'username dan password(min 6 char) harus diisi' });
//     }
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const sql = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username';
//         const result = await db.query(sql, [username.toLowerCase(), hashedPassword, 'user']);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         if (err.code === '23505') { // Kode error unik PostgreSQL
//             return res.status(409).json({ error: 'Username sudah digunakan' });
//         }
//         next(err);
//     }
// });

// app.post('/auth/register-admin', async (req, res, next) => {
//     const { username, password } = req.body;

//     if (!username || !password || password.length < 6) {
//         return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
//     }
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const sql = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username';
//         const result = await db.query(sql, [username.toLowerCase(),
//         hashedPassword, 'admin']);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         if (err.code === '23505') {
//             return res.status(409).json({ error: 'Username sudah digunakan' });
//         }
//         next(err);
//     }
// });

// app.post('/auth/login', async (req, res, next) => {
//     const { username, password } = req.body;

//     try {
//         const sql = "SELECT * FROM users WHERE username = $1";
//         const result = await db.query(sql, [username.toLowerCase()]);
//         const user = result.rows[0];

//         if (!user) {
//             return res.status(401).json({ error: 'Kredensial tidak valid' });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(401).json({ error: 'Kredensial tidak valid' });
//         }
//         const payload = { user: { id: user.id, username: user.username, role: user.role } };
//         const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
//         res.json({ message: 'Login berhasil', token: token });
//     } catch (err) {
//         next(err);
//     }
// });

// === FALLBACK & ERROR HANDLING ===
app.use((req, res) => {
    res.status(404).json({ error: 'Rute tidak ditemukan' });
});

app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server aktif di http://localhost:${PORT}');
});