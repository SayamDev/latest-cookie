import { useState } from "react";
import { readSaved } from "./content";
export function useBookmarks() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return readSaved(localStorage.getItem("latest-cookie:saved"));
    } catch {
      return [];
    }
  });
  const [message, setMessage] = useState("");
  function toggle(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("latest-cookie:saved", JSON.stringify(next));
      setMessage(
        next.includes(id)
          ? "Story saved in this browser."
          : "Story removed from saved.",
      );
    } catch {
      setMessage(
        "Browser storage is unavailable. Saved stories will last only for this visit.",
      );
    }
  }
  function clear() {
    setSaved([]);
    try {
      localStorage.removeItem("latest-cookie:saved");
      setMessage("Saved stories cleared.");
    } catch {
      setMessage("Saved stories cleared for this visit.");
    }
  }
  return { saved, toggle, clear, message };
}
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("latest-cookie:theme", next);
    } catch {
      /* Theme still works for this visit. */
    }
  }
  return { theme, toggleTheme };
}
