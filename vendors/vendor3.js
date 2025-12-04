const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM vendor_c");

        const tampilan = result.rows.map(item => ({
            id: item.id,
            details: {
                name: item.name,
                category: item.category
            },
            pricing: {
                base_price: item.base_price,
                tax: item.tax
            },
            stock: item.stock
        }));

        res.json(tampilan);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const result = await db.query(
            "SELECT * FROM vendor_c WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Data tidak ditemukan" });

        const d = result.rows[0];

        const tampilan = {
            id: d.id,
            details: {
                name: d.name,
                category: d.category
            },
            pricing: {
                base_price: d.base_price,
                tax: d.tax
            },
            stock: d.stock
        };

        res.json(tampilan);
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticateToken, async (req, res, next) => {
    const { id, name, category, base_price, tax, stock } = req.body;

    try {
        const sql = `
            INSERT INTO vendor_c (id, name, category, base_price, tax, stock)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await db.query(sql, [id, name, category, base_price, tax, stock]);

        const d = result.rows[0];

        const tampilan = {
            id: d.id,
            details: {
                name: d.name,
                category: d.category
            },
            pricing: {
                base_price: d.base_price,
                tax: d.tax
            },
            stock: d.stock
        };

        res.status(201).json(tampilan);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const {id} = req.params;
    const { name, category, base_price, tax, stock } = req.body;

    try {
        const sql = `
            UPDATE vendor_c SET name=$1, category=$2, base_price=$3, tax=$4, stock=$5
            WHERE id=$6 RETURNING *
        `;
        const result = await db.query(sql, [name, category, base_price, tax, stock, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        
        const d = result.rows[0];

        const tampilan = {
            id: d.id,
            details: {
                name: d.name,
                category: d.category
            },
            pricing: {
                base_price: d.base_price,
                tax: d.tax
            },
            stock: d.stock
        };
        res.json(tampilan);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    try {
        const result = await db.query("DELETE FROM vendor_c WHERE id=$1 RETURNING *", [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
