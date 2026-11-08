import { UI_STORE_KEY } from "@/stores/ui-store";

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * It mirrors the logic in ThemeSync, which takes over after hydration.
 */
const script = `(function(){try{var t="system";var raw=localStorage.getItem(${JSON.stringify(
  UI_STORE_KEY,
)});if(raw){var s=JSON.parse(raw);if(s&&s.state&&s.state.theme){t=s.state.theme}}var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
