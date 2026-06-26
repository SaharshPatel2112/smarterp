const supabase = require("../lib/supabaseClient");

async function generateVoucherNo(companyId, type) {
  const prefix = type === "sales" ? "SAL" : "PUR";

  const { count } = await supabase
    .from("vouchers")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("voucher_type", type);

  const next = (count || 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

module.exports = generateVoucherNo;
