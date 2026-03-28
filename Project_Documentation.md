# Repair Connect: Project Architecture & Technical Concepts

This document provides a comprehensive overview of the technical topics, concepts, and technologies utilized in the **Repair Connect** platform. Repair Connect is a two-sided service marketplace connecting customers looking for repair services with service providers (technicians/mechanics).

## 1. Core Stack (MERN)
The project is built on the popular MERN stack, ensuring a robust, scalable, and full JavaScript ecosystem.
*   **MongoDB:** NoSQL database used to store application data (users, requests, bookings, messages).
*   **Express.js:** Web application framework for Node.js, used to build the RESTful backend API.
*   **React.js:** Frontend library used to build the interactive, single-page application (SPA).
*   **Node.js:** JavaScript runtime environment executing the backend server.

## 2. Authentication & Security
The application implements secure, state-less authentication and role-based access.
*   **JSON Web Tokens (JWT):** Used for stateless authentication. Tokens are generated upon login/registration and passed via HTTP-only cookies or headers to authorize subsequent API requests.
*   **Password Hashing (Bcrypt.js):** Passwords are securely hashed with salts before being stored in the database to prevent plaintext data breaches.
*   **OTP Verification (Nodemailer):** One-Time Passwords (OTPs) are sent via email for user verification (e.g., password resets or initial onboarding).
*   **Role-Based Access Control (RBAC):** Users are assigned specific roles (`customer`, `provider`, `admin`). The UI and backend endpoints conditionally render or authorize actions based on the user's role.

## 3. Real-Time Communication (WebSockets)
To facilitate seamless interaction between customers and providers, real-time features are integrated.
*   **Socket.io:** Used for bidirectional, event-based communication between the web client and the server.
*   **Live Chat:** Real-time messaging system allowing customers and providers to negotiate quotes and discuss repair details.
*   **Live Notifications:** Push notifications for events like "New Quote Received", "Booking Confirmed", or "New Message".

## 4. Payment Gateway Integration
*   **Razorpay:** Integrated for secure online transactions. This allows customers to pay for the booked repair services directly through the platform.

## 5. File & Media Management
*   **Cloudinary:** A cloud-based image and video management service used to store user avatars, portfolio images, and images of items needing repair.
*   **Multer:** Node.js middleware used for handling `multipart/form-data`, primarily used for uploading files to the server before they are sent to Cloudinary.

## 6. Frontend Architecture & Concepts
The React frontend is structured for maintainability and smooth user experience.
*   **Vite:** A fast frontend build tool and development server.
*   **React Router DOM:** Enables client-side routing, allowing users to navigate between pages (Home, Dashboards, Chat, Auth) without reloading the browser.
*   **Context API:** Built-in React logic used globally for state management (e.g., `AuthContext` to manage user sessions and `ToastContext` for global alert messages).
*   **Framer Motion:** Used for declarative and fluid animations and page transitions, enhancing the UI/UX.
*   **Component-Driven Architecture:** The UI is broken down into reusable components (layouts, shared UI elements, page-specific modules).

## 7. Backend Architecture & API Design
The Node.js backend follows a modular, scalable architecture.
*   **RESTful APIs:** Endpoints structured around resources (e.g., `/api/users`, `/api/bookings`, `/api/requests`).
*   **Mongoose ODM:** Object Data Modeling library providing a rigorous modeling environment for MongoDB. Used to define schemas, relationships, and validation rules.
*   **Controller/Route Separation:** Business logic is segmented into controllers (or route handlers) to keep the routing layer clean.
*   **Error Handling Middleware:** Centralized Express middleware to catch and format API errors uniformly before sending them to the client.

## 8. Domain-Driven Features (Service Marketplace Concepts)
The platform models real-world service marketplace workflows:
*   **Service Requests:** Customers create requests detailing their repair needs, attaching images and descriptions.
*   **Quoting System:** Providers can view requests and submit competitive quotes.
*   **Booking Lifecycle:** Customers review quotes, accept one, and generate a booking. The booking transitions through states (e.g., pending -> in-progress -> completed).
*   **Review & Rating System:** Post-service, customers can leave feedback and ratings for providers, building a trust ecosystem.
