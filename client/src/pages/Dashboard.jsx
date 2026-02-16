import "./Dashboard.css";
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";
import axios from "axios";

import UserGrowthChart from "../components/Dashboard/UserGrowthChart";
import RevenueChart from "../components/Dashboard/RevenueChart";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
 
  useEffect(() => {
    fetchDashboard();
    fetchChartData();
    fetchSystemInfo();

  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboardData();
      setData(response);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/chart-data`);
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchSystemInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/system-info`);
    setSystemInfo(response.data);
  } catch (error) {
    console.error("Error fetching system info:", error);
  }
};


  if (!data || !systemInfo) return <p>Loading...</p>;


  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* CARDS */}
      <div className="cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{data.total_users}</p>
        </div>

        <div className="card">
          <h3>Total Transactions</h3>
          <p>{data.total_transactions}</p>
        </div>

        <div className="card">
          <h3>Total Revenue</h3>
          <p>${data.total_revenue}</p>
        </div>

        <div className="card">
          <h3>Active Rate</h3>
          <p>{data.active_rate}%</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts">
        <div className="chart-card">
          <h3>User Growth</h3>
          <UserGrowthChart data={chartData} />
        </div>

        <div className="chart-card">
          <h3>Revenue Trends</h3>
          <RevenueChart data={chartData} />
        </div>
      </div>

      {/* TRANSACTION ACTIVITY */}
      <div className="full-width-card">
        <h3>Transaction Activity</h3>
        <RevenueChart data={chartData} />
      </div>
      {/* ===== RECENT USERS ===== */}
<div className="table-card">
  <h3>Recent Users</h3>

  <table className="users-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Join Date</th>
      </tr>
    </thead>
    <tbody>
      {data.recent_users.map((user) => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>
            {new Date(user.created_at).toLocaleDateString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="bottom-grid">

  <div className="server-card">
  <h3>Server Status</h3>
  <p>API Server: {systemInfo?.server_status.api}</p>
  <p>Database: {systemInfo?.server_status.database}</p>
</div>





  <div className="performance-card">
  <h3>Performance</h3>

  <p>CPU Usage: {systemInfo?.performance.cpu}%</p>
  <div className="progress">
    <div
      className="progress-bar cpu"
      style={{ width: `${systemInfo?.performance.cpu}%` }}
    ></div>
  </div>

  <p>Memory: {systemInfo?.performance.memory}%</p>
  <div className="progress">
    <div
      className="progress-bar memory"
      style={{ width: `${systemInfo?.performance.memory}%` }}
    ></div>
  </div>

  <p>Storage: {systemInfo?.performance.storage}%</p>
  <div className="progress">
    <div
      className="progress-bar storage"
      style={{ width: `${systemInfo?.performance.storage}%` }}
    ></div>
  </div>
</div>



  <div className="activity-card">
  <h3>Recent Activity</h3>

  {systemInfo?.recent_activity.map((activity, index) => (
    <div key={index} className="activity-item">
      <p><strong>{activity.message}</strong></p>
      <p>₹{activity.amount}</p>
      <small>{new Date(activity.date).toLocaleString()}</small>
    </div>
  ))}
</div>



</div>




    </div>
  );
}

export default Dashboard;