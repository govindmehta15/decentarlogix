import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { WalletConnect } from './components/wallet/WalletConnect';
import { TripForm } from './components/shipment/TripForm';
import { TripDetails } from './components/shipment/TripDetails';
import { PaymentButton } from './components/common/PaymentButton';
import { CarbonDashboard } from './components/common/CarbonDashboard';
import './App.css';

function App() {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [activeTab, setActiveTab] = useState('create');

  const handleTripCreated = (tripId) => {
    setSelectedTripId(tripId);
    setActiveTab('view');
  };

  return (
    <Web3Provider>
      <div className="App">
        <Toaster position="top-right" />
        
        <header className="app-header">
          <div className="header-content">
            <h1>DecentraLogix</h1>
            <WalletConnect />
          </div>
        </header>

        <nav className="app-nav">
          <button
            className={activeTab === 'create' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('create')}
          >
            Create Trip
          </button>
          <button
            className={activeTab === 'view' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('view')}
          >
            View Trip
          </button>
          <button
            className={activeTab === 'payment' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('payment')}
          >
            Payment
          </button>
          <button
            className={activeTab === 'carbon' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('carbon')}
          >
            Carbon Credits
          </button>
        </nav>

        <main className="app-main">
          {activeTab === 'create' && (
            <TripForm onTripCreated={handleTripCreated} />
          )}

          {activeTab === 'view' && (
            <div className="view-trip-container">
              <div className="trip-input-section">
                <h3>Enter Trip ID</h3>
                <input
                  type="text"
                  placeholder="Trip ID"
                  value={selectedTripId || ''}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="trip-id-input"
                />
              </div>
              {selectedTripId && (
                <TripDetails tripId={selectedTripId} />
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="payment-container">
              <h2>Release Payment</h2>
              <PaymentButton
                escrowId="1"
                amount="1000000000000000000"
                reason="Trip completed"
              />
            </div>
          )}

          {activeTab === 'carbon' && (
            <CarbonDashboard />
          )}
        </main>

        <footer className="app-footer">
          <p>DecentraLogix - Web3 Logistics Platform</p>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;

