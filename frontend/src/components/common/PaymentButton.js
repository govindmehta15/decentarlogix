import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { releasePayment } from '../../services/contractService';
import { releasePaymentAPI } from '../../services/apiService';
import toast from 'react-hot-toast';
import './PaymentButton.css';

export function PaymentButton({ escrowId, amount, reason = 'Payment release' }) {
  const { signer, isConnected } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRelease = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!escrowId || !amount) {
      toast.error('Escrow ID and amount are required');
      return;
    }

    setIsProcessing(true);
    try {
      // Release payment on blockchain
      const txHash = await releasePayment(signer, escrowId, amount, reason);
      
      toast.success('Payment released successfully!');

      // Optionally sync with backend API
      try {
        await releasePaymentAPI({
          escrowId,
          amount,
          reason,
        });
      } catch (apiError) {
        console.warn('Failed to sync with API:', apiError);
      }

      // Show transaction hash
      toast.success(`Transaction: ${txHash.slice(0, 10)}...`);
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast.error(error.message || 'Failed to release payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    // Convert wei to ETH
    const eth = Number(amount) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  };

  return (
    <div className="payment-button-container">
      <div className="payment-info">
        <span className="payment-label">Escrow ID:</span>
        <span className="payment-value">{escrowId}</span>
      </div>
      <div className="payment-info">
        <span className="payment-label">Amount:</span>
        <span className="payment-value">{formatAmount(amount)}</span>
      </div>
      <button
        onClick={handleRelease}
        disabled={isProcessing || !isConnected}
        className="btn-release"
      >
        {isProcessing ? 'Processing...' : 'Release Payment'}
      </button>
      {!isConnected && (
        <p className="payment-warning">Connect wallet to release payment</p>
      )}
    </div>
  );
}

