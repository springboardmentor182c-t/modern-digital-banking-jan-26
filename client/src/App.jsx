import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login, Signup } from "./features/auth";


import { Dashboard } from "./features/dashboard";
import { Accounts } from "./features/accounts";
import { Transactions } from "./features/transactions";
import { Budgets } from "./features/budgets";
import { Bills } from "./features/bills";
import { Rewards } from "./features/rewards";
import { Insights } from "./features/insights";
import { Alerts } from "./features/alerts";

import { Login as AdminLogin, AdminDashboard, UserManagement, KYCVerification, SystemAlerts, AdminLogs, Reports } from "./features/admin";

import PageContainer from "./layout/PageContainer";
import AdminPageContainer from "./layout/AdminPageContainer";

const withLayout = (Component) => (
  <PageContainer>
    <Component />
  </PageContainer>
);

const withAdminLayout = (Component) => (
  <AdminPageContainer>
    <Component />
  </AdminPageContainer>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={withLayout(Dashboard)} />
        <Route path="/accounts" element={withLayout(Accounts)} />
        <Route path="/transactions" element={withLayout(Transactions)} />
        <Route path="/budgets" element={withLayout(Budgets)} />
        <Route path="/bills" element={withLayout(Bills)} />
        <Route path="/rewards" element={withLayout(Rewards)} />
        <Route path="/insights" element={withLayout(Insights)} />
        <Route path="/alerts" element={withLayout(Alerts)} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={withAdminLayout(AdminDashboard)} />
        <Route path="/admin/users" element={withAdminLayout(UserManagement)} />
        <Route path="/admin/kyc" element={withAdminLayout(KYCVerification)} />
        <Route path="/admin/alerts" element={withAdminLayout(SystemAlerts)} />
        <Route path="/admin/logs" element={withAdminLayout(AdminLogs)} />
        <Route path="/admin/reports" element={withAdminLayout(Reports)} />
      </Routes>
    </BrowserRouter>
  );
}
