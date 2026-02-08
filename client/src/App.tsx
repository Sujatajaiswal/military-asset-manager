import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  ClipboardList,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import Assignments from "./pages/Assignments";
import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const { role, setRole } = useAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
        {/* Navigation Bar */}
        <nav className="bg-slate-900 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-12">
                <h1 className="text-2xl font-black tracking-tighter text-blue-500">
                  MILITARY ASSET MS
                </h1>

                <div className="flex gap-2">
                  <Link
                    to="/"
                    className="flex items-center gap-2 hover:bg-slate-800 px-4 py-2 rounded-lg"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  {/* Logistics + Admin only */}
                  {role !== "COMMANDER" && (
                    <Link
                      to="/purchases"
                      className="flex items-center gap-2 hover:bg-slate-800 px-4 py-2 rounded-lg"
                    >
                      <ShoppingCart size={18} />
                      Purchases
                    </Link>
                  )}

                  {role !== "COMMANDER" && (
                    <Link
                      to="/transfers"
                      className="flex items-center gap-2 hover:bg-slate-800 px-4 py-2 rounded-lg"
                    >
                      <ArrowLeftRight size={18} />
                      Transfers
                    </Link>
                  )}

                  {/* Admin + Commander */}
                  {role !== "LOGISTICS" && (
                    <Link
                      to="/assignments"
                      className="flex items-center gap-2 hover:bg-slate-800 px-4 py-2 rounded-lg"
                    >
                      <ClipboardList size={18} />
                      Assignments
                    </Link>
                  )}
                </div>
              </div>

              {/* Role Selector */}
              <div className="flex items-center gap-4">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="bg-slate-800 text-xs px-3 py-2 rounded border border-slate-700"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="COMMANDER">Base Commander</option>
                  <option value="LOGISTICS">Logistics Officer</option>
                </select>

                <div className="text-xs font-mono text-gray-400 uppercase">
                  Auth: <span className="text-white">{role}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {role !== "COMMANDER" && (
              <Route path="/purchases" element={<Purchases />} />
            )}

            {role !== "COMMANDER" && (
              <Route path="/transfers" element={<Transfers />} />
            )}

            {role !== "LOGISTICS" && (
              <Route path="/assignments" element={<Assignments />} />
            )}

            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <h2 className="text-4xl font-bold mb-2 text-slate-800">
                    403
                  </h2>
                  <p>Unauthorized or Page Not Found</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
