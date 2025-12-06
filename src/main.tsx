import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  const errorMessage = `
╔══════════════════════════════════════════════════════════════╗
║  Convex Configuration Missing                                ║
╠══════════════════════════════════════════════════════════════╣
║  VITE_CONVEX_URL is not set in your environment.            ║
║                                                              ║
║  To fix this, run one of the following:                     ║
║                                                              ║
║  1. npm run convex    (recommended)                         ║
║  2. convex dev                                               ║
║                                                              ║
║  This will start Convex and automatically generate          ║
║  the .env.local file with the correct URL.                 ║
╚══════════════════════════════════════════════════════════════╝
  `;
  console.error(errorMessage);
  
  // Show user-friendly error in the UI
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; padding: 30px; background: #f8f9fa; border-radius: 12px; border: 2px solid #e9ecef;">
          <h1 style="color: #dc3545; margin-top: 0;">⚠️ Convex Configuration Required</h1>
          <p style="color: #495057; line-height: 1.6;">
            The app requires Convex to be configured. Please run the following command in your terminal:
          </p>
          <div style="background: #212529; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: 'Courier New', monospace;">
            npm run convex
          </div>
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
            This will start Convex and automatically generate the required configuration file.
          </p>
        </div>
      </div>
    `;
  }
} else {
  const convex = new ConvexReactClient(convexUrl);

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    );
  }
}
