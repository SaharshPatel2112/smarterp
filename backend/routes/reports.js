const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// Stock Summary
router.get("/stock-summary/:companyId", async (req, res) => {
  const { companyId } = req.params;

  const { data, error } = await supabase
    .from("stock_items")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });

  const summary = data.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    opening_stock: item.opening_stock,
    current_stock: item.current_stock,
    purchase_price: item.purchase_price,
    sale_price: item.sale_price,
    stock_value: item.current_stock * item.purchase_price,
  }));

  res.json(summary);
});

// Sales Register
router.get("/sales-register/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { from, to } = req.query;

  let query = supabase
    .from("vouchers")
    .select(
      `
      *,
      ledgers(name),
      voucher_items(
        qty, rate, gst_rate, cgst_amount, sgst_amount, line_total,
        stock_items(name, unit)
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("voucher_type", "sales")
    .order("voucher_date", { ascending: false });

  if (from) query = query.gte("voucher_date", from);
  if (to) query = query.lte("voucher_date", to);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Purchase Register
router.get("/purchase-register/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { from, to } = req.query;

  let query = supabase
    .from("vouchers")
    .select(
      `
      *,
      ledgers(name),
      voucher_items(
        qty, rate, gst_rate, cgst_amount, sgst_amount, line_total,
        stock_items(name, unit)
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("voucher_type", "purchase")
    .order("voucher_date", { ascending: false });

  if (from) query = query.gte("voucher_date", from);
  if (to) query = query.lte("voucher_date", to);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
