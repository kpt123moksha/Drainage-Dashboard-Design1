import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CitizenDataProvider from "./pages/citizen/CitizenData";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CleaningVerificationPage from "./pages/citizen/CleaningVerificationPage";
import HomePage from "./pages/citizen/HomePage";
import LoginPage from "./pages/citizen/LoginPage";
import MyComplaintsPage from "./pages/citizen/MyComplaintsPage";
import NearbyMapPage from "./pages/citizen/NearbyMapPage";
import RegisterPage from "./pages/citizen/RegisterPage";
import ReportIssuePage from "./pages/citizen/ReportIssuePage";

export default function App() {
  return (
    <CitizenDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/complaints" element={<MyComplaintsPage />} />
          <Route path="/map" element={<NearbyMapPage />} />
          <Route path="/verification" element={<CleaningVerificationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CitizenDataProvider>
  );
}
