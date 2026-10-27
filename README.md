# 🏨 Hotel Pro Management System

A production-grade, full-stack Hotel Booking and Management System built with the **MERN** stack (MongoDB, Express.js, React, Node.js), **Tailwind CSS v4**, **Clerk Authentication**, and **Stripe Payments**. Developed for the **SkillWallet** project portfolio.

![Hotel Pro Banner](assets/banner.png)

---

## 🌟 Key Highlights & Features

### 👤 Guest / User Features
- **Browse & Search Hotels & Rooms**: Filter accommodations by city, dates, guests, amenities, and price.
- **Detailed Room Views**: High-resolution image galleries (Cloudinary), amenities, pricing breakdowns, and real-time availability.
- **Instant Booking & Payments**: Seamless checkout powered by **Stripe** with secure payment intent handling.
- **Booking Management**: View past and upcoming reservations with statuses (Pending, Confirmed, Cancelled).
- **Automated Email Notifications**: Booking confirmation receipts sent automatically via **Nodemailer** (SMTP).

### 🏨 Hotel Owner / Management Dashboard
- **Property Registration**: Register new hotel properties with descriptions, address, city, and star rating.
- **Room Inventory Management**: Add, update, and manage dynamic room listings with pricing, max guests, room types, and amenities.
- **Occupancy & Revenue Tracking**: Track total reservations, occupancy rates, and revenue metrics.
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard guests and verified hotel owners managed securely via **Clerk**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router Dom v7, React Hot Toast |
| **Authentication** | Clerk React SDK (`@clerk/react`), Clerk Express Middleware (`@clerk/express`) |
| **Backend API** | Node.js, Express.js (RESTful API architecture) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Payments** | Stripe SDK & Stripe Webhooks (Raw body signature verification) |
| **Media & Storage** | Cloudinary API, Multer (multipart form handling) |
| **Email Service** | Nodemailer (SMTP / Brevo / Gmail) |
| **Webhooks** | Svix (Clerk user lifecycle sync & Stripe event verification) |

---

## 📁 Repository Structure

```text
hotel-booking/
├── assets/                  # Banners, screenshots, and visual documentation
├── client/                  # Frontend Single Page Application (React + Vite)
│   ├── public/              # Static assets, favicon, redirects
│   ├── src/
│   │   ├── assets/          # Icons, vectors, room thumbnails
│   │   ├── components/      # UI components (Hero, Navbar, HotelCard, etc.)
│   │   │   └── hotelOwner/  # Dashboard sidebar and owner navbar
│   │   ├── context/         # AppContext (Global state, auth sync, rooms)
│   │   ├── pages/           # Route views (Home, AllRooms, RoomDetails, MyBookings)
│   │   │   └── hotelOwner/  # Owner views (Dashboard, AddRoom, ListRoom)
│   │   ├── App.jsx          # Route declarations and layout
│   │   ├── index.css        # Tailwind styling & theme
│   │   └── main.jsx         # ClerkProvider & root bootstrap
│   ├── .env.example         # Frontend environment variable template
│   ├── package.json         # Client dependencies & scripts
│   └── vite.config.js       # Vite configuration with Tailwind plugin
│
├── server/                  # Backend REST API (Node.js + Express)
│   ├── configs/             # Database (MongoDB), Cloudinary, & Nodemailer setup
│   ├── controllers/         # Business logic (Rooms, Hotels, Bookings, Users)
│   ├── middleware/          # Clerk authentication & Multer upload middleware
│   ├── models/              # Mongoose schemas (User, Hotel, Room, Booking)
│   ├── routes/              # Express API endpoints
│   ├── server.js            # Express server initialization & webhook endpoints
│   ├── .env.example         # Backend environment variable template
│   └── package.json         # Server dependencies & scripts
│
└── package.json             # Root monorepo helper scripts
```

---

## ⚙️ Quick Start & Setup Guide

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) database cluster
- [Clerk Developer Account](https://clerk.com/)
- [Cloudinary Account](https://cloudinary.com/)
- [Stripe Account](https://stripe.com/)

---

### Step 1: Install Dependencies

You can install all dependencies from the root directory or inside each folder:

```bash
# Option A: From root directory
npm run install:all

# Option B: Individually
cd server && npm install
cd ../client && npm install
```

---

### Step 2: Environment Variables Configuration

#### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env` and supply your credentials:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hotel-booking?retryWrites=true&w=majority

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
SENDER_EMAIL=your_email@gmail.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Stripe Payments
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:5001
VITE_CURRENCY=$
```

---

### Step 3: Run the Application

In two separate terminal windows:

```bash
# Terminal 1 - Start the Backend API (runs on port 5001)
cd server
npm run server

# Terminal 2 - Start the React Frontend (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 🌐 API Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rooms` | Retrieve all available hotel rooms |
| `GET` | `/api/rooms/:id` | Retrieve detailed information for a specific room |
| `GET` | `/api/hotels` | Retrieve list of registered hotels |

### Protected User Endpoints (Requires Clerk Bearer Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user` | Fetch current user profile & role |
| `POST` | `/api/user/store-recent-search` | Save recent search destinations |
| `POST` | `/api/bookings` | Create a reservation and initialize Stripe session |
| `GET` | `/api/bookings/user` | Fetch all bookings for the logged-in user |

### Hotel Owner Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/hotels` | Register a new hotel property |
| `POST` | `/api/rooms` | Add a new room listing (with Cloudinary image uploads) |
| `GET` | `/api/rooms/owner` | List all rooms managed by the authenticated owner |
| `GET` | `/api/bookings/owner` | List reservations for owner's properties |

### Webhooks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/clerk` | Clerk webhook for real-time user lifecycle sync (create/update/delete) |
| `POST` | `/api/stripe` | Stripe webhook to handle `payment_intent.succeeded` & confirm booking |

---

## 🚀 Deployment Instructions

### Deploy Frontend (Vercel)
1. Push this repository to GitHub.
2. Link the repository to [Vercel](https://vercel.com).
3. Set the Root Directory to `client`.
4. Add the environment variables (`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`, `VITE_CURRENCY`).
5. Deploy!

### Deploy Backend (Render / Railway)
1. Link the repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Set Root Directory to `server`.
3. Set Build Command to `npm install` and Start Command to `npm start`.
4. Add all environment variables listed in `server/.env.example`.
5. Deploy and update `VITE_BACKEND_URL` on the frontend with your live backend domain.

---

## 👨‍💻 Author & Project Info

- **Project**: Hotel Pro Management System
- **Portfolio**: [SkillWallet Project Submission](https://myskillwallet.ai)
- **Developer**: [Pratik (praatiiiik / pratiiiikk)](https://github.com/pratiiiikk)
- **License**: ISC
