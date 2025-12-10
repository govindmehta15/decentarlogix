import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { getCarbonCredits } from '../../services/contractService';
import { getCarbonCreditsAPI } from '../../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './CarbonDashboard.css';

export function CarbonDashboard() {
  const { provider, account, isConnected } = useWeb3();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      loadCredits();
    } else {
      setLoading(false);
    }
  }, [account, isConnected, provider]);

  const loadCredits = async () => {
    if (!provider || !account) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try API first
      let creditsData;
      try {
        const apiResponse = await getCarbonCreditsAPI(account);
        creditsData = apiResponse.data;
      } catch (apiError) {
        // Fallback to blockchain
        creditsData = await getCarbonCredits(provider, account);
      }

      setCredits(creditsData);
    } catch (error) {
      console.error('Error loading carbon credits:', error);
      toast.error('Failed to load carbon credits');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return Number(num).toLocaleString();
  };

  const chartData = credits ? [
    {
      name: 'Carbon Credits',
      value: Number(credits.balance),
    },
    {
      name: 'Carbon Offset (kg)',
      value: Number(credits.totalCarbonOffset),
    },
  ] : [];

  if (!isConnected) {
    return (
      <div className="carbon-dashboard">
        <div className="dashboard-message">
          Please connect your wallet to view carbon credits
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="carbon-dashboard">
        <div className="dashboard-message">Loading carbon credits...</div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="carbon-dashboard">
        <div className="dashboard-message">No carbon credits data found</div>
      </div>
    );
  }

  return (
    <div className="carbon-dashboard">
      <h2>Carbon Credits Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatNumber(credits.balance)}</div>
          <div className="stat-unit">Credits</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Offset</div>
          <div className="stat-value">{formatNumber(credits.totalCarbonOffset)}</div>
          <div className="stat-unit">kg CO2</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Rewards</div>
          <div className="stat-value">{credits.rewardCount || credits.rewards?.length || 0}</div>
          <div className="stat-unit">Total Rewards</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="dashboard-chart">
          <h3>Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="dashboard-actions">
        <button onClick={loadCredits} className="btn-refresh">
          Refresh Data
        </button>
      </div>
    </div>
  );
}

