import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { Layout } from "./components/Layout";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MonitorsPage } from "./pages/MonitorsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatusPage } from "./pages/StatusPage";
import { BillingPage } from "./pages/BillingPage";
import { MonitorDetailPage } from "./pages/MonitorDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/monitors"
        element={
          <PrivateRoute>
            <Layout>
              <MonitorsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <PrivateRoute>
            <Layout>
              <BillingPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/monitors/:id"
        element={
          <PrivateRoute>
            <Layout>
              <MonitorDetailPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/status/:slug" element={<StatusPage />} />
    </Routes>
  );
}
