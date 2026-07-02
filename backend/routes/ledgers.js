const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// Get all ledgers for a company (optionally filter by type)
router.get("/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { type } = req.query;

  let query = supabase
    .from("ledgers")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create ledger
router.post("/", async (req, res) => {
  const { company_id, type, name, gstin, phone, address, opening_balance } =
    req.body;

  if (!company_id || !type || !name) {
    return res
      .status(400)
      .json({ error: "company_id, type and name are required." });
  }

  const { data, error } = await supabase
    .from("ledgers")
    .insert([
      {
        company_id,
        type,
        name,
        gstin: gstin || null,
        phone: phone || null,
        address: address || null,
        opening_balance: opening_balance || 0,
        current_balance: opening_balance || 0,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update ledger
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, gstin, phone, address } = req.body;

  const { data, error } = await supabase
    .from("ledgers")
    .update({ name, gstin, phone, address })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete ledger
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { count, error: countError } = await supabase
    .from("vouchers")
    .select("*", { count: "exact", head: true })
    .eq("ledger_id", id);

  if (countError) return res.status(400).json({ error: countError.message });

  if (count > 0) {
    return res.status(400).json({
      error: `Cannot delete — this ledger has ${count} voucher(s) linked to it.`,
    });
  }

  const { error } = await supabase.from("ledgers").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Ledger deleted successfully" });
});

module.exports = router;
