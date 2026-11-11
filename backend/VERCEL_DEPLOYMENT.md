# Vercel deployment

App root: `DecentraLogix/backend` relative to personal_projects; set the equivalent Root Directory relative to the imported Git repository.

Dependencies and builds run on Vercel. No local install is required. Use a Preview deployment first; cloud compilation has not yet been verified.

Set deployed chain RPC, contract addresses and service credentials. File logging is replaced by console logging on Vercel. In-process rate limits are per instance, not global.

Environment variable names referenced in source (not all are required):

- `CARBON_CREDITS_ADDRESS`
- `CARRIER_ADDRESS`
- `CHAIN_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `LOG_LEVEL`
- `PAYMENT_ESCROW_ADDRESS`
- `PRIVATE_KEY`
- `RECEIVER_ADDRESS`
- `RPC_URL`
- `SHIPPER_ADDRESS`
- `TRIP_REGISTRY_ADDRESS`

Set Node.js 22.x for Node apps. For nested workspace apps, retain their workspace lockfile and allow source access outside the app root. Do not place server secrets in client-prefixed variables.
