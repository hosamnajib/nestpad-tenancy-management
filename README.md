# NestPad — Professional Tenancy Management System

NestPad is an enterprise-grade tenancy and property management application featuring property tracking, lease lifecycle administration, rent ledger with automated allocations, maintenance ticketing, calendar operations, document vaults, and an audit trail.

---

## 🚀 Quick Deployment Guide

### Step 1: Push to GitHub

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NestPad Tenancy Management System"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g. `nestpad-tenancy-management`).

3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nestpad-tenancy-management.git
   git push -u origin main
   ```

---

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and click **"Add New" > "Project"**.
2. Select your GitHub repository (`nestpad-tenancy-management`) and click **Import**.
3. **Framework Preset**: Leave as *Other*.
4. **Root Directory**: `./` (default).
5. Click **Deploy**!

Within seconds, your live production URL (e.g., `https://nestpad-tenancy-management.vercel.app`) will be active.

---

### Step 3: (Optional) Connect Cloud MySQL Database

Out of the box, the app runs with instant client-side state preservation (`localStorage`). If you want persistent shared relational database storage across users, connect a free Cloud MySQL provider (such as TiDB Cloud, Aiven, Railway, or Clever Cloud):

1. In your **Vercel Dashboard**, go to your project **Settings > Environment Variables**.
2. Add the following variables:
   - `MYSQL_HOST`: (your cloud database hostname)
   - `MYSQL_PORT`: `3306` (or provided port)
   - `MYSQL_USER`: (your database username)
   - `MYSQL_PASSWORD`: (your database password)
   - `MYSQL_DATABASE`: (your database name)
   - `MYSQL_SSL`: `true`
3. Redeploy your project. The serverless `/api/*` endpoints will automatically connect to your cloud database!

---

## 💻 Local Development

To run locally with Node.js:

```bash
npm install
npm start
```

Visit [http://localhost:8080](http://localhost:8080) to access the application.
