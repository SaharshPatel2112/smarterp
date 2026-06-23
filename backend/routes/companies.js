const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// Get all companies for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create company
router.post("/", async (req, res) => {
  const {
    user_id,
    name,
    address,
    gstin,
    state,
    financial_year_start,
    contact_info,
  } = req.body;

  // Check max 5 limit
  const { count } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id);

  if (count >= 5) {
    return res
      .status(400)
      .json({ error: "Maximum 5 companies allowed per account." });
  }

  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        user_id,
        name,
        address,
        gstin,
        state,
        financial_year_start,
        contact_info,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update company
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, address, gstin, state, financial_year_start, contact_info } =
    req.body;

  const { data, error } = await supabase
    .from("companies")
    .update({ name, address, gstin, state, financial_year_start, contact_info })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete company
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Company deleted successfully" });
});

// Get internal user ID from auth_id
router.get("/user/:authId", async (req, res) => {
  const { authId } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
