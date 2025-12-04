const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET – lihat semua data
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM vendor_a");
  res.json(result.rows);
});

// POST – tambah data
router.post("/", async (req, res) => {
  const { kd_produk, nm_brg, hrg, ket_stok } = req.body;

  await pool.query(
    "INSERT INTO vendor_a (kd_produk, nm_brg, hrg, ket_stok) VALUES ($1, $2, $3, $4)",
    [kd_produk, nm_brg, hrg, ket_stok]
  );

  res.json({ message: "Data Vendor A ditambahkan" });
});

// PUT – edit data
router.put("/:kd_produk", async (req, res) => {
  const { kd_produk } = req.params;
  const { nm_brg, hrg, ket_stok } = req.body;

  await pool.query(
    "UPDATE vendor_a SET nm_brg=$1, hrg=$2, ket_stok=$3 WHERE kd_produk=$4",
    [nm_brg, hrg, ket_stok, kd_produk]
  );

  res.json({ message: "Data Vendor A diperbarui" });
});

// DELETE – hapus data
router.delete("/:kd_produk", async (req, res) => {
  await pool.query("DELETE FROM vendor_a WHERE kd_produk=$1", [
    req.params.kd_produk,
  ]);

  res.json({ message: "Data Vendor A dihapus" });
});

module.exports = router;
