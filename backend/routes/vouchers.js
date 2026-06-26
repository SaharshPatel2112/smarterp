const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");
const generateVoucherNo = require("../utils/voucherNumber");

// Get all vouchers for a company (filter by type)
router.get("/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { type } = req.query;

  let query = supabase
    .from("vouchers")
    .select(
      `
      *,
      ledgers(name, type),
      voucher_items(
        *,
        stock_items(name, unit)
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("voucher_type", type);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create Purchase Voucher (atomic via DB function)
router.post("/purchase", async (req, res) => {
  const { company_id, ledger_id, voucher_date, items } = req.body;

  if (!company_id || !ledger_id || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "company_id, ledger_id and items are required." });
  }

  try {
    const voucher_no = await generateVoucherNo(company_id, "purchase");

    const { data, error } = await supabase.rpc("create_purchase_voucher", {
      p_company_id: company_id,
      p_ledger_id: ledger_id,
      p_voucher_no: voucher_no,
      p_voucher_date: voucher_date,
      p_items: items,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ voucher_id: data, voucher_no });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Sales Voucher (atomic via DB function)
router.post("/sales", async (req, res) => {
  const { company_id, ledger_id, voucher_date, items } = req.body;

  if (!company_id || !ledger_id || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "company_id, ledger_id and items are required." });
  }

  try {
    const voucher_no = await generateVoucherNo(company_id, "sales");

    const { data, error } = await supabase.rpc("create_sales_voucher", {
      p_company_id: company_id,
      p_ledger_id: ledger_id,
      p_voucher_no: voucher_no,
      p_voucher_date: voucher_date,
      p_items: items,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ voucher_id: data, voucher_no });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
