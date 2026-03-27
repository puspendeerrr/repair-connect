# 📖 Documentation 1: How the Backend & Database Work

> **Audience:** Absolute beginners — this explains every concept, every file, and every line of code.

---

## Table of Contents

1. [What is a Backend?](#1-what-is-a-backend)
2. [What is a Database?](#2-what-is-a-database)
3. [Technologies Used](#3-technologies-used)
4. [Folder Structure](#4-folder-structure)
5. [How the Server Starts — server.js](#5-how-the-server-starts--serverjs)
6. [Database Connection — config/db.js](#6-database-connection--configdbjs)
7. [Database Models (Schemas)](#7-database-models-schemas)
8. [Authentication System](#8-authentication-system)
9. [Middleware — The Security Guards](#9-middleware--the-security-guards)
10. [API Routes — The Endpoints](#10-api-routes--the-endpoints)
11. [Real-Time Communication — Socket.io](#11-real-time-communication--socketio)
12. [Utilities](#12-utilities)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Environment Variables](#14-environment-variables)

---

## 1. What is a Backend?

Imagine a restaurant:
- **Frontend** = the dining area where customers sit, see the menu, and place orders (what users see in their browser)
- **Backend** = the kitchen where chefs actually cook the food (the server that processes requests, talks to the database, and sends back results)
- **Database** = the refrigerator/pantry that stores all the ingredients (where all data like users, requests, bookings is permanently saved)

When a user clicks "Post a Repair Request" on the website:
1. The **frontend** sends an HTTP request to the backend (like placing an order)
2. The **backend** receives it, validates it, and saves it to the **database** (chef prepares the food)
3. The **backend** sends back a response to the frontend (order is served)

### What is an API?

**API** (Application Programming Interface) is a set of URLs (called **endpoints**) that the backend exposes for the frontend to communicate with. For example:
- `POST /api/auth/send-otp` → Send an OTP email
- `GET /api/requests` → Get all repair requests
- `POST /api/requests` → Create a new repair request

Each endpoint has:
- **Method** (GET = read, POST = create, PATCH = update, DELETE = remove)
- **URL path** (like `/api/requests`)
- **Request body** (data sent by the frontend, like `{ title: "AC not cooling" }`)
- **Response** (data sent back, like `{ request: { _id: "abc123", title: "AC not cooling" } }`)

---

## 2. What is a Database?

A **database** is like a giant organized filing cabinet where all your application's data is stored permanently.

### MongoDB — Our Database

We use **MongoDB**, which is a **NoSQL** (Not Only SQL) database. Unlike traditional databases with rigid tables (like Excel spreadsheets), MongoDB stores data as **documents** — which look exactly like JavaScript objects:

```json
{
  "_id": "65f2a1b3c4d5e6f7a8b9c0d1",
  "name": "Priya Sharma",
  "email": "priya@email.com",
  "role": "customer",
  "city": "Mumbai",
  "createdAt": "2026-03-27T08:00:00Z"
}
```

Key MongoDB concepts:
| Concept | Analogy | Meaning |
|---|---|---|
| **Database** | Filing cabinet | The entire storage system (our database is named "repair_connect") |
| **Collection** | A drawer in the cabinet | A group of similar documents (like "users", "requests", "bookings") |
| **Document** | A single file/paper | One record (like one user's data) |
| **Field** | A line on the paper | One piece of data (like "name" or "email") |
| **ObjectId** | A unique serial number | MongoDB auto-generates a unique `_id` for every document |

### Mongoose — The Translator

**Mongoose** is an **ODM** (Object-Document Mapper) — it translates between JavaScript objects and MongoDB documents. Without Mongoose, you'd have to write raw MongoDB queries. With Mongoose, you write clean JavaScript:

```javascript
// Without Mongoose (raw MongoDB):
db.collection('users').findOne({ email: 'priya@email.com' });

// With Mongoose (much cleaner):
const user = await User.findOne({ email: 'priya@email.com' });
```

---

## 3. Technologies Used

| Technology | What it is | Why we use it |
|---|---|---|
| **Node.js** | JavaScript runtime that runs outside the browser | Lets us write backend code in JavaScript |
| **Express.js** | Web framework for Node.js | Makes creating API endpoints easy (like a kitchen blueprint) |
| **MongoDB** | NoSQL database | Stores all our data (users, requests, bookings, etc.) |
| **Mongoose** | ODM for MongoDB | Creates structured "schemas" for our data and validates it |
| **Socket.io** | Real-time communication library | Enables live chat without page refresh (like WhatsApp) |
| **JWT** | JSON Web Token | Secure authentication token (like a digital ID card) |
| **bcryptjs** | Password hashing library | Encrypts OTP codes (even if someone steals the database, they can't read OTPs) |
| **Nodemailer** | Email sending library | Sends OTP emails to users via Gmail SMTP |
| **Cloudinary** | Cloud image storage | Stores uploaded images (repair photos) on the cloud |
| **Razorpay** | Payment gateway (India) | Handles secure online payments |
| **dotenv** | Environment variable loader | Keeps sensitive data (passwords, API keys) in a `.env` file, not in code |
| **cookie-parser** | Cookie reading middleware | Reads JWT tokens from browser cookies |
| **cors** | Cross-Origin Resource Sharing | Allows the frontend (port 5173) to talk to the backend (port 5000) |

---

## 4. Folder Structure

```
backend/
├── config/
│   ├── db.js              ← MongoDB connection function
│   └── cloudinary.js       ← Cloudinary + Multer upload configuration
├── middleware/
│   └── auth.js             ← JWT authentication & role-check middleware
├── models/                 ← Database schemas (10 models)
│   ├── User.js             ← All registered users
│   ├── ServiceProvider.js  ← Extra data for providers (skills, rating)
│   ├── Request.js          ← Repair requests posted by customers
│   ├── Quote.js            ← Price quotes from providers
│   ├── Booking.js          ← Confirmed jobs (after accepting a quote)
│   ├── Message.js          ← Chat messages between customer & provider
│   ├── Review.js           ← Star ratings & comments after job completion
│   ├── Payment.js          ← Razorpay payment records
│   ├── Notification.js     ← In-app notification alerts
│   └── Otp.js              ← Temporary OTP codes for login
├── routes/                 ← API endpoint handlers (10 route files)
│   ├── auth.js             ← Login, register, OTP, logout
│   ├── users.js            ← User profile management
│   ├── requests.js         ← Create/list/update repair requests + submit quotes
│   ├── quotes.js           ← View/accept/reject quotes
│   ├── bookings.js         ← Manage bookings lifecycle
│   ├── messages.js         ← Fetch/send chat messages
│   ├── reviews.js          ← Post/fetch reviews
│   ├── payments.js         ← Razorpay order creation + verification
│   ├── notifications.js    ← Fetch/mark-read notifications
│   └── upload.js           ← Image upload to Cloudinary
├── socket/
│   └── index.js            ← Socket.io real-time event handlers
├── utils/
│   ├── mailer.js           ← Nodemailer email sender
│   └── razorpay.js         ← Razorpay instance
├── server.js               ← 🟢 ENTRY POINT — starts everything
├── package.json            ← Dependencies & scripts
└── .env.example            ← Template for environment variables
```

---

## 5. How the Server Starts — server.js

This is the **main entry point** — the first file that runs when you type `node server.js`.

📁 File: [server.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/server.js)

### Line-by-Line Breakdown

```javascript
require('dotenv').config();
```
- **What:** Loads the `.env` file (a plain-text file with secrets like database passwords)
- **Why:** We never want to hard-code passwords into source code. `.env` files are git-ignored so they never get uploaded to GitHub

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
```
- **What:** Importing the libraries we need
- `express` — the web framework
- `http` — Node's built-in HTTP module (needed because Socket.io requires a raw HTTP server)
- `Server` from `socket.io` — for real-time communication
- `cors` — allows cross-origin requests (frontend on port 5173 calling backend on port 5000)
- `cookieParser` — reads cookies from incoming requests

```javascript
const connectDB = require('./config/db');
const setupSocket = require('./socket/index');
```
- **What:** Importing our own custom modules — the database connector and socket setup function

```javascript
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// ... (10 route imports total)
```
- **What:** Importing all 10 API route files. Each file handles a specific feature area

```javascript
const app = express();
const server = http.createServer(app);
```
- **What:** Creates the Express application and wraps it in a raw HTTP server
- **Why:** Express normally creates its own HTTP server, but Socket.io needs access to the raw server to upgrade HTTP connections to WebSocket connections

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});
setupSocket(io);
```
- **What:** Creates the Socket.io server instance and initializes all socket event handlers
- `cors.origin` — tells Socket.io which frontend URL is allowed to connect
- `credentials: true` — allows cookies to be sent with WebSocket connections

```javascript
app.set('io', io);
```
- **What:** Makes the Socket.io instance accessible in any route handler via `req.app.get('io')`
- **Why:** So API routes can push real-time notifications (e.g., when a quote is accepted, immediately notify the provider)

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
```
- **What:** Middleware setup (runs on EVERY incoming request)
- `cors(...)` — allows the frontend origin to make requests
- `express.json()` — parses JSON request bodies (when frontend sends data like `{ title: "AC broken" }`, Express converts it from raw text to a JavaScript object). The `10mb` limit allows large image data
- `cookieParser()` — reads cookies (where we store the JWT auth token)

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... (10 route registrations)
```
- **What:** Route mounting — tells Express which file handles which URL prefix
- Any request to `/api/auth/...` goes to `routes/auth.js`
- Any request to `/api/requests/...` goes to `routes/requests.js`

```javascript
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
```
- **What:** A health check endpoint — used to verify the server is running
- Visit `http://localhost:5000/api/health` in your browser and you'll see `{"status":"ok"}`

```javascript
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
```
- **What:** 404 catch-all — if no route matched the incoming URL, return a "not found" error

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});
```
- **What:** Global error handler — catches any uncaught errors and returns a 500 response
- **Note:** Express recognizes this as an error handler because it has 4 parameters (`err, req, res, next`)

```javascript
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Repair Connect API running on port ${PORT}`);
  });
});
```
- **What:** Startup sequence:
  1. First, connect to MongoDB (wait for it to succeed)
  2. Then, start listening on port 5000
  3. Print a success message
- **Why connect before listening?** If the database is unreachable, there's no point starting the server

```mermaid
graph TB
    A["node server.js"] --> B["Load .env variables"]
    B --> C["Import Express, Socket.io, routes"]
    C --> D["Create Express app + HTTP server"]
    D --> E["Create Socket.io server"]
    E --> F["Register middleware<br/>(CORS, JSON, Cookies)"]
    F --> G["Mount 10 API route files"]
    G --> H["Connect to MongoDB"]
    H --> I["Start listening on port 5000"]
    I --> J["🟢 Server is LIVE"]
```

---

## 6. Database Connection — config/db.js

📁 File: [db.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/config/db.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Breakdown:

| Line | What it does |
|---|---|
| `const mongoose = require('mongoose')` | Imports the Mongoose library |
| `const connectDB = async () => {` | Creates an **async function** (async = can use `await` to wait for operations to finish) |
| `await mongoose.connect(process.env.MONGODB_URI)` | Connects to MongoDB using the URL from `.env` file (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/repair_connect`) |
| `console.log(...)` | Prints the database host to confirm connection |
| `process.exit(1)` | If connection fails, **kill the entire server** (exit code 1 = error) — because nothing works without the database |
| `module.exports = connectDB` | Exports the function so `server.js` can import and call it |

### What is `async/await`?

Database operations take time (maybe 500ms). Without `await`, JavaScript would move to the next line before the database has responded. `await` pauses execution until the operation completes.

```javascript
// WITHOUT await (BAD):
const conn = mongoose.connect(URL);  // conn = Promise (not the result yet!)
console.log(conn);  // "[object Promise]" — useless!

// WITH await (GOOD):
const conn = await mongoose.connect(URL);  // conn = actual connection object
console.log(conn.connection.host);  // "cluster0.mongodb.net" — the real data!
```

---

## 7. Database Models (Schemas)

A **Schema** is a blueprint that defines what data a document must have, what types they are, and what constraints apply. Think of it as a form template — it defines which fields exist and what kind of data goes into each field.

### 7.1 User Model

📁 File: [User.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/User.js)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, unique: true, sparse: true },
  role:         { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  city:         { type: String },
  address:      { type: String },
  lat:          { type: Number },
  lng:          { type: Number },
  profileImage: { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

userSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('User', userSchema);
```

**Field-by-field explanation:**

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `name` | String | `required`, `trim` | User's full name. `trim` removes extra spaces |
| `email` | String | `required`, `unique`, `lowercase` | Login identifier. `unique` = no two users can have the same email. `lowercase` = auto-converts "Priya@Email.com" → "priya@email.com" |
| `phone` | String | `unique`, `sparse` | Phone number. `sparse` = only enforces uniqueness on documents that HAVE a phone (allows multiple users without phone) |
| `role` | String | `enum` = only 3 values allowed | Which type of user: customer, provider, or admin |
| `city` | String | optional | User's city for location-based matching |
| `lat`, `lng` | Number | optional | GPS coordinates for distance calculation |
| `profileImage` | String | default: `''` | URL to their profile picture on Cloudinary |
| `isActive` | Boolean | default: `true` | Admin can deactivate accounts by setting this to `false` |
| `timestamps: true` | — | automatic | Adds `createdAt` and `updatedAt` fields automatically |

**Index:** `userSchema.index({ lat: 1, lng: 1 })` — Creates a **database index** on lat/lng fields. Like a book's index lets you find pages faster, a database index speeds up location queries enormously.

**`mongoose.model('User', userSchema)`** — Registers the schema as a model named "User". Mongoose automatically creates a collection called "users" (lowercase + plural).

---

### 7.2 ServiceProvider Model

📁 File: [ServiceProvider.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/ServiceProvider.js)

This is an **extension** of the User model for providers only.

| Field | Purpose |
|---|---|
| `userId` | **Reference** to the User document (links to User._id). `unique: true` = one profile per user |
| `bio` | Short description about themselves |
| `skills` | Array of strings like `["AC Repair", "Plumbing"]` |
| `experienceYears` | How many years of experience |
| `avgRating` | Calculated average rating (0-5 stars) |
| `totalJobs` | Counter of completed jobs |
| `isVerified` | Admin has verified this provider's identity |
| `isAvailable` | Provider can toggle this on/off (like "online" status) |
| `documents` | Array of URLs to uploaded ID/certificate documents |

**Why a separate model?** Not every user is a provider. Keeping provider-specific data in a separate collection avoids empty fields on customer documents and keeps the data clean.

**The `ref: 'User'` pattern:**
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```
This creates a **reference** (foreign key). The `userId` field stores the ObjectId of a User document. Later, we can **populate** it — Mongoose will automatically replace the ID with the full User document:
```javascript
// Without populate:
provider.userId → "65f2a1b3c4d5e6f7a8b9c0d1"

// With populate:
provider.userId → { _id: "65f...", name: "Rajesh", email: "rajesh@email.com", ... }
```

---

### 7.3 Request Model

📁 File: [Request.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Request.js)

The core of the platform — repair requests posted by customers.

| Field | Purpose |
|---|---|
| `customerId` | Reference → User who posted the request |
| `title` | Short description: "AC not cooling" |
| `description` | Detailed description of the problem |
| `category` | One of 9 predefined categories (AC, Plumbing, Electrical, etc.) |
| `status` | Lifecycle state — see diagram below |
| `budgetMin/budgetMax` | Customer's budget range |
| `urgency` | `normal`, `urgent`, or `emergency` |
| `lat/lng/city/address` | Location of the repair job |
| `images` | Array of Cloudinary image URLs (photos of the broken item) |

**Request Status Lifecycle:**

```mermaid
stateDiagram-v2
    [*] --> open: Customer posts request
    open --> quoted: First provider sends a quote
    quoted --> quoted: More providers send quotes
    quoted --> booked: Customer accepts a quote
    booked --> in_progress: Provider starts the job
    in_progress --> completed: Provider finishes
    open --> cancelled: Customer cancels
    booked --> cancelled: Either party cancels
```

**Compound Index:** `requestSchema.index({ status: 1, category: 1 })` — Speeds up queries like "find all open AC Repair requests".

---

### 7.4 Quote Model

📁 File: [Quote.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Quote.js)

A **quote** is a provider's bid on a request — "I'll fix it for ₹1500 in 2 hours."

| Field | Purpose |
|---|---|
| `requestId` | Which repair request this quote is for |
| `providerId` | Which ServiceProvider sent this quote |
| `price` | How much the provider charges |
| `etaHours` | Estimated time to complete (in hours) |
| `message` | Optional message explaining their approach |
| `status` | `pending` → `accepted` or `rejected` |

**Unique Compound Index:**
```javascript
quoteSchema.index({ requestId: 1, providerId: 1 }, { unique: true });
```
This prevents a provider from sending TWO quotes on the same request. The combination of (requestId + providerId) must be unique.

---

### 7.5 Booking Model

📁 File: [Booking.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Booking.js)

Created when a customer **accepts** a quote. Represents a confirmed job.

| Field | Purpose |
|---|---|
| `requestId` | The original repair request |
| `quoteId` | The accepted quote (unique = one booking per quote) |
| `customerId` | The customer |
| `providerId` | The assigned provider |
| `status` | `confirmed` → `in_progress` → `completed` (or `disputed`/`cancelled`) |
| `scheduledAt` | When the job is scheduled |
| `completedAt` | Timestamp when provider marks it done |

---

### 7.6 Message Model

📁 File: [Message.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Message.js)

Each chat message between a customer and provider within a booking.

| Field | Purpose |
|---|---|
| `bookingId` | Which booking's chat this message belongs to |
| `senderId` | Who sent the message |
| `content` | The actual text |
| `messageType` | `text` or `image` |
| `isRead` | Whether the receiver has seen it |
| `sentAt` | Timestamp |

---

### 7.7 Review Model

📁 File: [Review.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Review.js)

One review per booking (enforced by `unique: true` on bookingId).

| Field | Purpose |
|---|---|
| `bookingId` | The completed booking being reviewed (unique) |
| `reviewerId` | Who wrote the review (customer) |
| `revieweeId` | Who is being reviewed (provider) |
| `rating` | 1-5 stars (validated with `min: 1, max: 5`) |
| `comment` | Optional text feedback |

---

### 7.8 Payment Model

📁 File: [Payment.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Payment.js)

Tracks Razorpay payment records.

| Field | Purpose |
|---|---|
| `bookingId` | Which booking this payment is for |
| `amount` | Amount in INR |
| `razorpayOrderId` | Razorpay's order ID (used to track the payment on Razorpay's servers) |
| `razorpayPaymentId` | Filled after successful payment |
| `status` | `pending` → `success` or `failed` |
| `paidAt` | Timestamp of successful payment |

---

### 7.9 Notification Model

📁 File: [Notification.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Notification.js)

In-app notification system.

| Field | Purpose |
|---|---|
| `userId` | Who should see this notification |
| `type` | Category: `new_quote`, `quote_accepted`, `booking_completed`, `payment_success`, etc. |
| `message` | Human-readable message text |
| `relatedId` | ObjectId of the related resource (booking, quote, etc.) for deep-linking |
| `isRead` | Whether the user has seen it |

---

### 7.10 OTP Model

📁 File: [Otp.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/models/Otp.js)

Temporary one-time passwords for login.

```javascript
const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});
```

**Key detail — `expires: 600`:** This is a **TTL (Time To Live) index**. MongoDB will **automatically delete** documents 600 seconds (10 minutes) after `createdAt`. This means old OTP codes clean themselves up without any manual cleanup code!

---

### Full Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| ServiceProvider : "has provider profile"
    User ||--o{ Request : "posts"
    User ||--o{ Booking : "is customer in"
    User ||--o{ Booking : "is provider in"
    User ||--o{ Notification : "receives"
    User ||--o{ Review : "writes"
    User ||--o{ Message : "sends"
    
    Request ||--o{ Quote : "receives"
    Request ||--|| Booking : "becomes"
    
    Quote }o--|| ServiceProvider : "from"
    Quote ||--o| Booking : "accepted into"
    
    Booking ||--o{ Message : "has chat"
    Booking ||--o| Review : "gets reviewed"
    Booking ||--o| Payment : "gets paid"
```

---

## 8. Authentication System

Our auth system uses **OTP-based email authentication** — no passwords are stored anywhere.

📁 File: [routes/auth.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/routes/auth.js)

### How Login Works (Step by Step)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant E as Gmail SMTP
    
    U->>F: Types email, clicks "Continue"
    F->>B: POST /api/auth/send-otp { email }
    B->>DB: Check if user exists
    
    alt User exists
        B->>B: Generate 6-digit OTP
        B->>B: Hash OTP with bcrypt
        B->>DB: Save hashed OTP + expiry
        B->>E: Send email with plain OTP
        E->>U: Email arrives with OTP code
        B->>F: { exists: true, message: "OTP sent" }
        
        U->>F: Types OTP digits
        F->>B: POST /api/auth/verify-otp { email, otp }
        B->>DB: Find latest OTP for email
        B->>B: bcrypt.compare(submitted, stored)
        
        alt OTP correct
            B->>DB: Delete all OTPs for this email
            B->>B: Create JWT token
            B->>F: Set cookie + return user data
            F->>U: Redirect to dashboard
        else OTP wrong
            B->>F: { error: "Invalid OTP" }
        end
    else User does NOT exist
        B->>F: { exists: false }
        F->>U: Redirect to onboarding page
    end
```

### Key Code Explained

**OTP Generation:**
```javascript
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
```
- `Math.random()` generates a number between 0 and 1
- Multiplied by 900000 and added to 100000 = always a 6-digit number (100000-999999)

**OTP Hashing (Security):**
```javascript
const hashed = await bcrypt.hash(otpCode, 10);
```
- The OTP is **hashed** before storing in the database
- **Hashing** = one-way encryption (you can't reverse it)
- Even if a hacker steals the database, they see `$2a$10$Kj...` instead of `482910`
- The number `10` = salt rounds (how many times to process the hash, more = slower but more secure)

**OTP Verification:**
```javascript
const valid = await bcrypt.compare(otp, record.otp);
```
- `bcrypt.compare` takes the plain OTP the user entered and the hashed OTP from the database
- Returns `true` if they match, `false` if not

**Rate Limiting:**
```javascript
const recent = await Otp.countDocuments({
  email: email.toLowerCase(),
  createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
});
if (recent >= 3) return res.status(429).json({ error: 'Too many OTP requests.' });
```
- Counts how many OTPs were sent to this email in the last 15 minutes
- If 3 or more, blocks with HTTP 429 (Too Many Requests)
- Prevents abuse (someone spamming the send-OTP endpoint)

**JWT Token Creation:**
```javascript
const createToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
```
- **JWT** = a digitally signed string containing user data
- `jwt.sign(payload, secret, options)` creates the token
- The **payload** contains the user's ID, role, and email
- The **secret** is a random string only the server knows (used to verify the token wasn't tampered with)
- `expiresIn: '7d'` = token is valid for 7 days

**Setting the Cookie:**
```javascript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
};
res.cookie('repair_connect_token', token, cookieOptions);
```
- `httpOnly: true` — JavaScript in the browser **cannot** read this cookie (prevents XSS attacks)
- `secure: true` (in production) — cookie only sent over HTTPS
- `sameSite: 'lax'` — cookie sent on same-site requests (prevents CSRF attacks)
- The cookie is named `repair_connect_token`

---

## 9. Middleware — The Security Guards

📁 File: [middleware/auth.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/middleware/auth.js)

**Middleware** = functions that run BEFORE the actual route handler. Like security guards checking your ID at a building entrance.

### The `protect` Middleware

```javascript
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.repair_connect_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
```

Step by step:
1. **Read the JWT** from the cookie
2. If no cookie → return 401 (Unauthorized)
3. **Verify the JWT** using the secret key (checks if it was tampered with and not expired)
4. **Find the user** in the database by the ID inside the JWT
5. If user doesn't exist or is deactivated → return 401
6. **Attach the user to `req.user`** so route handlers can access the logged-in user
7. Call `next()` to pass control to the next middleware or route handler

### The `authorize` Middleware

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
};
```

- A **factory function** — it returns a middleware function
- `...roles` = accepts multiple arguments like `authorize('customer')` or `authorize('customer', 'admin')`
- Checks if the logged-in user's role is in the allowed list
- 403 = Forbidden (you're logged in, but you don't have permission)

**How they're used together:**
```javascript
router.post('/', protect, authorize('customer'), async (req, res) => { ... });
```
This route runs three steps in order:
1. `protect` — is the user logged in? ✅
2. `authorize('customer')` — is the user a customer? ✅
3. Route handler — create the request ✅

---

## 10. API Routes — The Endpoints

### 10.1 Requests Routes (the most complex)

📁 File: [routes/requests.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/routes/requests.js)

#### Haversine Distance Calculation

```javascript
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;  // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

- The **Haversine formula** calculates the distance between two GPS coordinates on Earth's surface
- Used to find "requests within 25km of a provider's location"
- Returns distance in kilometers

#### Creating a Request

```javascript
router.post('/', protect, authorize('customer'), async (req, res) => {
  const { title, description, category, budgetMin, budgetMax, urgency, lat, lng, city, address, images } = req.body;
  const request = await Request.create({
    customerId: req.user._id, title, description, category,
    budgetMin, budgetMax, urgency, lat, lng, city, address, images: images || [],
  });
  res.status(201).json({ request });
});
```
- Only customers can create requests (`authorize('customer')`)
- `req.user._id` = the customer's ID (set by `protect` middleware)
- `Request.create(...)` = inserts a new document into the "requests" collection
- HTTP 201 = Created (standard response for successful creation)

#### Listing Requests with Distance Filtering

```javascript
router.get('/', protect, async (req, res) => {
  const { category, urgency, status, lat, lng, radius = 25, page = 1, limit = 20, mine } = req.query;
  // ... filters ...
  
  if (lat && lng) {
    requests = requests
      .map((r) => {
        const dist = getDistanceKm(Number(lat), Number(lng), r.lat, r.lng);
        return { ...r.toObject(), distance: Math.round(dist * 10) / 10 };
      })
      .filter((r) => r.distance <= Number(radius))
      .sort((a, b) => a.distance - b.distance);
  }
});
```
- `req.query` = URL parameters like `?category=Plumbing&radius=10`
- If lat/lng are provided (provider browsing), calculates distance to each request
- Filters out requests beyond the radius
- Sorts by closest first
- Each request gets a `distance` field added

### 10.2 Quotes Routes

📁 File: [routes/quotes.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/routes/quotes.js)

#### Accepting a Quote (Most Important Business Logic)

When a customer accepts a quote, a chain of events happens:

```javascript
router.patch('/:id/accept', protect, async (req, res) => {
  // 1. Find the quote
  const quote = await Quote.findById(req.params.id);
  
  // 2. Accept this quote
  quote.status = 'accepted';
  await quote.save();
  
  // 3. Reject ALL other quotes for this request
  await Quote.updateMany(
    { requestId: request._id, _id: { $ne: quote._id } },
    { status: 'rejected' }
  );
  
  // 4. Update request status to "booked"
  request.status = 'booked';
  await request.save();
  
  // 5. Create a Booking
  const booking = await Booking.create({
    requestId: request._id,
    quoteId: quote._id,
    customerId: req.user._id,
    providerId: provider.userId,
  });
  
  // 6. Notify the provider
  await Notification.create({
    userId: provider.userId,
    type: 'quote_accepted',
    message: `Your quote of ₹${quote.price} for "${request.title}" was accepted!`,
    relatedId: booking._id,
  });
});
```

`$ne` = MongoDB operator meaning "not equal". So `_id: { $ne: quote._id }` means "all quotes EXCEPT the accepted one."

### 10.3 Bookings Routes

📁 File: [routes/bookings.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/routes/bookings.js)

#### Status Updates with Side Effects

When a provider marks a booking as "completed":
1. Booking status → `completed`
2. Request status → `completed`  
3. Provider's `totalJobs` counter → incremented by 1
4. Customer gets a notification: "Your repair is done! Pay and review."

```javascript
if (status === 'completed') {
  booking.status = 'completed';
  booking.completedAt = new Date();
  // Update related request
  const request = await Request.findById(booking.requestId);
  if (request) { request.status = 'completed'; await request.save(); }
  // Increment provider stats
  const provider = await ServiceProvider.findOne({ userId: booking.providerId });
  if (provider) { provider.totalJobs += 1; await provider.save(); }
  // Notify customer
  await Notification.create({ ... });
}
```

### 10.4 Payments Routes

📁 File: [routes/payments.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/routes/payments.js)

#### Razorpay Payment Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend
    participant R as Razorpay

    C->>F: Clicks "Pay Now"
    F->>B: POST /api/payments/create-order { bookingId, amount }
    B->>R: razorpay.orders.create({ amount * 100 })
    R->>B: { orderId: "order_abc123" }
    B->>DB: Save Payment record (pending)
    B->>F: { orderId, amount, currency }
    F->>R: Open Razorpay checkout popup
    C->>R: Enters card details → pays
    R->>F: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    F->>B: POST /api/payments/verify { all 3 values }
    B->>B: Verify signature using HMAC-SHA256
    B->>DB: Update Payment → status: "success"
    B->>DB: Create notifications for both parties
    B->>F: { success: true }
```

**Signature Verification (prevents fraud):**
```javascript
const body = razorpayOrderId + '|' + razorpayPaymentId;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');

if (expectedSignature !== razorpaySignature) {
  return res.status(400).json({ error: 'Invalid payment signature.' });
}
```
- Combines orderId + paymentId, hashes them with the secret key
- If the resulting hash matches what Razorpay sent, the payment is genuine
- This prevents someone from faking a successful payment

---

## 11. Real-Time Communication — Socket.io

📁 File: [socket/index.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/socket/index.js)

### What is Socket.io?

Normal HTTP is like sending letters — you send a request, wait for a response. **WebSockets** (powered by Socket.io) are like a phone call — the connection stays open and both sides can talk at any time without waiting.

This enables:
- **Live chat** — messages appear instantly without refreshing
- **Typing indicators** — "User is typing..."
- **Real-time notifications** — new quote alert pops up immediately

### How It Works

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as Socket Server
    participant P as Provider

    C->>S: connect()
    P->>S: connect()
    
    C->>S: join_room({ bookingId: "abc" })
    P->>S: join_room({ bookingId: "abc" })
    
    Note over S: Both are now in room "booking_abc"
    
    C->>S: send_message({ content: "When can you come?" })
    S->>DB: Save message to MongoDB
    S->>C: receive_message({ ... })
    S->>P: receive_message({ ... })
    
    P->>S: typing({ bookingId: "abc" })
    S->>C: user_typing
    
    P->>S: send_message({ content: "I'll be there at 3 PM" })
    S->>DB: Save message
    S->>C: receive_message({ ... })
    S->>P: receive_message({ ... })
```

### Key Socket Events

| Event | Direction | Purpose |
|---|---|---|
| `join_user` | Client → Server | Join a personal notification room |
| `join_room` | Client → Server | Join a booking's chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client(s) | Broadcast new message to room members |
| `typing` | Client → Server | User started typing |
| `user_typing` | Server → Other clients | Notify others someone is typing |
| `stop_typing` | Client → Server | User stopped typing |
| `message_read` | Client → Server | Messages were read |

**Room concept:** When both users `join_room({ bookingId: "abc" })`, they both enter the room `"booking_abc"`. When a message is sent to this room via `io.to('booking_abc').emit(...)`, both users receive it.

---

## 12. Utilities

### 12.1 Mailer (Nodemailer)

📁 File: [utils/mailer.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/utils/mailer.js)

Creates a **transporter** using Gmail SMTP (Simple Mail Transfer Protocol) and sends HTML-formatted OTP emails.

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD,  // App-specific password (not your login password)
  },
});
```

> [!IMPORTANT]
> You need a **Gmail App Password** (not your regular password). Go to Google Account → Security → 2-Step Verification → App passwords → Generate one.

### 12.2 Razorpay Instance

📁 File: [utils/razorpay.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/utils/razorpay.js)

Simply initializes the Razorpay SDK with API keys from environment variables.

### 12.3 Cloudinary + Multer

📁 File: [config/cloudinary.js](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/config/cloudinary.js)

- **Cloudinary** = cloud-based image hosting (images are stored on Cloudinary's servers, not ours)
- **Multer** = middleware that handles file uploads (reads the file from the HTTP request)
- Together: Multer reads the uploaded file → sends it to Cloudinary → returns a URL

---

## 13. Data Flow Diagrams

### Complete Request → Booking → Payment Flow

```mermaid
graph TB
    subgraph "Customer Flow"
        A["Customer posts repair request"] --> B["Request saved in DB<br/>status: open"]
    end
    
    subgraph "Provider Flow"
        B --> C["Providers browse nearby requests<br/>(Haversine distance filter)"]
        C --> D["Provider sends a quote<br/>(price, ETA, message)"]
        D --> E["Request status: quoted"]
    end
    
    subgraph "Matching"
        E --> F["Customer reviews quotes"]
        F --> G["Customer accepts best quote"]
        G --> H["Booking created<br/>Other quotes rejected<br/>Request status: booked"]
    end
    
    subgraph "Execution"
        H --> I["Customer & Provider chat<br/>(Socket.io real-time)"]
        I --> J["Provider starts job<br/>status: in_progress"]
        J --> K["Provider completes job<br/>status: completed"]
    end
    
    subgraph "Payment & Review"
        K --> L["Customer pays via Razorpay"]
        L --> M["Customer leaves review<br/>(1-5 stars + comment)"]
        M --> N["Provider rating updated"]
    end
```

---

## 14. Environment Variables

📁 File: [.env.example](file:///E:/Web%20Practice%202026/repair%20connect%201/backend/.env.example)

```env
PORT=5000                          # Server port
MONGODB_URI=mongodb+srv://...      # MongoDB connection string
JWT_SECRET=your-random-secret      # Used to sign/verify JWT tokens
CLIENT_URL=http://localhost:5173   # Frontend URL for CORS

# Gmail SMTP (for sending OTP emails)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx  # App password, NOT your login password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc-xyz

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=secret_xxx
```

> [!CAUTION]
> Never commit the `.env` file to Git! It contains passwords and API keys. Only commit `.env.example` as a template.
