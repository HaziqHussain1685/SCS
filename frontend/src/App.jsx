import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AdvancedCybersecurityDashboard from './components/dashboard/AdvancedCybersecurityDashboard';
import ScannerInterface from './components/dashboard/ScannerInterface';
import { ThemeProvider } from './contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('scanner'); // 'scanner' or 'results'
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanStart = () => {
    setIsScanning(true);
  };

  const handleScanResults = (results) => {
    setScanResults(results);
    setIsScanning(false);
    setCurrentView('results');
  };

  return (
    <ThemeProvider>
      <div className="w-full">
        {currentView === 'scanner' ? (
          <ScannerInterface onScanResults={handleScanResults} onScanStart={handleScanStart} />
        ) : (
          <div>
            <button
              onClick={() => setCurrentView('scanner')}
              className="fixed top-4 right-4 z-40 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Scanner
            </button>
            <AdvancedCybersecurityDashboard scanResults={scanResults} isScanning={isScanning} />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
