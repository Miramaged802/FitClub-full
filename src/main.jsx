import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Import PWA registration
import { registerSW } from "virtual:pwa-register";

// Register service worker for PWA (both dev and prod)
registerSW({
  onNeedRefresh() {
    console.log("New content available. Please refresh.");
  },
  onOfflineReady() {
    console.log("App is ready to work offline!");
  },
  // Disable Workbox console logs
  immediate: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
