import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import Home  from './pages/Home';
import { DetectDisease } from './pages/DetectDisease';
import { DiseaseLibrary } from './pages/DiseaseLibrary';
import { SubmitReport } from './pages/SubmitReport';
import { OutbreakMap } from './pages/OutbreakMap';
import { FarmingTips } from './pages/FarmingTips';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const MainApp = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedSample, setSelectedSample] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} setSelectedSample={setSelectedSample} />;
      case 'detect':
        return (
          <DetectDisease
            setActivePage={setActivePage}
            selectedSample={selectedSample}
            onClearSample={() => setSelectedSample(null)}
          />
        );
      case 'library':
        return <DiseaseLibrary />;
      case 'outbreaks':
        return <OutbreakMap setActivePage={setActivePage} />;
      case 'reports':
        return <SubmitReport />;
      case 'tips':
        return <FarmingTips />;
      case 'dashboard':
        return isAuthenticated ? (
          <FarmerDashboard setActivePage={setActivePage} />
        ) : (
          <Login setActivePage={setActivePage} />
        );
      case 'admin':
        return isAuthenticated && isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Extension Officer Access Required</h2>
            <p className="text-xs text-slate-500">Please login using administrative credentials.</p>
            <button
              onClick={() => setActivePage('login')}
              className="px-5 py-2.5 rounded-xl bg-forest-700 text-white font-bold text-xs"
            >
              Go to Login
            </button>
          </div>
        );
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'register':
        return <Register setActivePage={setActivePage} />;
      default:
        return <Home setActivePage={setActivePage} setSelectedSample={setSelectedSample} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer setActivePage={setActivePage} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
