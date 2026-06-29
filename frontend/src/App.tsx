import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCompany } from "./context/CompanyContext";
import Auth from "./pages/Auth";
import CompanySelect from "./pages/CompanySelect";
import Ledgers from "./pages/Ledgers";
import StockItems from "./pages/StockItems";
import Layout from "./components/Layout";
import PurchaseVoucher from "./pages/PurchaseVoucher";
import SalesVoucher from "./pages/SalesVoucher";
import Reports from "./pages/Reports";

function App() {
  const { session, loading } = useAuth();
  const { activeCompany } = useCompany();

  if (loading) return <div className="p-8">Loading...</div>;

  // Not logged in
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Logged in but no company selected
  if (!activeCompany) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<CompanySelect />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Logged in + company selected — show full app with sidebar
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/ledgers" />} />
          <Route path="/ledgers" element={<Ledgers />} />
          <Route path="/stock-items" element={<StockItems />} />
          <Route path="/purchase" element={<PurchaseVoucher />} />
          <Route path="/sales" element={<SalesVoucher />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/ledgers" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
