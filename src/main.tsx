import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecurity } from "./utils/security";

// Initialize security measures
initializeSecurity();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element. Make sure there is a div with id 'root' in your HTML.");
}

createRoot(rootElement).render(<App />);
