import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { createTrip, getTripMetadata } from '../../services/contractService';
import { generateTestTrip, formatTxHash } from '../../utils/testUtils';
import toast from 'react-hot-toast';
import './TestPanel.css';

export function TestPanel() {
  const { signer, provider, account, isConnected } = useWeb3();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [tripId, setTripId] = useState('');

  const runQuickTest = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      const results = [];

      // Test 1: Create Trip
      results.push({ test: 'Create Trip', status: 'running' });
      setTestResults([...results]);

      const testTrip = generateTestTrip();
      const createResult = await createTrip(signer, testTrip);

      results[results.length - 1] = {
        test: 'Create Trip',
        status: 'success',
        data: {
          tripId: createResult.tripId,
          txHash: formatTxHash(createResult.txHash),
        },
      };
      setTestResults([...results]);
      setTripId(createResult.tripId);

      toast.success('Trip created successfully!');

      // Test 2: Get Trip Metadata
      results.push({ test: 'Get Trip Metadata', status: 'running' });
      setTestResults([...results]);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation

      const metadata = await getTripMetadata(provider, createResult.tripId);

      results[results.length - 1] = {
        test: 'Get Trip Metadata',
        status: 'success',
        data: {
          origin: metadata.originLocation,
          destination: metadata.destinationLocation,
          status: metadata.status,
        },
      };
      setTestResults([...results]);

      toast.success('Trip metadata retrieved!');

    } catch (error) {
      const lastResult = testResults[testResults.length - 1];
      if (lastResult) {
        lastResult.status = 'error';
        lastResult.error = error.message;
        setTestResults([...testResults]);
      }
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setTripId('');
  };

  return (
    <div className="test-panel">
      <h2>Testing Panel</h2>
      <p className="test-description">
        Run quick tests to verify contract interactions
      </p>

      {!isConnected && (
        <div className="test-warning">
          Please connect your wallet to run tests
        </div>
      )}

      <div className="test-actions">
        <button
          onClick={runQuickTest}
          disabled={isRunning || !isConnected}
          className="btn-test"
        >
          {isRunning ? 'Running Tests...' : 'Run Quick Test'}
        </button>
        {testResults.length > 0 && (
          <button onClick={clearResults} className="btn-clear">
            Clear Results
          </button>
        )}
      </div>

      {tripId && (
        <div className="test-trip-id">
          <strong>Created Trip ID:</strong> {tripId}
        </div>
      )}

      {testResults.length > 0 && (
        <div className="test-results">
          <h3>Test Results</h3>
          {testResults.map((result, index) => (
            <div key={index} className={`test-result test-${result.status}`}>
              <div className="test-result-header">
                <span className="test-name">{result.test}</span>
                <span className={`test-status status-${result.status}`}>
                  {result.status === 'running' && '⏳ Running...'}
                  {result.status === 'success' && '✅ Success'}
                  {result.status === 'error' && '❌ Error'}
                </span>
              </div>
              {result.data && (
                <div className="test-data">
                  {Object.entries(result.data).map(([key, value]) => (
                    <div key={key} className="test-data-item">
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              )}
              {result.error && (
                <div className="test-error">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

