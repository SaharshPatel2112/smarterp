import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCompany } from "./context/CompanyContext";
import Auth from "./pages/Auth";
import CompanySelect from "./pages/CompanySelect";
import Ledgers from "./pages/Ledgers";

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
          path="/ledgers"
          element={session && activeCompany ? <Ledgers /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : !activeCompany ? (
              <Navigate to="/select-company" />
            ) : (
              <Ledgers />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
