import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import AnimatedBackground from '../components/ui/AnimatedBackground.jsx';
import StickyAdBanner from '../components/ui/StickyAdBanner.jsx';

const Home = lazy(() => import('../pages/Home.jsx'));
const GameList = lazy(() => import('../pages/GameList.jsx'));
const GameDetail = lazy(() => import('../pages/GameDetail.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const RegisterAdmin = lazy(() => import('../pages/RegisterAdmin.jsx'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const GameManagement = lazy(() => import('../pages/admin/GameManagement.jsx'));
const ReviewManagement = lazy(() => import('../pages/admin/ReviewManagement.jsx'));
const Logs = lazy(() => import('../pages/admin/Logs.jsx'));
const About = lazy(() => import('../pages/About.jsx'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const Help = lazy(() => import('../pages/Help.jsx'));
const Terms = lazy(() => import('../pages/Terms.jsx'));

const SkeletonPage = () => (
  <div className="page section skeleton-page">
    <div className="skeleton-block skeleton-title" />
    <div className="skeleton-block skeleton-text" />
    <div className="skeleton-block skeleton-text" />
    <div className="skeleton-grid">
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="skeleton-card" />
      ))}
    </div>
  </div>
);
const AppRoutes = () => (
  <BrowserRouter>
    <div className="app-shell">
      <AnimatedBackground />
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<SkeletonPage />}>
          <Routes>
            <Route path="/" element={<Navigate to="/Home" replace />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/admin" element={<RegisterAdmin />} />
            <Route path="/policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/help" element={<Help />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/games" element={<GameManagement />} />
            <Route path="/admin/reviews" element={<ReviewManagement />} />
            <Route path="/admin/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <StickyAdBanner />
      <Footer />
    </div>
  </BrowserRouter>
);

export default AppRoutes;
