import React, { useEffect, useState } from "react";
import { Package, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import axios from "axios";

/* ======================================================
   Types
   ====================================================== */
type DashboardStats = {
  opening_balance: number;
  net_movement: number;
  expended: number;
  closing_balance: number;
};

/* ======================================================
   Component
   ====================================================== */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    opening_balance: 0,
    net_movement: 0,
    expended: 0,
    closing_balance: 0,
  });

  const [loading, setLoading] = useState(true);

  /* ======================================================
     Fetch Dashboard Stats (ADMIN ONLY)
     ====================================================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "https://military-asset-manager-1-5ku6.onrender.com/api/dashboard/stats",
          {
            headers: {
              "x-user-role": "ADMIN", // ✅ REQUIRED for RBAC
            },
          },
        );

        setStats(res.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
        alert("Unable to load dashboard stats. Check permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Command Overview
          </h2>
          <p className="text-slate-500 text-sm">
            Real-time asset tracking for all bases
          </p>
        </div>

        <div className="bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-200">
          <ShieldCheck size={18} className="text-blue-600" />
          <span className="text-xs font-mono font-bold text-slate-600 uppercase">
            Admin Access
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Opening Balance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-600">
          <div className="flex justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Opening Balance
            </p>
            <Package className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800">
            {stats.opening_balance.toLocaleString()} units
          </p>
        </div>

        {/* Net Movement */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-600">
          <div className="flex justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Net Movement
            </p>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p
            className={`text-3xl font-black ${
              stats.net_movement >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.net_movement >= 0 ? "+" : ""}
            {stats.net_movement.toLocaleString()} units
          </p>
        </div>

        {/* Expended */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-red-600">
          <div className="flex justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Expended
            </p>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800">
            {stats.expended.toLocaleString()} units
          </p>
        </div>

        {/* Closing Balance */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">
            Closing Balance
          </p>
          <p className="text-3xl font-black text-white">
            {stats.closing_balance.toLocaleString()} units
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
