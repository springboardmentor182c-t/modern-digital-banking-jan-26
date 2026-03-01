import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles/index.css";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);