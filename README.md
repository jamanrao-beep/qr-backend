# Atara Men QR Payment Backend (Vercel)

This backend creates dynamic Razorpay UPI QR codes for Atara Men with the exact cart/order total (taxes, shipping, products) and polls payment status so the shopper never leaves the website.

## Setup & Deployment to Vercel (Takes 2 minutes)

### Option A: Via Vercel CLI (Super Fast)
1. Open PowerShell / Command Prompt inside this folder:
   ```bash
   cd c:\Users\amanr\OneDrive\Desktop\Projects\atara-men-shopify\qr-backend
   ```
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the prompts (log in with your Vercel account, accept defaults).
4. Set your Environment Variables on Vercel Dashboard (or run `npx vercel env add`):
   - `RAZORPAY_KEY_ID`: `rzp_live_TbUpTqhis2nrpg`
   - `RAZORPAY_KEY_SECRET`: `<your secret key>`
5. Deploy to production:
   ```bash
   npx vercel --prod
   ```
6. Copy your deployed URL (e.g. `https://atara-men-qr.vercel.app`).

### Option B: Via GitHub & Vercel Dashboard
1. Push this `qr-backend` folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Import your repo.
3. Under **Environment Variables**, add:
   - `RAZORPAY_KEY_ID`: `rzp_live_TbUpTqhis2nrpg`
   - `RAZORPAY_KEY_SECRET`: `<your secret key>`
4. Click **Deploy**.
