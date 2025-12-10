import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './WalletConnect.css';

export function WalletConnect() {
  const { account, connectWallet, disconnectWallet, isConnecting, isConnected } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="wallet-connect">
        <div className="wallet-info">
          <span className="wallet-address">{formatAddress(account)}</span>
          <button onClick={disconnectWallet} className="btn-disconnect">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-connect"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}

