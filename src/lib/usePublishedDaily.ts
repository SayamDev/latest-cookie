import { useEffect } from "react";
import { validateDaily, type Daily } from "./daily";

// Check the published snapshot on arrival, return to the tab and every five minutes.
// Publishing fetches sources; browsers only fetch our validated static snapshot.
export function usePublishedDaily(onUpdate: (data: Daily) => void) {
  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();
    async function check() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const response = await fetch(import.meta.env.BASE_URL + "daily.json", {
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) return;
        const next = validateDaily(await response.json());
        if (active) onUpdate(next);
      } catch { /* Keep the last valid snapshot available. */ }
      finally { pending = false; }
    }
    void check();
    const interval = window.setInterval(check, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", check);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [onUpdate]);
}
