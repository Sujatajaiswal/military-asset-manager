import React, { useState } from "react";
import axios from "axios";
import { ClipboardList } from "lucide-react";

type AssignmentType = "Assignment" | "Expenditure";

interface AssignmentData {
  equipment_id: number;
  base_id: number;
  personnel_name: string;
  quantity: number;
  type: AssignmentType;
}

const Assignments: React.FC = () => {
  const [data, setData] = useState<AssignmentData>({
    equipment_id: 0,
    base_id: 1, // Default base (North Base)
    personnel_name: "",
    quantity: 1,
    type: "Assignment",
  });

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !data.equipment_id ||
      !data.base_id ||
      !data.personnel_name.trim() ||
      data.quantity <= 0
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      await axios.post(
        "https://military-asset-manager-1-5ku6.onrender.com/api/assets/assign",
        data,
        {
          headers: {
            "x-user-role": "BASE_COMMANDER", // ✅ REQUIRED for RBAC
            "x-user-base-id": data.base_id, // ✅ REQUIRED for base restriction
          },
        },
      );

      alert(`${data.type} recorded successfully ✅`);

      // Reset only safe fields
      setData((prev) => ({
        ...prev,
        personnel_name: "",
        quantity: 1,
      }));
    } catch (err: any) {
      console.error("Assignment error:", err);
      alert(
        err?.response?.data?.error ||
          "Action failed. Please check server or permissions.",
      );
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8 text-slate-800 border-b pb-4">
        <ClipboardList size={32} />
        <h1 className="text-3xl font-bold">Assignments & Expenditures</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form
          onSubmit={handleAction}
          className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-slate-900"
        >
          <div className="space-y-4">
            {/* Action Type */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Action Type
              </label>
              <select
                className="w-full border p-2 rounded bg-gray-50"
                value={data.type}
                onChange={(e) =>
                  setData({
                    ...data,
                    type: e.target.value as AssignmentType,
                  })
                }
              >
                <option value="Assignment">Assignment (Issued)</option>
                <option value="Expenditure">Expenditure (Consumed)</option>
              </select>
            </div>

            {/* Base */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Base
              </label>
              <select
                className="w-full border p-2 rounded bg-gray-50"
                value={data.base_id}
                onChange={(e) =>
                  setData({
                    ...data,
                    base_id: Number(e.target.value),
                  })
                }
              >
                <option value={1}>North Base</option>
                <option value={2}>South Base</option>
              </select>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Equipment
              </label>
              <select
                className="w-full border p-2 rounded bg-gray-50"
                value={data.equipment_id}
                onChange={(e) =>
                  setData({
                    ...data,
                    equipment_id: Number(e.target.value),
                  })
                }
              >
                <option value={0}>-- Select Asset --</option>
                <option value={1}>M4 Carbine</option>
                <option value={3}>5.56mm Ammo</option>
              </select>
            </div>

            {/* Personnel */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Personnel
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-50"
                value={data.personnel_name}
                onChange={(e) =>
                  setData({
                    ...data,
                    personnel_name: e.target.value,
                  })
                }
                placeholder="Enter personnel name"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                className="w-full border p-2 rounded bg-gray-50"
                value={data.quantity}
                onChange={(e) =>
                  setData({
                    ...data,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
            >
              Authorize Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assignments;
