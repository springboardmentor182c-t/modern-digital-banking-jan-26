import Dashboard from "./pages/Dashboard";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
