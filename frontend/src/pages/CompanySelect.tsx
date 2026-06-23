import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import "./CompanySelect.css";

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

export default function CompanySelect() {
  const { session } = useAuth();
  const { companies, setActiveCompany, refreshCompanies, internalUserId } =
    useCompany();

  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    gstin: "",
    state: "",
    financial_year_start: "",
    contact_info: "",
  });

  const openCreateForm = () => {
    setEditingCompany(null);
    setForm({
      name: "",
      address: "",
      gstin: "",
      state: "",
      financial_year_start: "",
      contact_info: "",
    });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      address: company.address || "",
      gstin: company.gstin || "",
      state: company.state || "",
      financial_year_start: company.financial_year_start || "",
      contact_info: company.contact_info || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.state) {
      setError("Please select a state.");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (editingCompany) {
        res = await fetch(
          `http://localhost:5000/api/companies/${editingCompany.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          },
        );
      } else {
        res = await fetch("http://localhost:5000/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, user_id: internalUserId }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
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

  return (
    <div className="cs-page">
      <div className="cs-container">
        <div className="cs-header">
          <h1 className="cs-title">Select Company</h1>
          <span className="cs-limit-note">{companies.length}/5 companies</span>
        </div>

        {companies.length === 0 && !showForm && (
          <p className="cs-empty">
            No companies yet. Create one to get started.
          </p>
        )}

        <div className="cs-list">
          {companies.map((company) => (
            <div key={company.id} className="cs-card">
              <button
                className="cs-card-info"
                onClick={() => setActiveCompany(company)}
              >
                <p className="cs-card-name">{company.name}</p>
                <p className="cs-card-meta">
                  {company.state} · {company.gstin || "No GSTIN"}
                </p>
              </button>
              <div className="cs-card-actions">
                <button
                  className="btn-alter"
                  onClick={() => openEditForm(company)}
                >
                  Alter
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(company.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {companies.length < 5 && !showForm && (
          <button className="btn-create" onClick={openCreateForm}>
            + Create Company
          </button>
        )}

        {companies.length >= 5 && (
          <p className="cs-max-note">Maximum 5 companies reached.</p>
        )}

        {showForm && (
          <div className="cs-form-box">
            <h2 className="cs-form-title">
              {editingCompany ? "Alter Company" : "Create Company"}
            </h2>

            {error && <p className="cs-error">{error}</p>}

            <form className="cs-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="company_name">Company Name *</label>
                <input
                  id="company_name"
                  type="text"
                  placeholder="e.g. G-mart Pvt Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Street, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="gstin">GSTIN</label>
                <input
                  id="gstin"
                  type="text"
                  placeholder="e.g. 24AABCU9603R1ZX"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
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
                <label htmlFor="financial_year_start">
                  Financial Year Start
                </label>
                <input
                  id="financial_year_start"
                  type="date"
                  value={form.financial_year_start}
                  onChange={(e) =>
                    setForm({ ...form, financial_year_start: e.target.value })
                  }
                  max={today}
                />
              </div>

              <div>
                <label htmlFor="contact_info">Contact Info</label>
                <input
                  id="contact_info"
                  type="text"
                  placeholder="Phone / Email"
                  value={form.contact_info}
                  onChange={(e) =>
                    setForm({ ...form, contact_info: e.target.value })
                  }
                />
              </div>

              <div className="cs-form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Saving..." : editingCompany ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
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
