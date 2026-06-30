import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";

interface Company {
  id: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  financial_year_start: string;
  contact_info: string;
}

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

const today = new Date().toISOString().split("T")[0];
const emptyForm = {
  name: "",
  address: "",
  gstin: "",
  state: "",
  financial_year_start: "",
  contact_info: "",
};

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelCls = "text-xs text-slate-500 block mb-1";

export default function CompanySelect() {
  const { session } = useAuth();
  const { companies, setActiveCompany, refreshCompanies, internalUserId } =
    useCompany();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingCompany(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (c: Company) => {
    setEditingCompany(c);
    setForm({
      name: c.name,
      address: c.address || "",
      gstin: c.gstin || "",
      state: c.state || "",
      financial_year_start: c.financial_year_start || "",
      contact_info: c.contact_info || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state) {
      setError("Please select a state.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = editingCompany
        ? await fetch(
            `http://localhost:5000/api/companies/${editingCompany.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            },
          )
        : await fetch("http://localhost:5000/api/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, user_id: internalUserId }),
          });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else {
        await refreshCompanies();
        setShowForm(false);
      }
    } catch {
      setError("Could not connect to server");
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this company? All its data will be lost.")) return;
    const res = await fetch(`http://localhost:5000/api/companies/${id}`, {
      method: "DELETE",
    });
    if (res.ok) refreshCompanies();
  };

  const handleSelect = (company: Company) => {
    setActiveCompany(company);
    navigate("/");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "select", "textarea"].includes(tag)) return;

      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (companies.length < 5) openCreate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [companies]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Select Company</h1>
          <span className="text-xs text-slate-400">
            {companies.length}/5 companies
          </span>
        </div>

        {companies.length === 0 && !showForm && (
          <p className="text-slate-400 text-sm mb-4">
            No companies yet. Create one to get started.
          </p>
        )}

        <div className="flex flex-col gap-3 mb-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                className="text-left flex-1"
                onClick={() => handleSelect(company)}
              >
                <p className="font-semibold text-blue-600">{company.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {company.state} · {company.gstin || "No GSTIN"}
                </p>
              </button>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEdit(company)}
                  className="text-xs border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md"
                >
                  Alter
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-xs border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {companies.length < 5 && !showForm && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            + Create Company
          </button>
        )}
        {companies.length >= 5 && (
          <p className="text-red-500 text-sm">Maximum 5 companies reached.</p>
        )}

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              {editingCompany ? "Alter Company" : "Create Company"}
            </h2>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="co_name" className={labelCls}>
                  Company Name *
                </label>
                <input
                  id="co_name"
                  type="text"
                  placeholder="e.g. G-mart Pvt Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label htmlFor="co_address" className={labelCls}>
                  Address
                </label>
                <input
                  id="co_address"
                  type="text"
                  placeholder="Street, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="co_gstin" className={labelCls}>
                  GSTIN
                </label>
                <input
                  id="co_gstin"
                  type="text"
                  placeholder="e.g. 24AABCU9603R1ZX"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="co_state" className={labelCls}>
                  State *
                </label>
                <select
                  id="co_state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className={inputCls}
                  required
                >
                  <option value="" disabled>
                    Select State
                  </option>
                  {INDIA_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="co_fy" className={labelCls}>
                  Financial Year Start
                </label>
                <input
                  id="co_fy"
                  type="date"
                  value={form.financial_year_start}
                  onChange={(e) =>
                    setForm({ ...form, financial_year_start: e.target.value })
                  }
                  className={inputCls}
                  max={today}
                />
              </div>
              <div>
                <label htmlFor="co_contact" className={labelCls}>
                  Contact Info
                </label>
                <input
                  id="co_contact"
                  type="text"
                  placeholder="Phone / Email"
                  value={form.contact_info}
                  onChange={(e) =>
                    setForm({ ...form, contact_info: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCompany ? "Update" : "Create"}
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
