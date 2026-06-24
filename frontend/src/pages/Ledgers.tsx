import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import "./Ledgers.css";

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

  const openCreateForm = () => {
    setEditingLedger(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (ledger: Ledger) => {
    setEditingLedger(ledger);
    setForm({
      name: ledger.name,
      gstin: ledger.gstin || "",
      phone: ledger.phone || "",
      address: ledger.address || "",
      opening_balance: String(ledger.opening_balance),
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (editingLedger) {
        res = await fetch(
          `http://localhost:5000/api/ledgers/${editingLedger.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              gstin: form.gstin,
              phone: form.phone,
              address: form.address,
            }),
          },
        );
      } else {
        res = await fetch("http://localhost:5000/api/ledgers", {
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
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
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
    <div className="ledger-page">
      <div className="ledger-container">
        <div className="ledger-header">
          <h1 className="ledger-title">Ledger Master</h1>
          <button className="btn-create" onClick={openCreateForm}>
            + New {tab === "customer" ? "Customer" : "Supplier"}
          </button>
        </div>

        {/* Tabs */}
        <div className="ledger-tabs">
          <button
            className={`ledger-tab ${tab === "customer" ? "active" : ""}`}
            onClick={() => {
              setTab("customer");
              setShowForm(false);
            }}
          >
            Customers
          </button>
          <button
            className={`ledger-tab ${tab === "supplier" ? "active" : ""}`}
            onClick={() => {
              setTab("supplier");
              setShowForm(false);
            }}
          >
            Suppliers
          </button>
        </div>

        {/* Table */}
        {ledgers.length === 0 ? (
          <p className="ledger-empty">No {tab}s found. Create one.</p>
        ) : (
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>GSTIN</th>
                  <th>Opening Balance</th>
                  <th>Current Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((ledger) => (
                  <tr key={ledger.id}>
                    <td>{ledger.name}</td>
                    <td>{ledger.phone || "—"}</td>
                    <td>{ledger.gstin || "—"}</td>
                    <td>₹{ledger.opening_balance.toFixed(2)}</td>
                    <td>₹{ledger.current_balance.toFixed(2)}</td>
                    <td>
                      <div className="ledger-actions">
                        <button
                          className="btn-alter"
                          onClick={() => openEditForm(ledger)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(ledger.id)}
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
          <div className="ledger-form-box">
            <h2 className="ledger-form-title">
              {editingLedger ? `Edit ${tab}` : `Create ${tab}`}
            </h2>

            {error && <p className="ledger-error">{error}</p>}

            <form className="ledger-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="ledger_name">Name *</label>
                <input
                  id="ledger_name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="ledger_phone">Phone</label>
                <input
                  id="ledger_phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="ledger_gstin">GSTIN</label>
                <input
                  id="ledger_gstin"
                  type="text"
                  placeholder="e.g. 24AABCU9603R1ZX"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="ledger_address">Address</label>
                <input
                  id="ledger_address"
                  type="text"
                  placeholder="Street, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              {!editingLedger && (
                <div>
                  <label htmlFor="opening_balance">Opening Balance (₹)</label>
                  <input
                    id="opening_balance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) =>
                      setForm({ ...form, opening_balance: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="ledger-form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Saving..." : editingLedger ? "Update" : "Create"}
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
