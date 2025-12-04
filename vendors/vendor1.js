const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authorizeRole } = require('../middleware/auth');


router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_a");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get('/:kd_produk', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_a WHERE kd_produk = $1", [req.params.kd_produk]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticateToken, async (req, res, next) => {
    const { kd_produk, nm_brg, hrg, ket_stok } = req.body;
    try {
        const sql = `
            INSERT INTO vendor_a (kd_produk, nm_brg, hrg, ket_stok)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await db.query(sql, [kd_produk, nm_brg, hrg, ket_stok]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:kd_produk',[authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const {kd_produk} = req.params;
    const {nm_brg, hrg, ket_stok } = req.body;

    try {
        const sql = `
            UPDATE vendor_a SET nm_brg=$1, hrg=$2, ket_stok=$3
            WHERE kd_produk=$4 RETURNING *
        `;
        const result = await db.query(sql, [nm_brg, hrg, ket_stok, kd_produk]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:kd_produk',[authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    try {
        const result = await db.query("DELETE FROM vendor_a WHERE kd_produk=$1 RETURNING *", [req.params.kd_produk]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
