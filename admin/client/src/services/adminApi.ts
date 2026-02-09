const BASE_URL = "http://localhost:8080"

export const adminLogin = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
  return res.json()
}

export const fetchAlerts = async () => {
  const res = await fetch(`${BASE_URL}/admin/alerts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
  return res.json()
}

export const fetchDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
  return res.json()
}
