import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCompany } from "../context/CompanyContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);
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

  useEffect(() => {
    const handler = () => setShowHelp((h) => !h);
    window.addEventListener("toggle-shortcut-help", handler);
    return () => window.removeEventListener("toggle-shortcut-help", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        handleLogout();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-800 flex flex-col z-50 transition-all duration-200 ${
          open ? "w-52" : "w-14"
        }`}
      >
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

      {/* Main + Right Panel */}
      <div
        className={`flex flex-1 transition-all duration-200 ${open ? "ml-52" : "ml-14"}`}
      >
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Right shortcut panel — white/gray theme */}
        <aside className="w-44 shrink-0 bg-white border-l border-slate-200 flex flex-col py-2 h-screen sticky top-0 overflow-y-auto">
          <p className="text-[14px] font-bold text-slate-400 px-3 pt-2 pb-1 tracking-widest">
            SHORTCUTS
          </p>
          {[
            ["─────"],
            ["Alt+D", "Dashboard"],
            ["Alt+L", "Ledger"],
            ["Alt+I", "Stock Items"],
            ["Alt+P", "Purchase"],
            ["Alt+S", "Sales"],
            ["Alt+R", "Reports"],
            ["Alt+C", "Add to Cart (Purchase/Sales)"],
            ["─────", ""],
            ["Alt+⇧+L", "Create Ledger"],
            ["Alt+⇧+I", "Create Item"],
            ["Alt+⇧+P", "New Purchase"],
            ["Alt+⇧+S", "New Sale"],
            ["─────", ""],
            ["Alt+F", "Search"],
            ["Ctrl+⇧+S", "Save Form"],
            ["Ctrl+⇧+X", "Cancel Form"],
            ["Ctrl+⇧+Q", "Logout"],
            ["Ctrl+⇧+P", "Invoice PDF"],
            ["?", "Help"],
          ].map(([key, desc]) =>
            key === "─────" ? (
              <div
                key={key + desc}
                className="border-t border-slate-200 my-1 mx-3"
              />
            ) : (
              <div
                key={key}
                className="flex flex-col px-3 py-1 hover:bg-slate-50 rounded mx-1"
              >
                <span className="text-[13px] font-mono text-blue-600">
                  {key}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {desc}
                </span>
              </div>
            ),
          )}
        </aside>
      </div>

      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowHelp(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-6 w-[480px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm max-h-[32rem] overflow-y-auto pr-1">
              {[
                ["Alt + D", "Dashboard"],
                ["Alt + L", "Go to Ledger"],
                ["Alt + I", "Go to Stock Items"],
                ["Alt + P", "Go to Purchase Voucher"],
                ["Alt + S", "Go to Sales Voucher"],
                ["Alt + R", "Go to Reports"],
                ["Alt + C", "Add to Cart (on Purchase/Sales pages only)"],
                ["Alt + Shift + L", "Go to Ledger + Create form"],
                ["Alt + Shift + I", "Go to Stock Items + Create form"],
                ["Alt + Shift + P", "Go to Purchase + New form"],
                ["Alt + Shift + S", "Go to Sales + New form"],
                ["Alt + F", "Focus search bar"],
                ["Ctrl + Shift + S", "Save form (Ledger/Stock/Purchase/Sales)"],
                ["Ctrl + Shift + X", "Cancel/close form"],
                ["Ctrl + Shift + Q", "Logout"],
                ["Ctrl + Enter", "Save current form"],
                ["Esc", "Close modal / cancel form"],
                ["Ctrl + Shift + P", "Download top search result invoice PDF"],
                ["↑ / ↓", "Navigate table rows"],
                ["Enter", "Open selected row"],
                ["?", "Toggle this help panel"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-500">{desc}</span>
                  <kbd className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              Press <kbd className="bg-slate-100 px-1 rounded">?</kbd> or click
              outside to close
            </p>
          </div>
        </>
      )}
    </div>
  );
}
