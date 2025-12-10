import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { createTrip } from '../../services/contractService';
import { createTripAPI } from '../../services/apiService';
import toast from 'react-hot-toast';
import './TripForm.css';

export function TripForm({ onTripCreated }) {
  const { signer, account, isConnected } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    carrier: '',
    receiver: '',
    originLocation: '',
    destinationLocation: '',
    distance: '',
    estimatedCarbonFootprint: '',
    ipfsMetadataHash: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.carrier || !formData.receiver || !formData.originLocation || 
        !formData.destinationLocation || !formData.distance || !formData.estimatedCarbonFootprint) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(formData.carrier) || !addressRegex.test(formData.receiver)) {
      toast.error('Invalid Ethereum address format');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create trip on blockchain
      const result = await createTrip(signer, {
        carrier: formData.carrier,
        receiver: formData.receiver,
        originLocation: formData.originLocation,
        destinationLocation: formData.destinationLocation,
        distance: parseInt(formData.distance, 10),
        estimatedCarbonFootprint: parseInt(formData.estimatedCarbonFootprint, 10),
        ipfsMetadataHash: formData.ipfsMetadataHash,
      });

      toast.success(`Trip created! ID: ${result.tripId}`);

      // Optionally sync with backend API
      try {
        await createTripAPI({
          carrier: formData.carrier,
          receiver: formData.receiver,
          originLocation: formData.originLocation,
          destinationLocation: formData.destinationLocation,
          distance: formData.distance,
          estimatedCarbonFootprint: formData.estimatedCarbonFootprint,
          ipfsMetadataHash: formData.ipfsMetadataHash,
        });
      } catch (apiError) {
        console.warn('Failed to sync with API:', apiError);
      }

      // Reset form
      setFormData({
        carrier: '',
        receiver: '',
        originLocation: '',
        destinationLocation: '',
        distance: '',
        estimatedCarbonFootprint: '',
        ipfsMetadataHash: '',
      });

      // Notify parent
      if (onTripCreated) {
        onTripCreated(result.tripId);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error.message || 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trip-form-container">
      <h2>Create New Trip</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="carrier">Carrier Address *</label>
          <input
            type="text"
            id="carrier"
            name="carrier"
            value={formData.carrier}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="receiver">Receiver Address *</label>
          <input
            type="text"
            id="receiver"
            name="receiver"
            value={formData.receiver}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="originLocation">Origin Location *</label>
          <input
            type="text"
            id="originLocation"
            name="originLocation"
            value={formData.originLocation}
            onChange={handleChange}
            placeholder="New York, NY"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destinationLocation">Destination Location *</label>
          <input
            type="text"
            id="destinationLocation"
            name="destinationLocation"
            value={formData.destinationLocation}
            onChange={handleChange}
            placeholder="Los Angeles, CA"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="distance">Distance (km) *</label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              placeholder="4500"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="estimatedCarbonFootprint">Estimated CO2 (kg) *</label>
            <input
              type="number"
              id="estimatedCarbonFootprint"
              name="estimatedCarbonFootprint"
              value={formData.estimatedCarbonFootprint}
              onChange={handleChange}
              placeholder="1000"
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ipfsMetadataHash">IPFS Metadata Hash (Optional)</label>
          <input
            type="text"
            id="ipfsMetadataHash"
            name="ipfsMetadataHash"
            value={formData.ipfsMetadataHash}
            onChange={handleChange}
            placeholder="QmHash..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="btn-submit"
        >
          {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
        </button>

        {!isConnected && (
          <p className="form-warning">Please connect your wallet to create a trip</p>
        )}
      </form>
    </div>
  );
}

