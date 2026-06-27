import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { generateInvoicePDF } from "../utils/generateInvoice";

interface Customer {
  id: string;
  name: string;
  current_balance: number;
}

interface StockItem {
  id: string;
  name: string;
  unit: string;
  gst_rate: number;
  sale_price: number;
  current_stock: number;
}

interface VoucherItem {
  stock_item_id: string;
  name: string;
  unit: string;
  gst_rate: number;
  rate: number;
  qty: number;
  amount: number;
}

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelCls = "text-xs text-slate-500 block mb-1";

export default function SalesVoucher() {
  const { activeCompany } = useCompany();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<VoucherItem[]>([]);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    if (!activeCompany) return;

    const [custRes, stockRes, vouchRes] = await Promise.all([
      fetch(
        `http://localhost:5000/api/ledgers/${activeCompany.id}?type=customer`,
      ),
      fetch(`http://localhost:5000/api/stock-items/${activeCompany.id}`),
      fetch(
        `http://localhost:5000/api/vouchers/${activeCompany.id}?type=sales`,
      ),
    ]);

    const [custData, stockData, vouchData] = await Promise.all([
      custRes.json(),
      stockRes.json(),
      vouchRes.json(),
    ]);

    if (Array.isArray(custData)) setCustomers(custData);
    if (Array.isArray(stockData)) setStockItems(stockData);
    if (Array.isArray(vouchData)) setVouchers(vouchData);
  };

  useEffect(() => {
    fetchData();
  }, [activeCompany]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (vouchers.length > 0) handleDownloadInvoice(vouchers[0]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [vouchers]);

  const selectedStock = stockItems.find((s) => s.id === selectedStockId);

  const handleAddItem = () => {
    if (!selectedStockId || !qty || !rate) {
      setError("Select item, enter quantity and rate.");
      return;
    }

    const qtyNum = parseFloat(qty);
    const stock = stockItems.find((s) => s.id === selectedStockId)!;

    // Check stock availability before adding to list
    if (qtyNum > stock.current_stock) {
      setError(
        `Insufficient stock for ${stock.name}. Available: ${stock.current_stock} ${stock.unit}`,
      );
      return;
    }

    const exists = items.find((i) => i.stock_item_id === selectedStockId);
    if (exists) {
      setError("Item already added. Remove it first to change quantity.");
      return;
    }

    setError("");
    const rateNum = parseFloat(rate);

    setItems([
      ...items,
      {
        stock_item_id: selectedStockId,
        name: stock.name,
        unit: stock.unit,
        gst_rate: stock.gst_rate,
        rate: rateNum,
        qty: qtyNum,
        amount: qtyNum * rateNum,
      },
    ]);

    setSelectedStockId("");
    setQty("");
    setRate("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const gstTotal = items.reduce(
    (sum, i) => sum + (i.amount * i.gst_rate) / 100,
    0,
  );
  const grandTotal = subtotal + gstTotal;

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Select a customer.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/vouchers/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: activeCompany?.id,
          ledger_id: selectedCustomer,
          voucher_date: voucherDate,
          items: items.map((i) => ({
            stock_item_id: i.stock_item_id,
            qty: i.qty,
            rate: i.rate,
            gst_rate: i.gst_rate,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(`Sales Voucher ${data.voucher_no} created successfully!`);
        setSelectedCustomer("");
        setItems([]);
        setShowForm(false);
        fetchData();
      }
    } catch {
      setError("Could not connect to server");
    }
    setLoading(false);
  };

  const openForm = () => {
    setShowForm(true);
    setError("");
    setSuccess("");
    setSelectedCustomer("");
    setItems([]);
    setSelectedStockId("");
    setQty("");
    setRate("");
    setVoucherDate(new Date().toISOString().split("T")[0]);
  };

  const handleDownloadInvoice = async (v: any) => {
    const customer = customers.find((c) => c.id === v.ledger_id) as any;

    await generateInvoicePDF({
      voucher_no: v.voucher_no,
      voucher_date: v.voucher_date,
      company_name: activeCompany?.name || "",
      company_gstin: activeCompany?.gstin || "",
      company_address: activeCompany?.address || "",
      customer_name: v.ledgers?.name || "",
      customer_gstin: customer?.gstin || "",
      customer_phone: customer?.phone || "",
      items: v.voucher_items.map((vi: any) => ({
        name: vi.stock_items?.name || "",
        unit: vi.stock_items?.unit || "",
        qty: parseFloat(vi.qty),
        rate: parseFloat(vi.rate),
        gst_rate: parseFloat(vi.gst_rate),
        amount: parseFloat(vi.line_total),
      })),
      subtotal: parseFloat(v.subtotal),
      gst_amount: parseFloat(v.gst_amount),
      total_amount: parseFloat(v.total_amount),
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Sales Voucher</h1>
          <button
            onClick={openForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Sale
          </button>
        </div>

        {success && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
            {success}
          </p>
        )}

        {/* Sales Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              New Sales Entry
            </h2>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="customer" className={labelCls}>
                  Customer (Sundry Debtors) *
                </label>
                <select
                  id="customer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="s_date" className={labelCls}>
                  Voucher Date *
                </label>
                <input
                  id="s_date"
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  className={inputCls}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Add Item Row */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">
                ADD STOCK ITEM
              </p>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label htmlFor="s_stock_item" className={labelCls}>
                    Item Name *
                  </label>
                  <select
                    id="s_stock_item"
                    value={selectedStockId}
                    onChange={(e) => {
                      setSelectedStockId(e.target.value);
                      const stock = stockItems.find(
                        (s) => s.id === e.target.value,
                      );
                      if (stock) setRate(String(stock.sale_price));
                    }}
                    className={inputCls}
                  >
                    <option value="">Select Item</option>
                    {stockItems.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={s.current_stock <= 0}
                      >
                        {s.name} ({s.unit}) — Stock: {s.current_stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="s_qty" className={labelCls}>
                    Qty{" "}
                    {selectedStock
                      ? `(max: ${selectedStock.current_stock})`
                      : ""}
                  </label>
                  <input
                    id="s_qty"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                </div>
                <div>
                  <label htmlFor="s_rate" className={labelCls}>
                    Rate (₹/unit)
                  </label>
                  <input
                    id="s_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                </div>
              </div>

              {/* Live amount preview */}
              {qty && rate && (
                <p className="text-xs text-slate-500 mt-2">
                  Amount: ₹{(parseFloat(qty) * parseFloat(rate)).toFixed(2)}
                  {selectedStock && selectedStock.gst_rate > 0 && (
                    <span className="ml-2 text-blue-600">
                      + GST {selectedStock.gst_rate}% = ₹
                      {(
                        (parseFloat(qty) *
                          parseFloat(rate) *
                          selectedStock.gst_rate) /
                        100
                      ).toFixed(2)}
                    </span>
                  )}
                </p>
              )}

              {/* Stock warning */}
              {selectedStock && selectedStock.current_stock <= 0 && (
                <p className="text-red-500 text-xs mt-2">
                  ⚠ This item is out of stock.
                </p>
              )}

              <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
              >
                + Add to Cart
              </button>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {[
                        "Item",
                        "Unit",
                        "Qty",
                        "Rate",
                        "GST%",
                        "Amount",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2 text-slate-500 font-semibold text-xs"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-2 font-medium text-slate-700">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-slate-500">
                          {item.unit}
                        </td>
                        <td className="px-4 py-2">{item.qty}</td>
                        <td className="px-4 py-2">₹{item.rate.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.gst_rate}%</td>
                        <td className="px-4 py-2 font-medium">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end mb-5">
                <div className="bg-slate-50 rounded-xl p-4 w-64">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">GST</span>
                    <span>₹{gstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Sales Voucher"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-slate-300 px-5 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Vouchers List */}
        {vouchers.length === 0 ? (
          <p className="text-slate-400 text-sm">No sales vouchers yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Voucher No.",
                    "Date",
                    "Customer",
                    "Items",
                    "Total",
                    "",
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
                {vouchers.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">
                      {v.voucher_no}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(v.voucher_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {v.ledgers?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {v.voucher_items?.length || 0} item(s)
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{parseFloat(v.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadInvoice(v)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                      >
                        PDF
                      </button>
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
