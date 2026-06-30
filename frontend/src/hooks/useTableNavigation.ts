import { useEffect, useState } from "react";

export function useTableNavigation(
  rowCount: number,
  onEnter?: (index: number) => void,
) {
  const [activeRow, setActiveRow] = useState<number>(-1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "select", "textarea"].includes(tag)) return;
      if (rowCount === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveRow((prev) => (prev < rowCount - 1 ? prev + 1 : prev));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveRow((prev) => (prev > 0 ? prev - 1 : 0));
      }
      if (e.key === "Enter" && activeRow >= 0) {
        e.preventDefault();
        onEnter?.(activeRow);
      }
      if (e.key === "Escape") {
        setActiveRow(-1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rowCount, activeRow, onEnter]);

  return { activeRow, setActiveRow };
}
