const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM vendor_c");
  res.json(result.rows);
});

// POST
router.post("/", async (req, res) => {
  const { id, name, category, base_price, tax, stock } = req.body;

  await pool.query(
    "INSERT INTO vendor_c (id, name, category, base_price, tax, stock) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, name, category, base_price, tax, stock]
  );

  res.json({ message: "Data Vendor C ditambahkan" });
});

// PUT
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, base_price, tax, stock } = req.body;

  await pool.query(
    "UPDATE vendor_c SET name=$1, category=$2, base_price=$3, tax=$4, stock=$5 WHERE id=$6",
    [name, category, base_price, tax, stock, id]
  );

  res.json({ message: "Data Vendor C diperbarui" });
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM vendor_c WHERE id=$1", [req.params.id]);
  res.json({ message: "Data Vendor C dihapus" });
});

module.exports = router;
