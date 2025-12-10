import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { getTripMetadata } from '../../services/contractService';
import { getTripAPI } from '../../services/apiService';
import { TRIP_STATUS } from '../../config/constants';
import toast from 'react-hot-toast';
import './TripDetails.css';

export function TripDetails({ tripId }) {
  const { provider, account } = useWeb3();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId, provider]);

  const loadTrip = async () => {
    if (!provider) {
      setError('Please connect your wallet');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try API first (faster, cached)
      let tripData;
      try {
        const apiResponse = await getTripAPI(tripId);
        tripData = apiResponse.data;
      } catch (apiError) {
        // Fallback to blockchain
        tripData = await getTripMetadata(provider, tripId);
      }

      setTrip(tripData);
    } catch (err) {
      console.error('Error loading trip:', err);
      setError(err.message || 'Failed to load trip');
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="trip-details">
        <div className="loading">Loading trip details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-details">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-details">
        <div className="error">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="trip-details">
      <h2>Trip Details</h2>
      <div className="trip-info">
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-row">
            <span className="info-label">Trip ID:</span>
            <span className="info-value">{trip.tripId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`info-value status status-${trip.status}`}>
              {TRIP_STATUS[trip.status] || 'Unknown'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Origin:</span>
            <span className="info-value">{trip.originLocation}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Destination:</span>
            <span className="info-value">{trip.destinationLocation}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Distance:</span>
            <span className="info-value">{trip.distance} km</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Participants</h3>
          <div className="info-row">
            <span className="info-label">Shipper:</span>
            <span className="info-value address">{formatAddress(trip.shipper)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Carrier:</span>
            <span className="info-value address">{formatAddress(trip.carrier)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Receiver:</span>
            <span className="info-value address">{formatAddress(trip.receiver)}</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Carbon Footprint</h3>
          <div className="info-row">
            <span className="info-label">Estimated:</span>
            <span className="info-value">{trip.estimatedCarbonFootprint} kg CO2</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Timeline</h3>
          <div className="info-row">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatTimestamp(trip.createdAt)}</span>
          </div>
          {trip.startedAt !== '0' && (
            <div className="info-row">
              <span className="info-label">Started:</span>
              <span className="info-value">{formatTimestamp(trip.startedAt)}</span>
            </div>
          )}
          {trip.completedAt !== '0' && (
            <div className="info-row">
              <span className="info-label">Completed:</span>
              <span className="info-value">{formatTimestamp(trip.completedAt)}</span>
            </div>
          )}
        </div>

        {trip.ipfsMetadataHash && (
          <div className="info-section">
            <h3>Metadata</h3>
            <div className="info-row">
              <span className="info-label">IPFS Hash:</span>
              <span className="info-value ipfs-hash">{trip.ipfsMetadataHash}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

