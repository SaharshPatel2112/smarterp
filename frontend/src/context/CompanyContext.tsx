import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface Company {
  id: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  financial_year_start: string;
  contact_info: string;
}

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  internalUserId: string | null;
  setActiveCompany: (company: Company) => void;
  refreshCompanies: () => void;
}

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  activeCompany: null,
  internalUserId: null,
  setActiveCompany: () => {},
  refreshCompanies: () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    if (!session) return;

    const userRes = await fetch(
      `http://localhost:5000/api/companies/user/${session.user.id}`,
    );
    const userData = await userRes.json();
    if (!userData.id) return;

    setInternalUserId(userData.id);

    const res = await fetch(
      `http://localhost:5000/api/companies/${userData.id}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      setCompanies(data);
      if (data.length === 1) setActiveCompany(data[0]);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [session]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        internalUserId,
        setActiveCompany,
        refreshCompanies: fetchCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
