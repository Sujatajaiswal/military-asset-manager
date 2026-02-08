/**
 * server/index.js
 * Military Asset Management System – Backend Entry
 */

require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authorize = require("./middleware/rbac");

const app = express();
app.use(cors());
app.use(express.json());

/* ======================================================
   AUDIT LOGGER
   ====================================================== */
app.use((req, res, next) => {
  if (req.method !== "GET") {
    console.log(
      `[AUDIT] ${new Date().toISOString()} | ${req.method} ${req.url}`,
    );
  }
  next();
});

/* ======================================================
   DASHBOARD STATS (ADMIN ONLY)
   ====================================================== */
app.get("/api/dashboard/stats", authorize(["ADMIN"]), async (req, res) => {
  try {
    const [[opening]] = await db.query(
      "SELECT SUM(opening_balance) AS total FROM inventory",
    );

    const [[purchases]] = await db.query(
      "SELECT SUM(quantity) AS total FROM asset_movements WHERE type='Purchase'",
    );

    const [[expended]] = await db.query(
      "SELECT SUM(quantity) AS total FROM asset_movements WHERE type='Expenditure'",
    );

    const opening_balance = opening.total || 0;
    const purchase_total = purchases.total || 0;
    const expended_total = expended.total || 0;

    // Transfers cancel out globally
    const net_movement = purchase_total;

    const closing_balance = opening_balance + net_movement - expended_total;

    res.json({
      opening_balance,
      net_movement,
      expended: expended_total,
      closing_balance,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Dashboard stats fetch failed" });
  }
});

/* ======================================================
   PURCHASE ASSET (ADMIN + LOGISTICS)
   ====================================================== */
app.post(
  "/api/assets/purchase",
  authorize(["ADMIN", "LOGISTICS"]),
  async (req, res) => {
    const { equipment_id, to_base_id, quantity } = req.body;

    if (!equipment_id || !to_base_id || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE inventory
         SET closing_balance = closing_balance + ?
         WHERE equipment_id = ? AND base_id = ?`,
        [quantity, equipment_id, to_base_id],
      );

      await conn.execute(
        `INSERT INTO asset_movements
         (type, equipment_id, to_base_id, quantity)
         VALUES ('Purchase', ?, ?, ?)`,
        [equipment_id, to_base_id, quantity],
      );

      await conn.commit();
      res.status(201).json({ message: "Asset procured successfully" });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Purchase failed" });
    } finally {
      conn.release();
    }
  },
);

/* ======================================================
   TRANSFER ASSET (ADMIN + LOGISTICS)
   ====================================================== */
app.post(
  "/api/assets/transfer",
  authorize(["ADMIN", "LOGISTICS"]),
  async (req, res) => {
    const { equipment_id, from_base_id, to_base_id, quantity } = req.body;

    if (
      !equipment_id ||
      !from_base_id ||
      !to_base_id ||
      from_base_id === to_base_id ||
      quantity <= 0
    ) {
      return res.status(400).json({ error: "Invalid transfer data" });
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE inventory
         SET closing_balance = closing_balance - ?
         WHERE equipment_id = ? AND base_id = ?`,
        [quantity, equipment_id, from_base_id],
      );

      await conn.execute(
        `UPDATE inventory
         SET closing_balance = closing_balance + ?
         WHERE equipment_id = ? AND base_id = ?`,
        [quantity, equipment_id, to_base_id],
      );

      await conn.execute(
        `INSERT INTO asset_movements
         (type, equipment_id, from_base_id, to_base_id, quantity)
         VALUES ('Transfer', ?, ?, ?, ?)`,
        [equipment_id, from_base_id, to_base_id, quantity],
      );

      await conn.commit();
      res.json({ message: "Transfer successful" });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Transfer failed" });
    } finally {
      conn.release();
    }
  },
);

/* ======================================================
   ASSIGN / EXPEND ASSET
   (ADMIN + BASE_COMMANDER)
   ====================================================== */
app.post(
  "/api/assets/assign",
  authorize(["ADMIN", "BASE_COMMANDER"]),
  async (req, res) => {
    const { equipment_id, base_id, personnel_name, quantity, type } = req.body;

    if (
      !equipment_id ||
      !base_id ||
      !personnel_name ||
      !["Assignment", "Expenditure"].includes(type) ||
      quantity <= 0
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Base commander restriction
    if (req.user.role === "BASE_COMMANDER" && req.user.base_id !== base_id) {
      return res.status(403).json({
        error: "You can only operate on your assigned base",
      });
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE inventory
         SET closing_balance = closing_balance - ?
         WHERE equipment_id = ? AND base_id = ?`,
        [quantity, equipment_id, base_id],
      );

      await conn.execute(
        `INSERT INTO asset_movements
         (type, equipment_id, from_base_id, quantity)
         VALUES (?, ?, ?, ?)`,
        [type, equipment_id, base_id, quantity],
      );

      await conn.commit();
      res.json({ message: `${type} recorded successfully` });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Assignment failed" });
    } finally {
      conn.release();
    }
  },
);

/* ======================================================
   SERVER START
   ====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Command Center running on port ${PORT}`);
});
