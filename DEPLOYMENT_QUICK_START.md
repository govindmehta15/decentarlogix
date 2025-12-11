# Quick Deployment Guide

Fast-track deployment guide for DecentraLogix.

## 🚀 Quick Steps

### 1. Deploy Smart Contracts (5 minutes)

```bash
cd smart-contracts

# Get MATIC from faucet: https://faucet.polygon.technology/
# Set .env:
# PRIVATE_KEY=your_key
# MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
# POLYGONSCAN_API_KEY=your_key

npm run deploy:polygon
```

**Save the contract addresses!**

### 2. Deploy Backend (10 minutes)

#### Render (Recommended)

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub → Select `backend` folder
4. Set environment variables:
   ```
   RPC_URL=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=your_key
   CHAIN_ID=80001
   TRIP_REGISTRY_ADDRESS=<from step 1>
   PAYMENT_ESCROW_ADDRESS=<from step 1>
   CARBON_CREDITS_ADDRESS=<from step 1>
   ```
5. Deploy

**Save the backend URL!**

### 3. Deploy Frontend (5 minutes)

1. Go to https://vercel.com
2. New Project → Import GitHub repo
3. Root Directory: `frontend`
4. Set environment variables:
   ```
   REACT_APP_API_URL=<backend URL from step 2>/api
   REACT_APP_TRIP_REGISTRY_ADDRESS=<from step 1>
   REACT_APP_PAYMENT_ESCROW_ADDRESS=<from step 1>
   REACT_APP_CARBON_CREDITS_ADDRESS=<from step 1>
   REACT_APP_CHAIN_ID=80001
   ```
5. Deploy

**Done! Your app is live! 🎉**

## 📝 Required Information

Before starting, gather:

- [ ] Polygon Mumbai RPC URL (Alchemy/Infura)
- [ ] Private key for deployment
- [ ] MATIC in deployment account
- [ ] Polygonscan API key (optional, for verification)
- [ ] GitHub repository URL

## 🔗 Useful Links

- **Polygon Faucet**: https://faucet.polygon.technology/
- **Polygonscan**: https://mumbai.polygonscan.com
- **Vercel**: https://vercel.com
- **Render**: https://render.com
- **Railway**: https://railway.app

## ⚠️ Important

1. **Never commit private keys**
2. **Use testnet for testing**
3. **Verify contracts after deployment**
4. **Test everything before mainnet**

See `docs/DEPLOYMENT_GUIDE.md` for detailed instructions.

