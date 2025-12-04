const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_b");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get('/:sku', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_b WHERE sku = $1", [req.params.sku]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticateToken, async (req, res, next) => {
    const { sku, productName, price, isAvailable } = req.body;
    try {
        const sql = `
            INSERT INTO vendor_b (sku, productName, price, isAvailable)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await db.query(sql, [sku, productName, price, isAvailable]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:sku', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const {sku} = req.params;
    const { productName, price, isAvailable } = req.body;

    try {
        const sql = `
            UPDATE vendor_b SET productName=$1, price=$2, isAvailable=$3
            WHERE sku=$4 RETURNING *
        `;
        const result = await db.query(sql, [productName, price, isAvailable, sku]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:sku', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    try {
        const result = await db.query("DELETE FROM vendor_b WHERE sku=$1 RETURNING *", [req.params.sku]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
