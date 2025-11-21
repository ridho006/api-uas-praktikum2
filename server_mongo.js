require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Movie = require('./models/movie');
const Director = require('./models/director');

connectDB();
const app = express();
const PORT = process.env.PORT || 3300;

app.use(cors());
app.use(express.json());

// ============================ MOVIES ================================== \\

app.get('/status', (req, res) => {
    res.json({ ok: true, service: 'film-api' });
});

// GET /movies - Menggunakan Mongoose find()
app.get('/movies', async (req, res, next) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
    } catch (err) {
        next(err);
    }
});

// GET /movies/:id - Menggunakan Mongoose findById()
app.get('/movies/:id', async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }
        res.json(movie);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// POST /movies - Menggunakan Mongoose save()
app.post('/movies', async (req, res, next) => {
    try {
        const newMovie = new Movie({
            title: req.body.title,
            director: req.body.director, year: req.body.year
        });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
});

// PUT /movies/:id - Menggunakan Mongoose findByIdAndUpdate()
app.put('/movies/:id', async (req, res, next) => {
    try {
        const { title, director, year } = req.body;
        if (!title || !director || !year) {
            return res.status(400).json({ error: 'title, director, year wajib diisi' });
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id, { title, director, year }, { new: true, runValidators: true }
        );

        if (!updatedMovie) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }

        res.json(updatedMovie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// DELETE /movies/:id - Menggunakan Mongoose findByIdAndDelete()
app.delete('/movies/:id', async (req, res, next) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ error: 'Film tidak ditemukan' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// ============================= DIRECTORS ================================= \\

// GET /director - Menggunakan Mongoose find()
app.get('/director', async (req, res, next) => {
    try {
        const director = await Director.find({});
        res.json(director);
    } catch (err) {
        next(err);
    }
});

// GET /director/:id - Menggunakan Mongoose findById()
app.get('/director/:id', async (req, res, next) => {
    try {
        const director = await Director.findById(req.params.id);
        if (!director) {
            return res.status(404).json({ error: 'director tidak ditemukan' });
        }
        res.json(director);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// POST /director - Menggunakan Mongoose save()
app.post('/director', async (req, res, next) => {
    try {
        const newDirector = new Director({
            name: req.body.name,
            birthyear: req.body.birthyear
        });
        const savedDirector = await newDirector.save();
        res.status(201).json(savedDirector);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
});

// PUT /director/:id - Menggunakan Mongoose findByIdAndUpdate()
app.put('/director/:id', async (req, res, next) => {
    try {
        const { name, birthyear } = req.body;
        if (!name || !birthyear) {
            return res.status(400).json({ error: 'name dan birthyear wajib diisi' });
        }

        const updatedDirector = await Director.findByIdAndUpdate(
            req.params.id, { name, birthyear }, { new: true, runValidators: true }
        );

        if (!updatedDirector) {
            return res.status(404).json({ error: 'Director tidak ditemukan' });
        }

        res.json(updatedDirector);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// DELETE /director/:id - Menggunakan Mongoose findByIdAndDelete()
app.delete('/director/:id', async (req, res, next) => {
    try {
        const deletedDirector = await Director.findByIdAndDelete(req.params.id);
        if (!deletedDirector) {
            return res.status(404).json({ error: 'Director tidak ditemukan' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Format ID tidak valid' });
        }
        next(err);
    }
});

// ============================================================== \\

app.use((req, res) => {
    res.status(404).json({ error: 'Rute tidak ditemukan' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'erjadi kesalahan pada server' });
});

app.listen(PORT, () => {
    console.log('Server aktif di http://localhost:${PORT}');
});