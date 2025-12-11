# DecentraLogix Deployment Guide

Complete step-by-step guide to deploy DecentraLogix to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy Smart Contracts](#deploy-smart-contracts)
3. [Deploy Backend](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **Polygon Mumbai Testnet Account**
   - Get MATIC from faucet: https://faucet.polygon.technology/
   - Keep private key secure

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Connect GitHub repository

3. **Render/Railway Account**
   - Sign up at https://render.com or https://railway.app
   - Connect GitHub repository

### Required Tools

- Node.js 18+
- Git
- MetaMask (for testing)
- GitHub account

---

## Deploy Smart Contracts

### Step 1: Get Polygon Mumbai RPC URL

**Option A: Alchemy**
1. Sign up at https://alchemy.com
2. Create new app → Select "Polygon" → "Mumbai"
3. Copy HTTP URL

**Option B: Infura**
1. Sign up at https://infura.io
2. Create project → Select "Polygon Mumbai"
3. Copy endpoint URL

**Option C: Public RPC**
```
https://rpc-mumbai.maticvigil.com
```

### Step 2: Fund Your Account

1. Get MATIC from faucet: https://faucet.polygon.technology/
2. Send to your deployment account
3. Verify balance on https://mumbai.polygonscan.com

### Step 3: Configure Environment

```bash
cd smart-contracts
```

Create `.env` file:
```env
PRIVATE_KEY=your_private_key_here
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Step 4: Deploy Contracts

```bash
npm run deploy:polygon
```

Or manually:
```bash
npx hardhat run scripts/deploy-polygon.js --network polygonMumbai
```

### Step 5: Verify Contracts

```bash
# Set addresses in .env first
TRIP_REGISTRY_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
CARBON_CREDITS_ADDRESS=0x...

# Verify
npx hardhat run scripts/verify-polygon.js --network polygonMumbai
```

Or verify individually:
```bash
npx hardhat verify --network polygonMumbai <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
```

### Step 6: Save Contract Addresses

Copy the deployed addresses - you'll need them for backend and frontend!

---

## Deploy Backend

### Option A: Render

#### Step 1: Create New Web Service

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `backend` folder

#### Step 2: Configure Service

**Settings:**
- **Name**: `decentralogix-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free or Starter

#### Step 3: Set Environment Variables

Click "Environment" tab and add:

```env
NODE_ENV=production
PORT=3001
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_backend_private_key
CHAIN_ID=80001
TRIP_REGISTRY_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
CARBON_CREDITS_ADDRESS=0x...
LOG_LEVEL=info
```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment
3. Copy the service URL (e.g., `https://decentralogix-backend.onrender.com`)

---

### Option B: Railway

#### Step 1: Create New Project

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

#### Step 2: Add Service

1. Click "New" → "GitHub Repo"
2. Select `backend` folder
3. Railway auto-detects Node.js

#### Step 3: Set Environment Variables

Click "Variables" tab and add:

```env
NODE_ENV=production
PORT=3001
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_backend_private_key
CHAIN_ID=80001
TRIP_REGISTRY_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
CARBON_CREDITS_ADDRESS=0x...
LOG_LEVEL=info
```

#### Step 4: Deploy

1. Railway auto-deploys on push
2. Get public URL from "Settings" → "Generate Domain"

---

## Deploy Frontend

### Step 1: Prepare Frontend

1. Update `frontend/.env` with production values:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_TRIP_REGISTRY_ADDRESS=0x...
REACT_APP_PAYMENT_ESCROW_ADDRESS=0x...
REACT_APP_CARBON_CREDITS_ADDRESS=0x...
REACT_APP_CHAIN_ID=80001
```

2. Commit and push to GitHub

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **decentralogix-frontend**
- Directory? **./**
- Override settings? **No**

#### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_TRIP_REGISTRY_ADDRESS=0x...
   REACT_APP_PAYMENT_ESCROW_ADDRESS=0x...
   REACT_APP_CARBON_CREDITS_ADDRESS=0x...
   REACT_APP_CHAIN_ID=80001
   ```

6. Click "Deploy"

### Step 3: Get Frontend URL

Vercel provides URL like: `https://decentralogix-frontend.vercel.app`

---

## Post-Deployment

### Step 1: Update Backend API URL

If frontend URL changed, update backend CORS:

```javascript
// backend/src/server.js
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app'],
  credentials: true
}));
```

### Step 2: Test Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Test Frontend**:
   - Open frontend URL
   - Connect MetaMask
   - Switch to Polygon Mumbai network
   - Test creating a trip

3. **Test Contracts**:
   - View on Polygonscan
   - Verify contract interactions

### Step 3: Update MetaMask Network

Users need to add Polygon Mumbai to MetaMask:

**Network Details:**
- Network Name: `Polygon Mumbai`
- RPC URL: `https://rpc-mumbai.maticvigil.com`
- Chain ID: `80001`
- Currency Symbol: `MATIC`
- Block Explorer: `https://mumbai.polygonscan.com`

---

## Troubleshooting

### Contract Deployment Fails

**Issue**: "Insufficient funds"
- **Solution**: Get more MATIC from faucet

**Issue**: "Nonce too high"
- **Solution**: Wait a few minutes and retry

**Issue**: "Contract verification fails"
- **Solution**: Ensure constructor arguments are correct

### Backend Deployment Fails

**Issue**: "Build fails"
- **Solution**: Check `package.json` scripts
- **Solution**: Ensure Node.js version is correct

**Issue**: "Environment variables not set"
- **Solution**: Double-check all variables in dashboard

**Issue**: "Cannot connect to blockchain"
- **Solution**: Verify RPC_URL is correct
- **Solution**: Check network connectivity

### Frontend Deployment Fails

**Issue**: "Build fails"
- **Solution**: Check for build errors locally first
- **Solution**: Ensure all environment variables are set

**Issue**: "API calls fail"
- **Solution**: Check CORS settings in backend
- **Solution**: Verify API_URL is correct

**Issue**: "Wallet connection fails"
- **Solution**: Ensure user is on correct network
- **Solution**: Check contract addresses are correct

---

## Production Checklist

- [ ] Contracts deployed to Polygon Mumbai
- [ ] Contracts verified on Polygonscan
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] MetaMask network added
- [ ] Test trip creation works
- [ ] Test payment release works
- [ ] Test carbon credits display works
- [ ] All endpoints responding
- [ ] Error handling working
- [ ] Logging configured

---

## URLs After Deployment

- **Frontend**: `https://decentralogix-frontend.vercel.app`
- **Backend**: `https://decentralogix-backend.onrender.com`
- **Contracts**: View on https://mumbai.polygonscan.com

---

## Maintenance

### Updating Contracts

1. Deploy new contracts
2. Update addresses in backend/frontend
3. Redeploy backend and frontend

### Updating Backend

1. Push changes to GitHub
2. Render/Railway auto-deploys
3. Check logs for errors

### Updating Frontend

1. Push changes to GitHub
2. Vercel auto-deploys
3. Check deployment logs

---

## Security Reminders

1. ✅ Never commit private keys
2. ✅ Use environment variables for secrets
3. ✅ Enable HTTPS (automatic on Vercel/Render)
4. ✅ Set up monitoring
5. ✅ Regular backups
6. ✅ Keep dependencies updated

---

## Cost Estimates

### Free Tier (Development)

- **Vercel**: Free (hobby plan)
- **Render**: Free (with limitations)
- **Railway**: $5/month (or free trial)
- **Polygon Mumbai**: Free (testnet)

### Production Costs

- **Vercel Pro**: $20/month
- **Render**: $7/month (starter)
- **Railway**: $5-20/month
- **Polygon Mainnet**: ~$0.01 per transaction

---

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Polygon Docs](https://docs.polygon.technology)

---

**Ready to deploy! Follow the steps above to get your platform live! 🚀**

