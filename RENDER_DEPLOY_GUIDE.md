# 🚀 Render.com 100% Free Deployment & Demo Guide

This guide explains how to deploy the **Hotel Pro Management System** on **Render.com** completely free of charge (both backend web service and frontend static site) for your **SkillWallet** project demo and presentation.

---

## 🌟 Overview of Free Tier Architecture

- **Backend Web Service**: Node.js + Express hosted on Render Free Web Service.
- **Frontend Static Site**: React 19 + Vite compiled and served on Render Free Static Site with CDN & SSL.
- **Database (Free)**: [MongoDB Atlas M0 Free Tier](https://www.mongodb.com/atlas) (512 MB forever free).
- **Authentication (Free)**: [Clerk](https://clerk.com/) (10,000 monthly active users free).
- **Media Storage (Free)**: [Cloudinary](https://cloudinary.com/) (25 GB free credits).
- **Caching (Free)**: [Upstash Redis](https://upstash.com/) (10,000 commands/day free) or graceful fallback.
- **Payments (Free Sandbox)**: [Stripe Test Mode](https://stripe.com/).

---

## 🛠️ Step 1: Push Repository to GitHub

Make sure the project is pushed to your GitHub repository (`https://github.com/pratiiiikk/Hotel-Booking`):
- Run `upload.bat` or upload the `Hotel-Booking-Clean.zip` directly at [github.com/new](https://github.com/new).

---

## 🛠️ Step 2: 1-Click Blueprint Deployment on Render

1. Sign up or log into [Render.com](https://render.com) (you can log in directly with your GitHub account).
2. On your Render Dashboard, click the blue **New +** button in the top right.
3. Select **Blueprint**.
4. Connect your GitHub account and select your **`Hotel-Booking`** repository.
5. Render will automatically read [`render.yaml`](render.yaml) and configure:
   - `hotel-pro-backend` (Node.js Web Service)
   - `hotel-pro-frontend` (Static Site)
6. Click **Apply**.

---

## 🛠️ Step 3: Enter Environment Variables on Render

In the Render Dashboard under **hotel-pro-backend -> Environment**:

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hotel-booking?retryWrites=true&w=majority` |
| `CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | Clerk Webhook Secret | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Test Key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe Test Secret | `sk_test_...` |
| `REDIS_URL` *(Optional)* | Upstash Redis connection URL | `rediss://default:token@region.upstash.io:6379` |

In **hotel-pro-frontend -> Environment**:

| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Live backend URL | `https://hotel-pro-backend.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_test_...` |
| `VITE_CURRENCY` | Currency symbol | `$` |

---

## 💡 Demo Mode & Local Verification

- **Automatic Demo Preview**: If MongoDB is empty or the backend is spinning up, the frontend automatically displays **demo luxury hotel rooms** with images, star ratings, amenities, and prices so your SkillWallet demo will **never show an empty or broken screen**.
- **Render Sleep Prevention**: Render's free tier spins down idle web services after 15 minutes. The frontend contains a built-in 5-minute keep-alive ping to `/api/rooms` to keep the backend warm and fast during your demo!
- **Health Check**: Render automatically tracks backend uptime using `/health` and `/`.

---

## 💻 Running the Demo Locally

```powershell
# Double-click start_all.bat in the project folder
start_all.bat
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
