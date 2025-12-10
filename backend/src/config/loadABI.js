import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load contract ABI from Hardhat artifacts
 * @param {string} contractName - Name of the contract
 * @returns {Array} Contract ABI
 */
export function loadContractABI(contractName) {
  try {
    // Path to Hardhat artifacts (adjust if needed)
    const artifactsPath = join(
      __dirname,
      '../../smart-contracts/artifacts/contracts',
      `core/${contractName}.sol`,
      `${contractName}.json`
    );

    const artifact = JSON.parse(readFileSync(artifactsPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    console.warn(`Could not load ABI for ${contractName}, using minimal ABI`);
    return getMinimalABI(contractName);
  }
}

/**
 * Get minimal ABI if artifacts not available
 * @param {string} contractName - Name of the contract
 * @returns {Array} Minimal ABI
 */
function getMinimalABI(contractName) {
  // Fallback to minimal ABI defined in blockchain.js
  // This is used if artifacts are not available
  return [];
}

