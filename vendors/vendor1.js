const express = require("express");
const router = express.Router();
const db = require("../db");

// GET – lihat semua data
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM vendor_a");
  res.json(result.rows);
});

// GET - lihat berdasarkan kd_produk
router.get("/:kd_produk", async (req, res) => {
  const result = await db.query('SELECT * FROM vendor_a WHERE kd_produk = $1',[req.params.kd_produk]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  res.json(result.rows[0]);
});


// POST – tambah data
router.post("/", async (req, res) => {
  const { kd_produk, nm_brg, hrg, ket_stok } = req.body;

  await db.query(
    "INSERT INTO vendor_a (kd_produk, nm_brg, hrg, ket_stok) VALUES ($1, $2, $3, $4)",
    [kd_produk, nm_brg, hrg, ket_stok]
  );

  res.json({ message: "Data Vendor A telah ditambahkan" });
});

// PUT – edit data
router.put("/:kd_produk", async (req, res) => {
  const { kd_produk } = req.params;
  const { nm_brg, hrg, ket_stok } = req.body;

  await db.query(
    "UPDATE vendor_a SET nm_brg=$1, hrg=$2, ket_stok=$3 WHERE kd_produk=$4",
    [nm_brg, hrg, ket_stok, kd_produk]
  );

  res.json({ message: "Data Vendor A berhasil diperbarui" });
});

// DELETE – hapus data
router.delete("/:kd_produk", async (req, res) => {
  await db.query("DELETE FROM vendor_a WHERE kd_produk=$1", [req.params.kd_produk,]);

  res.json({ message: "Data Vendor A berhasil dihapus" });
});

module.exports = router;
