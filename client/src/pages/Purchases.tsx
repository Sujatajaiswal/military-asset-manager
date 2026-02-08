import React, { useState } from "react";
import axios from "axios";
import { ShoppingCart } from "lucide-react";

type PurchaseForm = {
  equipment_id: number;
  base_id: number;
  quantity: number;
};

const Purchases: React.FC = () => {
  const [formData, setFormData] = useState<PurchaseForm>({
    equipment_id: 0,
    base_id: 1, // default base (North Base)
    quantity: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.equipment_id || !formData.base_id || formData.quantity <= 0) {
      alert("Please fill all fields correctly.");
      return;
    }

    // Backend expects `to_base_id`
    const payload = {
      equipment_id: formData.equipment_id,
      to_base_id: formData.base_id,
      quantity: formData.quantity,
    };

    try {
      await axios.post(
        "https://military-asset-manager-1-5ku6.onrender.com/api/assets/purchase",
        payload,
        {
          headers: {
            "x-user-role": "LOGISTICS", // ✅ RBAC role
          },
        },
      );

      alert("Asset procured successfully ✅");

      // Reset quantity only (UX friendly)
      setFormData((prev) => ({
        ...prev,
        quantity: 1,
      }));
    } catch (err: any) {
      console.error("Purchase error:", err);
      alert(
        err?.response?.data?.error ||
          "Purchase failed. Check server or permissions.",
      );
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-8 border-b pb-4">
        <ShoppingCart className="text-green-600" size={32} />
        <h1 className="text-3xl font-bold">Asset Procurement</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600"
      >
        <div className="space-y-4">
          {/* Equipment */}
          <select
            className="w-full border p-2 rounded"
            value={formData.equipment_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                equipment_id: Number(e.target.value),
              })
            }
          >
            <option value={0}>-- Select Asset --</option>
            <option value={1}>M4 Carbine</option>
            <option value={2}>Humvee</option>
            <option value={3}>5.56mm Ammo</option>
          </select>

          {/* Base */}
          <select
            className="w-full border p-2 rounded"
            value={formData.base_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                base_id: Number(e.target.value),
              })
            }
          >
            <option value={1}>North Base</option>
            <option value={2}>South Base</option>
          </select>

          {/* Quantity */}
          <input
            type="number"
            min={1}
            className="w-full border p-2 rounded"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: Number(e.target.value) || 1,
              })
            }
            placeholder="Quantity"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition"
          >
            Finalize Purchase
          </button>
        </div>
      </form>
    </div>
  );
};

export default Purchases;
