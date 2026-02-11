import React, { useEffect, useState } from "react";
import { getDashboardData } from "./services/dashboardService";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardData();
        setData(response);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.cardsContainer}>
          <div style={styles.card}>
            <h2>Total Users</h2>
            <p>{data.total_users}</p>
          </div>

          <div style={styles.card}>
            <h2>Total Transactions</h2>
            <p>{data.total_transactions}</p>
          </div>

          <div style={styles.card}>
            <h2>Total Revenue</h2>
            <p>${data.total_revenue}</p>
          </div>

          <div style={styles.card}>
            <h2>Active Rate</h2>
            <p>{data.active_rate}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
    color: "#111"
  },
  heading: {
    marginBottom: "30px",
    color: "#111"
  },
  cardsContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap"
  },
  card: {
    flex: "1 1 200px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    color: "#111"
  }
};

export default Dashboard;
