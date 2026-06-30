import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { setActiveCompany } = useCompany();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "select", "textarea"].includes(tag)) return;

      const alt = e.altKey;
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      if (alt && !shift && key === "d") {
        e.preventDefault();
        setActiveCompany(null as any);
        navigate("/select-company");
      }
      if (alt && !shift && key === "l") {
        e.preventDefault();
        navigate("/ledgers");
      }
      if (alt && !shift && key === "i") {
        e.preventDefault();
        navigate("/stock-items");
      }
      if (alt && !shift && key === "p") {
        e.preventDefault();
        navigate("/purchase");
      }
      if (alt && !shift && key === "s") {
        e.preventDefault();
        navigate("/sales");
      }
      if (alt && !shift && key === "r") {
        e.preventDefault();
        navigate("/reports");
      }

      if (alt && shift && key === "l") {
        e.preventDefault();
        navigate("/ledgers?new=customer");
      }
      if (alt && shift && key === "i") {
        e.preventDefault();
        navigate("/stock-items?new=1");
      }
      if (alt && shift && key === "p") {
        e.preventDefault();
        navigate("/purchase?new=1");
      }
      if (alt && shift && key === "s") {
        e.preventDefault();
        navigate("/sales?new=1");
      }

      if (alt && !shift && key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"], input[placeholder*="search"]',
        );
        if (searchInput) searchInput.focus();
      }

      if (key === "?" && !alt && !ctrl) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-shortcut-help"));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, setActiveCompany]);
}
