const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// Get all stock items for a company
router.get("/:companyId", async (req, res) => {
  const { companyId } = req.params;

  const { data, error } = await supabase
    .from("stock_items")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create stock item
router.post("/", async (req, res) => {
  const {
    company_id,
    name,
    unit,
    gst_rate,
    purchase_price,
    sale_price,
    opening_stock,
  } = req.body;

  if (!company_id || !name) {
    return res.status(400).json({ error: "company_id and name are required." });
  }

  // Check duplicate name within same company
  const { data: existing } = await supabase
    .from("stock_items")
    .select("id")
    .eq("company_id", company_id)
    .ilike("name", name.trim())
    .eq("unit", unit || "pcs")
    .single();

  if (existing) {
    return res.status(400).json({
      error: `Item "${name}" with unit "${unit || "pcs"}" already exists. Same name is allowed only with a different unit.`,
    });
  }

  const { data, error } = await supabase
    .from("stock_items")
    .insert([
      {
        company_id,
        name: name.trim(),
        unit: unit || "pcs",
        gst_rate: gst_rate || 0,
        purchase_price: purchase_price || 0,
        sale_price: sale_price || 0,
        opening_stock: opening_stock || 0,
        current_stock: opening_stock || 0,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update stock item
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, unit, gst_rate, purchase_price, sale_price } = req.body;

  const { data, error } = await supabase
    .from("stock_items")
    .update({ name, unit, gst_rate, purchase_price, sale_price })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete stock item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { count, error: countError } = await supabase
    .from("voucher_items")
    .select("*", { count: "exact", head: true })
    .eq("stock_item_id", id);

  if (countError) return res.status(400).json({ error: countError.message });

  if (count > 0) {
    return res.status(400).json({
      error: `Cannot delete — this item has been used in ${count} voucher(s).`,
    });
  }

  const { error } = await supabase.from("stock_items").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Stock item deleted successfully" });
});

module.exports = router;
