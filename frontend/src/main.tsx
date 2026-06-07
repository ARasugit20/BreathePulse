import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppWrapper } from "@/AppWrapper";
import "@/index.css";
import { initTheme } from "@/stores/themeStore";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
