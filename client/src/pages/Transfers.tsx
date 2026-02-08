import React, { useState } from "react";
import { ArrowLeftRight, Send, History } from "lucide-react";
import axios from "axios";

type TransferData = {
  equipment_id: number;
  from_base_id: number;
  to_base_id: number;
  quantity: number;
};

const Transfers: React.FC = () => {
  const [transferData, setTransferData] = useState<TransferData>({
    equipment_id: 0,
    from_base_id: 1, // default: North Base
    to_base_id: 2, // default: South Base
    quantity: 1,
  });

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !transferData.equipment_id ||
      !transferData.from_base_id ||
      !transferData.to_base_id
    ) {
      alert("Please select the asset and both bases.");
      return;
    }

    if (transferData.from_base_id === transferData.to_base_id) {
      alert("Source and Destination bases must be different.");
      return;
    }

    if (transferData.quantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/assets/transfer",
        transferData,
        {
          headers: {
            "x-user-role": "LOGISTICS", // ✅ RBAC role
          },
        },
      );

      alert("Asset transfer executed successfully ✅");

      // Reset only quantity
      setTransferData((prev) => ({
        ...prev,
        quantity: 1,
      }));
    } catch (err: any) {
      console.error("Transfer error:", err);
      alert(
        err?.response?.data?.error ||
          "Transfer failed. Check stock availability or permissions.",
      );
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8 border-b pb-4">
        <ArrowLeftRight className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-800">
          Inter-Base Transfers
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Form */}
        <form
          onSubmit={handleTransfer}
          className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600"
        >
          <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
            <Send size={20} />
            <h2>Execute Movement</h2>
          </div>

          <div className="space-y-4">
            {/* Equipment */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Asset
              </label>
              <select
                className="w-full border p-2 rounded bg-gray-50"
                value={transferData.equipment_id}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    equipment_id: Number(e.target.value),
                  })
                }
              >
                <option value={0}>-- Choose Equipment --</option>
                <option value={1}>M4 Carbine</option>
                <option value={2}>Humvee</option>
                <option value={3}>5.56mm Ammo</option>
              </select>
            </div>

            {/* Bases */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  From Base
                </label>
                <select
                  className="w-full border p-2 rounded bg-gray-50 text-xs"
                  value={transferData.from_base_id}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      from_base_id: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>North Base</option>
                  <option value={2}>South Base</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  To Base
                </label>
                <select
                  className="w-full border p-2 rounded bg-gray-50 text-xs"
                  value={transferData.to_base_id}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      to_base_id: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>North Base</option>
                  <option value={2}>South Base</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                className="w-full border p-2 rounded bg-gray-50"
                value={transferData.quantity}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    quantity: Number(e.target.value) || 1,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              Initiate Transfer
            </button>
          </div>
        </form>

        {/* History Section (Demo Ledger) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="bg-slate-800 text-white p-4 flex items-center gap-2">
            <History size={20} />
            <h2 className="font-semibold">Live Transfer Ledger</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-xs font-bold uppercase">Asset</th>
                <th className="p-4 text-xs font-bold uppercase">From</th>
                <th className="p-4 text-xs font-bold uppercase">To</th>
                <th className="p-4 text-xs font-bold uppercase text-right">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-slate-50">
                <td className="p-4 text-sm font-medium">M4 Carbine</td>
                <td className="p-4 text-sm text-red-600 italic">North Base</td>
                <td className="p-4 text-sm text-green-600 italic">
                  South Base
                </td>
                <td className="p-4 text-sm text-right font-bold">10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
