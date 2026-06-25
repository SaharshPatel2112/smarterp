import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";

interface Ledger {
  id: string;
  type: "customer" | "supplier";
  name: string;
  gstin: string;
  phone: string;
  address: string;
  opening_balance: number;
  current_balance: number;
}

const emptyForm = {
  name: "",
  gstin: "",
  phone: "",
  address: "",
  opening_balance: "0",
};
const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelCls = "text-xs text-slate-500 block mb-1";

export default function Ledgers() {
  const { activeCompany } = useCompany();
  const [tab, setTab] = useState<"customer" | "supplier">("customer");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLedgers = async () => {
    if (!activeCompany) return;
    const res = await fetch(
      `http://localhost:5000/api/ledgers/${activeCompany.id}?type=${tab}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setLedgers(data);
  };

  useEffect(() => {
    fetchLedgers();
  }, [tab, activeCompany]);

  const openCreate = () => {
    setEditingLedger(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (l: Ledger) => {
    setEditingLedger(l);
    setForm({
      name: l.name,
      gstin: l.gstin || "",
      phone: l.phone || "",
      address: l.address || "",
      opening_balance: String(l.opening_balance),
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = editingLedger
        ? await fetch(`http://localhost:5000/api/ledgers/${editingLedger.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              gstin: form.gstin,
              phone: form.phone,
              address: form.address,
            }),
          })
        : await fetch("http://localhost:5000/api/ledgers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_id: activeCompany?.id,
              type: tab,
              name: form.name,
              gstin: form.gstin,
              phone: form.phone,
              address: form.address,
              opening_balance: parseFloat(form.opening_balance) || 0,
            }),
          });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else {
        await fetchLedgers();
        setShowForm(false);
      }
    } catch {
      setError("Could not connect to server");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ledger?")) return;
    const res = await fetch(`http://localhost:5000/api/ledgers/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchLedgers();
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Ledger Master</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New {tab === "customer" ? "Customer" : "Supplier"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {(["customer", "supplier"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setShowForm(false);
              }}
              className={`px-6 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "customer" ? "Customers" : "Suppliers"}
            </button>
          ))}
        </div>

        {/* Table */}
        {ledgers.length === 0 ? (
          <p className="text-slate-400 text-sm">No {tab}s found. Create one.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Name",
                    "Phone",
                    "GSTIN",
                    "Opening Balance",
                    "Current Balance",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-slate-500 font-semibold text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledgers.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {l.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {l.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {l.gstin || "—"}
                    </td>
                    <td className="px-4 py-3">
                      ₹{l.opening_balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      ₹{l.current_balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(l)}
                          className="text-xs border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="text-xs border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-5 capitalize">
              {editingLedger ? `Edit ${tab}` : `Create ${tab}`}
            </h2>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="l_name" className={labelCls}>
                  Name *
                </label>
                <input
                  id="l_name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label htmlFor="l_phone" className={labelCls}>
                  Phone
                </label>
                <input
                  id="l_phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="l_gstin" className={labelCls}>
                  GSTIN
                </label>
                <input
                  id="l_gstin"
                  type="text"
                  placeholder="e.g. 24AABCU9603R1ZX"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="l_address" className={labelCls}>
                  Address
                </label>
                <input
                  id="l_address"
                  type="text"
                  placeholder="Street, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              {!editingLedger && (
                <div>
                  <label htmlFor="l_ob" className={labelCls}>
                    Opening Balance (₹)
                  </label>
                  <input
                    id="l_ob"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) =>
                      setForm({ ...form, opening_balance: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingLedger ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-slate-300 px-5 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
