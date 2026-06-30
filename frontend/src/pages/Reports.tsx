import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";

type ReportTab = "stock" | "sales" | "purchase";

interface StockSummary {
  id: string;
  name: string;
  unit: string;
  opening_stock: number;
  current_stock: number;
  purchase_price: number;
  sale_price: number;
  stock_value: number;
}

interface VoucherReport {
  id: string;
  voucher_no: string;
  voucher_date: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  ledgers: { name: string };
  voucher_items: {
    qty: number;
    rate: number;
    gst_rate: number;
    cgst_amount: number;
    sgst_amount: number;
    line_total: number;
    stock_items: { name: string; unit: string };
  }[];
}

const inputCls =
  "border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white";

export default function Reports() {
  const { activeCompany } = useCompany();
  const [tab, setTab] = useState<ReportTab>("stock");
  const [stockData, setStockData] = useState<StockSummary[]>([]);
  const [salesData, setSalesData] = useState<VoucherReport[]>([]);
  const [purchaseData, setPurchaseData] = useState<VoucherReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [reportSearch, setReportSearch] = useState("");

  const fetchStock = async () => {
    if (!activeCompany) return;
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/api/reports/stock-summary/${activeCompany.id}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setStockData(data);
    setLoading(false);
  };

  const fetchSales = async () => {
    if (!activeCompany) return;
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/api/reports/sales-register/${activeCompany.id}?from=${fromDate}&to=${toDate}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setSalesData(data);
    setLoading(false);
  };

  const fetchPurchase = async () => {
    if (!activeCompany) return;
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/api/reports/purchase-register/${activeCompany.id}?from=${fromDate}&to=${toDate}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) setPurchaseData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "stock") fetchStock();
    if (tab === "sales") fetchSales();
    if (tab === "purchase") fetchPurchase();
  }, [tab, activeCompany]);

  const handleDateFilter = () => {
    if (tab === "sales") fetchSales();
    if (tab === "purchase") fetchPurchase();
  };

  const filteredStock = stockData.filter((i) =>
    i.name.toLowerCase().includes(reportSearch.toLowerCase()),
  );
  const filteredSales = salesData.filter(
    (v) =>
      v.voucher_no.toLowerCase().includes(reportSearch.toLowerCase()) ||
      v.ledgers?.name.toLowerCase().includes(reportSearch.toLowerCase()),
  );
  const filteredPurchase = purchaseData.filter(
    (v) =>
      v.voucher_no.toLowerCase().includes(reportSearch.toLowerCase()) ||
      v.ledgers?.name.toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const totalStockValue = filteredStock.reduce(
    (sum, i) => sum + i.stock_value,
    0,
  );
  const totalSales = filteredSales.reduce(
    (sum, v) => sum + parseFloat(String(v.total_amount)),
    0,
  );
  const totalPurchase = filteredPurchase.reduce(
    (sum, v) => sum + parseFloat(String(v.total_amount)),
    0,
  );

  const tabs = [
    { key: "stock", label: "Stock Summary" },
    { key: "sales", label: "Sales Register" },
    { key: "purchase", label: "Purchase Register" },
  ] as const;

  return (
    <div className="p-8 min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        </div>

        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setExpandedRow(null);
                setReportSearch("");
              }}
              className={`px-6 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "stock" && (
          <div className="flex items-center gap-3 mb-5 bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-sm text-slate-500">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputCls}
              max={today}
            />
            <span className="text-sm text-slate-500">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputCls}
              max={today}
            />
            <button
              onClick={handleDateFilter}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Apply
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder={`Search ${tab === "stock" ? "items" : "vouchers"}...`}
          value={reportSearch}
          onChange={(e) => setReportSearch(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mb-4 bg-white"
        />

        {loading && <p className="text-slate-400 text-sm mb-4">Loading...</p>}

        {tab === "stock" && (
          <>
            {filteredStock.length === 0 ? (
              <p className="text-slate-400 text-sm">
                {reportSearch
                  ? "No items match your search."
                  : "No stock items found."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {[
                          "Item Name",
                          "Unit",
                          "Opening Stock",
                          "Current Stock",
                          "Purchase Price",
                          "Sale Price",
                          "Stock Value",
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
                      {filteredStock.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {item.unit}
                          </td>
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
                            ₹
                            {parseFloat(String(item.purchase_price)).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            ₹{parseFloat(String(item.sale_price)).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ₹{item.stock_value.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-xl px-6 py-3">
                    <span className="text-sm">Total Stock Value: </span>
                    <span className="font-bold text-lg ml-2">
                      ₹{totalStockValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "sales" && (
          <>
            {filteredSales.length === 0 ? (
              <p className="text-slate-400 text-sm">
                {reportSearch
                  ? "No vouchers match your search."
                  : "No sales found for this period."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {[
                          "Voucher No.",
                          "Date",
                          "Customer",
                          "Subtotal",
                          "CGST",
                          "SGST",
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
                      {filteredSales.map((v) => (
                        <>
                          <tr
                            key={v.id}
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                            onClick={() =>
                              setExpandedRow(expandedRow === v.id ? null : v.id)
                            }
                          >
                            <td className="px-4 py-3 font-medium text-blue-600">
                              {v.voucher_no}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {new Date(v.voucher_date).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {v.ledgers?.name}
                            </td>
                            <td className="px-4 py-3">
                              ₹{parseFloat(String(v.subtotal)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              ₹
                              {(parseFloat(String(v.gst_amount)) / 2).toFixed(
                                2,
                              )}
                            </td>
                            <td className="px-4 py-3">
                              ₹
                              {(parseFloat(String(v.gst_amount)) / 2).toFixed(
                                2,
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              ₹{parseFloat(String(v.total_amount)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {expandedRow === v.id ? "▲" : "▼"}
                            </td>
                          </tr>

                          {expandedRow === v.id && (
                            <tr key={`${v.id}-expand`} className="bg-slate-50">
                              <td colSpan={8} className="px-6 py-3">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-400">
                                      {[
                                        "Item",
                                        "Unit",
                                        "Qty",
                                        "Rate",
                                        "GST%",
                                        "Amount",
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          className="text-left py-1 pr-4"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {v.voucher_items.map((vi, idx) => (
                                      <tr key={idx} className="text-slate-600">
                                        <td className="py-1 pr-4">
                                          {vi.stock_items?.name}
                                        </td>
                                        <td className="py-1 pr-4">
                                          {vi.stock_items?.unit}
                                        </td>
                                        <td className="py-1 pr-4">{vi.qty}</td>
                                        <td className="py-1 pr-4">
                                          ₹
                                          {parseFloat(String(vi.rate)).toFixed(
                                            2,
                                          )}
                                        </td>
                                        <td className="py-1 pr-4">
                                          {vi.gst_rate}%
                                        </td>
                                        <td className="py-1 pr-4">
                                          ₹
                                          {parseFloat(
                                            String(vi.line_total),
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-xl px-6 py-3">
                    <span className="text-sm">Total Sales: </span>
                    <span className="font-bold text-lg ml-2">
                      ₹{totalSales.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "purchase" && (
          <>
            {filteredPurchase.length === 0 ? (
              <p className="text-slate-400 text-sm">
                {reportSearch
                  ? "No vouchers match your search."
                  : "No purchases found for this period."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {[
                          "Voucher No.",
                          "Date",
                          "Supplier",
                          "Subtotal",
                          "CGST",
                          "SGST",
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
                      {filteredPurchase.map((v) => (
                        <>
                          <tr
                            key={v.id}
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                            onClick={() =>
                              setExpandedRow(expandedRow === v.id ? null : v.id)
                            }
                          >
                            <td className="px-4 py-3 font-medium text-blue-600">
                              {v.voucher_no}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {new Date(v.voucher_date).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {v.ledgers?.name}
                            </td>
                            <td className="px-4 py-3">
                              ₹{parseFloat(String(v.subtotal)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              ₹
                              {(parseFloat(String(v.gst_amount)) / 2).toFixed(
                                2,
                              )}
                            </td>
                            <td className="px-4 py-3">
                              ₹
                              {(parseFloat(String(v.gst_amount)) / 2).toFixed(
                                2,
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              ₹{parseFloat(String(v.total_amount)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {expandedRow === v.id ? "▲" : "▼"}
                            </td>
                          </tr>

                          {expandedRow === v.id && (
                            <tr key={`${v.id}-expand`} className="bg-slate-50">
                              <td colSpan={8} className="px-6 py-3">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-400">
                                      {[
                                        "Item",
                                        "Unit",
                                        "Qty",
                                        "Rate",
                                        "GST%",
                                        "Amount",
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          className="text-left py-1 pr-4"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {v.voucher_items.map((vi, idx) => (
                                      <tr key={idx} className="text-slate-600">
                                        <td className="py-1 pr-4">
                                          {vi.stock_items?.name}
                                        </td>
                                        <td className="py-1 pr-4">
                                          {vi.stock_items?.unit}
                                        </td>
                                        <td className="py-1 pr-4">{vi.qty}</td>
                                        <td className="py-1 pr-4">
                                          ₹
                                          {parseFloat(String(vi.rate)).toFixed(
                                            2,
                                          )}
                                        </td>
                                        <td className="py-1 pr-4">
                                          {vi.gst_rate}%
                                        </td>
                                        <td className="py-1 pr-4">
                                          ₹
                                          {parseFloat(
                                            String(vi.line_total),
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-xl px-6 py-3">
                    <span className="text-sm">Total Purchases: </span>
                    <span className="font-bold text-lg ml-2">
                      ₹{totalPurchase.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
