# Deployment Checklist

Quick checklist for deploying DecentraLogix.

## Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables documented
- [ ] Contracts tested locally
- [ ] Backend tested locally
- [ ] Frontend tested locally

## Smart Contracts

- [ ] Get Polygon Mumbai RPC URL
- [ ] Fund deployment account with MATIC
- [ ] Set up `.env` in `smart-contracts/`
- [ ] Deploy contracts: `npm run deploy:polygon`
- [ ] Save contract addresses
- [ ] Verify contracts: `npm run verify:polygon`
- [ ] Test contracts on Polygonscan

## Backend

- [ ] Create Render/Railway account
- [ ] Connect GitHub repository
- [ ] Create new web service
- [ ] Set all environment variables
- [ ] Deploy backend
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Check logs for errors

## Frontend

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Import project
- [ ] Set all environment variables
- [ ] Deploy frontend
- [ ] Test frontend loads
- [ ] Test wallet connection
- [ ] Test contract interactions

## Post-Deployment

- [ ] Update CORS in backend
- [ ] Test complete flow end-to-end
- [ ] Verify all features work
- [ ] Check error handling
- [ ] Monitor logs
- [ ] Update documentation with URLs

## Production URLs

- [ ] Frontend URL: ________________
- [ ] Backend URL: ________________
- [ ] Contract Addresses:
  - TripRegistry: ________________
  - PaymentEscrow: ________________
  - CarbonCredits: ________________

## Testing

- [ ] Create test trip
- [ ] View trip details
- [ ] Release payment
- [ ] View carbon credits
- [ ] Test error scenarios

---

**All checked? You're ready for production! 🎉**

