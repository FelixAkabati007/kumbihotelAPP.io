# Deployment Fix Instructions

If you are seeing **500 Internal Server Errors** (like `relation "settings" does not exist`), follow these steps to fix your Production database.

## 1. Push Database Schema
Your code has tables (`settings`, `rooms`, etc.) that do not exist in your Neon database yet.

Run this command in your terminal:
```bash
# Windows PowerShell
$env:DATABASE_URL="postgres://..."; npm run db:push

# Mac/Linux
DATABASE_URL="postgres://..." npm run db:push
```
*Replace `postgres://...` with your **Neon Pooled Connection String**.*

## 2. Seed Initial Data
After creating the tables, populate them with default data (admin user, contact number, etc.):

```bash
# Windows PowerShell
$env:DATABASE_URL="postgres://..."; npm run seed

# Mac/Linux
DATABASE_URL="postgres://..." npm run seed
```

## 3. Verify Environment Variables
Ensure your Vercel project has the correct environment variables:
- `DATABASE_URL`: Your Neon **Pooled** connection string (`...-pooler.eastus.azure.neon.tech...`)
- `JWT_SECRET`: A secure random string.
- `NODE_ENV`: Should be `production`.

## 4. Redeploy
After updating variables in Vercel, go to **Deployments** and click **Redeploy**.
