require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const {authenticateToken, authorizeRole } = require('./middleware/auth.js');

const app = express();
const port = process.env.port || 3200;

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => {
    res.json({ ok: true, service: 'film-api' });
});

// <-=MOVIE======================================================================-> \\

app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
    
});

app.get('/movies/:id', (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }
        res.json(row);
    });
});

app.post('/movies', authenticateToken, (req, res) => {
    const {title, director, year} = req.body;
    if (!title, !director, !year){
        return res.status(400).json({ message: 'title, director, year wajib diisi' });
    }
    const sql = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
    db.run(sql, [title, director, year], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }    
        res.status(201).json({ id: this.lastID, title, director, year });
    });
});

app.put('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const { title, director, year } = req.body;
    const sql = `UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?`;
    db.run(sql, [title, director, year, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }
        res.json({ id: Number(req.params.id), title, director, year });
    });
});

app.delete('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const sql = `DELETE FROM movies WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }
    res.status(204).send();
    });
});

// <-=DIRECTOR======================================================================-> \\

app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
    
});

app.get('/directors/:id', (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Director tidak ditemukan' });
        }
        res.json(row);
    });
});

app.post('/directors', authenticateToken, (req, res) => {
    const {name, birthyear} = req.body;
    if (!name, !birthyear){
        return res.status(400).json({ message: 'name dan birthyear wajib diisi' });
    }
    const sql = 'INSERT INTO directors (name, birthyear) VALUES (?,?)';
    db.run(sql, [name, birthyear], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }    
        res.status(201).json({ id: this.lastID, name, birthyear });
    });
});

app.put('/directors/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const { name, birthyear } = req.body;
    const sql = `UPDATE directors SET name = ?, birthyear = ? WHERE id = ?`;
    db.run(sql, [name, birthyear, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Director tidak ditemukan' });
        }
        res.json({ id: Number(req.params.id), name, birthyear });
    });
});

app.delete('/directors/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const sql = `DELETE FROM directors WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Directors tidak ditemukan' });
        }
    res.status(204).send();
    });
});

// <-=REGISTER======================================================================-> \\

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    if(!username || !password || password.length < 6) {
        return res.status(400).json({error: 'Username dan password (min 6 char) harus diisi'});
    }

    bcrypt.hash(password, 10, (err, hashedpassword) => {
        if (err) {
            console.error("error hashing:", err);
            return res.status(500).json({error:'gagal memproses pendaftaran'});
        }
        
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        const params = [username.toLowerCase(), hashedpassword, 'user'];

        db.run(sql, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(409).json({error:'Username sudah digunakan'});
                }
                console.error("error inserting user:", err);
                return res.status(500).json({error: 'gagal menyimpan pengguna'});
            }
            res.status(201).json({message:'registrasi berhasil', userId: this.lastID});
        });
    });
});

app.post('/auth/register-admin', (req, res) => {
    const { username, password } = req.body;
    if(!username || !password || password.length < 6) {
        return res.status(400).json({error: 'Username dan password (min 6 char) harus diisi'});
    }

    bcrypt.hash(password, 10, (err, hashedpassword) => {
        if (err) {
            console.error("error hashing:", err);
            return res.status(500).json({error:'gagal memproses pendaftaran'});
        }
        
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        const params = [username.toLowerCase(), hashedpassword, 'admin'];

        db.run(sql, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({error:'Username admin sudah ada'});
                }
                //console.error("error inserting user:", err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({message:'Admin berhasil dibuat', userId: this.lastID});
        });
    });
});

app.post('/auth/login', (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({error:'username dan password harus diisi'});
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Kredensial tidak valid' });
            }

            const payload = { user: {
                id: user.id,
                username: user.username,
                role: user.role
            } };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err,token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({ error: 'Gagal membuat token' });
                }
                res.json({ message: 'Login berhasil', token: token});
            });
        });
    });
});

// <-=======================================================================-> \\

app.use((req, res) => {
    res.status(404).json({ error: 'Rute tidak ditemukan' });
});


app.listen(port, () => {
    console.log ('server aktif di http://localhost: ${port}')
});