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
  pincode: "",
  state: "",
  opening_balance: "",
  under: "customer",
};

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelCls = "text-xs text-slate-500 block mb-1";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function Ledgers() {
  const { activeCompany } = useCompany();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLedgers = async () => {
    if (!activeCompany) return;
    const res = await fetch(
      `http://localhost:5000/api/ledgers/${activeCompany.id}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setLedgers(data);
  };

  useEffect(() => {
    fetchLedgers();
  }, [activeCompany]);

  const openCreate = () => {
    setEditingLedger(null);
    setSelectedLedger(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (l: Ledger) => {
    setEditingLedger(l);
    setSelectedLedger(null);
    setForm({
      name: l.name,
      gstin: l.gstin || "",
      phone: l.phone || "",
      address: l.address || "",
      pincode: "",
      state: "",
      opening_balance: String(l.opening_balance),
      under: l.type,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.phone && form.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const fullAddress = [form.address, form.pincode, form.state]
        .filter(Boolean)
        .join(", ");

      const res = editingLedger
        ? await fetch(`http://localhost:5000/api/ledgers/${editingLedger.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              gstin: form.gstin,
              phone: form.phone,
              address: fullAddress,
            }),
          })
        : await fetch("http://localhost:5000/api/ledgers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_id: activeCompany?.id,
              type: form.under,
              name: form.name,
              gstin: form.gstin,
              phone: form.phone,
              address: fullAddress,
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
    if (res.ok) {
      fetchLedgers();
      setSelectedLedger(null);
    }
  };

  const underLabel = (type: string) =>
    type === "customer" ? "Sundry Debtors" : "Sundry Creditors";

  const filtered = ledgers.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone && l.phone.includes(search)),
  );

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Ledger</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Create Ledger
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mb-5 bg-white"
        />

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              {editingLedger ? "Edit Ledger" : "Create Ledger"}
            </h2>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editingLedger && (
                <div>
                  <label htmlFor="l_under" className={labelCls}>
                    Under *
                  </label>
                  <select
                    id="l_under"
                    value={form.under}
                    onChange={(e) =>
                      setForm({ ...form, under: e.target.value })
                    }
                    className={inputCls}
                    required
                  >
                    <option value="customer">Sundry Debtors</option>
                    <option value="supplier">Sundry Creditors</option>
                  </select>
                </div>
              )}

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
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm({ ...form, phone: val });
                  }}
                  className={inputCls}
                />
                {form.phone.length > 0 && form.phone.length < 10 && (
                  <p className="text-red-500 text-xs mt-1">
                    {10 - form.phone.length} more digits needed
                  </p>
                )}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="l_pincode" className={labelCls}>
                    Pincode
                  </label>
                  <input
                    id="l_pincode"
                    type="text"
                    placeholder="e.g. 380001"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setForm({ ...form, pincode: val });
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="l_state" className={labelCls}>
                    State
                  </label>
                  <select
                    id="l_state"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select State</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                    placeholder="e.g. 5000.00"
                    value={form.opening_balance}
                    onChange={(e) =>
                      setForm({ ...form, opening_balance: e.target.value })
                    }
                    className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm">
            {search
              ? "No ledgers match your search."
              : "No ledgers yet. Create one."}
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Name",
                    "Under",
                    "Phone",
                    "Opening Bal.",
                    "Current Bal.",
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
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLedger(l)}
                        className="font-medium text-blue-600 hover:underline text-left"
                      >
                        {l.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          l.type === "customer"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {underLabel(l.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {l.phone || "—"}
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
      </div>

      {/* Detail Panel — slides in from right on name click */}
      {selectedLedger && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedLedger(null)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 text-base">
                {selectedLedger.name}
              </h2>
              <button
                onClick={() => setSelectedLedger(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div>
                <p className="text-xs text-slate-400 mb-1">Under</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedLedger.type === "customer"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {underLabel(selectedLedger.type)}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Phone</p>
                <p className="text-sm text-slate-700">
                  {selectedLedger.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">GSTIN</p>
                <p className="text-sm text-slate-700">
                  {selectedLedger.gstin || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Address</p>
                <p className="text-sm text-slate-700">
                  {selectedLedger.address || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Opening Balance</p>
                  <p className="text-sm font-semibold text-slate-700">
                    ₹{selectedLedger.opening_balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                  <p className="text-sm font-semibold text-slate-700">
                    ₹{selectedLedger.current_balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  openEdit(selectedLedger);
                  setSelectedLedger(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedLedger.id)}
                className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
