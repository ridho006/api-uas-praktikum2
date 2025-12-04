const express = require('express');
const db = require('../db.js');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_c ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const { product_id, name, category, base_price, tax, stock } = req.body;
    try {
        const sql = `
            INSERT INTO vendor_c (product_id, name, category, base_price, tax, stock)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await db.query(sql, [product_id, name, category, base_price, tax, stock]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});



module.exports = router;