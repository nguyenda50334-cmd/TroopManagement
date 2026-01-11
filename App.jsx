import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TroopProvider } from "./context/TroopContext";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Scouts from "./pages/Scouts";
import MeritBadges from "./pages/MeritBadges";
import Events from "./pages/Events";
import Advancements from "./pages/Advancements";
import AuthLanding from "./pages/AuthLanding";
import WaitingApproval from "./pages/WaitingApproval";
import AdminApprovals from "./pages/AdminApprovals";
import Funds from "./pages/Funds";

function App() {
  return (
    <BrowserRouter>
      <TroopProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthLanding />} />
          <Route path="/waiting-approval" element={<WaitingApproval />} />
          
          {/* Protected App Routes */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scouts" element={<Scouts />} />
            <Route path="meritbadges" element={<MeritBadges />} />
            <Route path="events" element={<Events />} />
            <Route path="advancements" element={<Advancements />} />
            <Route path="funds" element={<Funds />} />
            
            {/* Admin Routes */}
            <Route path="admin/approvals" element={<AdminApprovals />} />
          </Route>
        </Routes>
      </TroopProvider>
    </BrowserRouter>
  );
}

export default App;