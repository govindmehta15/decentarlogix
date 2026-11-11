# Vercel deployment

App root: `DecentraLogix/frontend` relative to personal_projects; set the equivalent Root Directory relative to the imported Git repository.

Dependencies and builds run on Vercel. No local install is required. Use a Preview deployment first; cloud compilation has not yet been verified.

Legacy @secret aliases removed. Set REACT_APP_API_URL, REACT_APP_TRIP_REGISTRY_ADDRESS, REACT_APP_PAYMENT_ESCROW_ADDRESS, REACT_APP_CARBON_CREDITS_ADDRESS and REACT_APP_CHAIN_ID in Vercel settings.

Environment variable names referenced in source (not all are required):

- `REACT_APP_API_URL`
- `REACT_APP_CARBON_CREDITS_ADDRESS`
- `REACT_APP_CHAIN_ID`
- `REACT_APP_PAYMENT_ESCROW_ADDRESS`
- `REACT_APP_TRIP_REGISTRY_ADDRESS`

Set Node.js 22.x for Node apps. For nested workspace apps, retain their workspace lockfile and allow source access outside the app root. Do not place server secrets in client-prefixed variables.
