import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCompany } from "./context/CompanyContext";
import Auth from "./pages/Auth";
import CompanySelect from "./pages/CompanySelect";

function Dashboard() {
  const { activeCompany } = useCompany();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Active Company: {activeCompany?.name}
      </p>
    </div>
  );
}

function App() {
  const { session, loading } = useAuth();
  const { activeCompany } = useCompany();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/" /> : <Auth />}
        />
        <Route
          path="/select-company"
          element={session ? <CompanySelect /> : <Navigate to="/auth" />}
        />
        <Route
          path="/"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : !activeCompany ? (
              <Navigate to="/select-company" />
            ) : (
              <Dashboard />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
