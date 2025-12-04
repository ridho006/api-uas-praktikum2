const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM vendor_b");
  res.json(result.rows);
});

// POST
router.post("/", async (req, res) => {
  const { sku, productName, price, isAvailable } = req.body;

  await pool.query(
    "INSERT INTO vendor_b (sku, product_name, price, is_available) VALUES ($1, $2, $3, $4)",
    [sku, productName, price, isAvailable]
  );

  res.json({ message: "Data Vendor B ditambahkan" });
});

// PUT
router.put("/:sku", async (req, res) => {
  const { sku } = req.params;
  const { productName, price, isAvailable } = req.body;

  await pool.query(
    "UPDATE vendor_b SET product_name=$1, price=$2, is_available=$3 WHERE sku=$4",
    [productName, price, isAvailable, sku]
  );

  res.json({ message: "Data Vendor B diperbarui" });
});

// DELETE
router.delete("/:sku", async (req, res) => {
  await pool.query("DELETE FROM vendor_b WHERE sku=$1", [req.params.sku]);
  res.json({ message: "Data Vendor B dihapus" });
});

module.exports = router;
