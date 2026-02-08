const db = require("../config/db");

exports.recordPurchase = async (req, res) => {
  const { equipment_id, base_id, quantity } = req.body;

  if (!equipment_id || !base_id || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Record purchase
    await connection.execute(
      `INSERT INTO purchases (equipment_id, base_id, quantity)
       VALUES (?, ?, ?)`,
      [equipment_id, base_id, quantity],
    );

    // 2️⃣ Update inventory balance
    await connection.execute(
      `UPDATE inventory
       SET closing_balance = closing_balance + ?
       WHERE equipment_id = ? AND base_id = ?`,
      [quantity, equipment_id, base_id],
    );

    // 3️⃣ Audit log
    await connection.execute(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, ?, ?)`,
      [
        req.user?.id || null,
        "PURCHASE",
        JSON.stringify({ equipment_id, base_id, quantity }),
      ],
    );

    await connection.commit();
    res.status(201).json({ message: "Asset Procured Successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};
