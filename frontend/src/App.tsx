import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";

function Dashboard() {
  return <h1 className="p-8 text-2xl">Dashboard (Day 3+ work goes here)</h1>;
}

function App() {
  const { session, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/" /> : <Auth />}
        />
        <Route
          path="/"
          element={session ? <Dashboard /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
