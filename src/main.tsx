import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuth } from "./lib/auth";

// Initialize Keycloak before rendering the app
initAuth().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
