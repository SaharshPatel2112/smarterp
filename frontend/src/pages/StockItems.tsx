import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";

interface StockItem {
  id: string;
  name: string;
  unit: string;
  gst_rate: number;
  purchase_price: number;
  sale_price: number;
  opening_stock: number;
  current_stock: number;
}

const UNITS = ["pcs", "kg", "g", "litre", "ml", "box", "dozen", "meter"];
const emptyForm = {
  name: "",
  unit: "pcs",
  gst_rate: "0",
  purchase_price: "",
  sale_price: "",
  opening_stock: "",
};
const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelCls = "text-xs text-slate-500 block mb-1";

export default function StockItems() {
  const { activeCompany } = useCompany();
  const [items, setItems] = useState<StockItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    if (!activeCompany) return;
    const res = await fetch(
      `http://localhost:5000/api/stock-items/${activeCompany.id}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [activeCompany]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      unit: item.unit,
      gst_rate: String(item.gst_rate),
      purchase_price: String(item.purchase_price),
      sale_price: String(item.sale_price),
      opening_stock: String(item.opening_stock),
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = editingItem
        ? await fetch(
            `http://localhost:5000/api/stock-items/${editingItem.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: form.name,
                unit: form.unit,
                gst_rate: parseFloat(form.gst_rate) || 0,
                purchase_price: parseFloat(form.purchase_price),
                sale_price: parseFloat(form.sale_price),
              }),
            },
          )
        : await fetch("http://localhost:5000/api/stock-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_id: activeCompany?.id,
              name: form.name,
              unit: form.unit,
              gst_rate: parseFloat(form.gst_rate) || 0,
              purchase_price: parseFloat(form.purchase_price),
              sale_price: parseFloat(form.sale_price),
              opening_stock: parseFloat(form.opening_stock),
            }),
          });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else {
        await fetchItems();
        setShowForm(false);
      }
    } catch {
      setError("Could not connect to server");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stock item?")) return;
    const res = await fetch(`http://localhost:5000/api/stock-items/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchItems();
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Stock Items</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Item
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mb-5 bg-white"
        />

        {/* Form — appears HERE between search and table */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              {editingItem ? "Edit Stock Item" : "Create Stock Item"}
            </h2>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="s_name" className={labelCls}>
                  Item Name *
                </label>
                <input
                  id="s_name"
                  type="text"
                  placeholder="e.g. Rice, Sugar, Pen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label htmlFor="s_unit" className={labelCls}>
                  Unit *
                </label>
                <select
                  id="s_unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={inputCls}
                  required
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="s_gst" className={labelCls}>
                  GST Rate (%) — optional
                </label>
                <select
                  id="s_gst"
                  value={form.gst_rate}
                  onChange={(e) =>
                    setForm({ ...form, gst_rate: e.target.value })
                  }
                  className={inputCls}
                >
                  {["0", "5", "12", "18", "28"].map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="s_pp" className={labelCls}>
                  Purchase Price (₹) *
                </label>
                <input
                  id="s_pp"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 120.00"
                  value={form.purchase_price}
                  onChange={(e) =>
                    setForm({ ...form, purchase_price: e.target.value })
                  }
                  className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  required
                />
              </div>

              <div>
                <label htmlFor="s_sp" className={labelCls}>
                  Sale Price (₹) *
                </label>
                <input
                  id="s_sp"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  value={form.sale_price}
                  onChange={(e) =>
                    setForm({ ...form, sale_price: e.target.value })
                  }
                  className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  required
                />
              </div>

              {!editingItem && (
                <div>
                  <label htmlFor="s_os" className={labelCls}>
                    Opening Stock *
                  </label>
                  <input
                    id="s_os"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 100"
                    value={form.opening_stock}
                    onChange={(e) =>
                      setForm({ ...form, opening_stock: e.target.value })
                    }
                    className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingItem ? "Update" : "Create"}
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
              ? "No items match your search."
              : "No stock items yet. Create one."}
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Name",
                    "Unit",
                    "GST %",
                    "Purchase Price",
                    "Sale Price",
                    "Opening Stock",
                    "Current Stock",
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
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                    <td className="px-4 py-3">{item.gst_rate}%</td>
                    <td className="px-4 py-3">
                      ₹{item.purchase_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">₹{item.sale_price.toFixed(2)}</td>
                    <td className="px-4 py-3">{item.opening_stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.current_stock <= 0
                            ? "text-red-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {item.current_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
