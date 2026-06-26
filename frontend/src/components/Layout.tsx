import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCompany } from "../context/CompanyContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeCompany, setActiveCompany } = useCompany();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveCompany(null as any);
    navigate("/auth");
  };

  const handleSwitchCompany = () => {
    setActiveCompany(null as any);
    navigate("/select-company");
  };

  const navItem = (to: string, icon: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm mx-2 my-0.5 transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      <span className="text-base shrink-0">{icon}</span>
      {open && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-800 flex flex-col z-50 transition-all duration-200 ${
          open ? "w-52" : "w-14"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700 min-h-[56px]">
          {open && (
            <span className="text-blue-400 font-bold text-base">SmartERP</span>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-white text-sm ml-auto"
          >
            {open ? "←" : "→"}
          </button>
        </div>

        {/* Company */}
        <button
          onClick={handleSwitchCompany}
          className="flex items-center gap-2 mx-2 my-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg overflow-hidden"
        >
          <span className="shrink-0">🏢</span>
          {open && (
            <span className="text-xs text-slate-200 font-semibold truncate">
              {activeCompany?.name}
            </span>
          )}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {open && (
            <p className="text-[10px] font-bold text-slate-500 px-4 pt-3 pb-1 tracking-widest">
              MASTERS
            </p>
          )}
          {navItem("/ledgers", "👥", "Ledger")}
          {navItem("/stock-items", "📦", "Stock Items")}

          {open && (
            <p className="text-[10px] font-bold text-slate-500 px-4 pt-4 pb-1 tracking-widest">
              VOUCHERS
            </p>
          )}
          {navItem("/purchase", "🛒", "Purchase Voucher")}
          {navItem("/sales", "🧾", "Sales Voucher")}

          {open && (
            <p className="text-[10px] font-bold text-slate-500 px-4 pt-4 pb-1 tracking-widest">
              REPORTS
            </p>
          )}
          {navItem("/reports", "📊", "Reports")}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-700 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-red-400 hover:bg-slate-700 text-sm"
          >
            <span className="shrink-0">🚪</span>
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`flex-1 transition-all duration-200 ${open ? "ml-52" : "ml-14"}`}
      >
        {children}
      </main>
    </div>
  );
}
