# 🪡 Stitch — Premium Tailoring & Cobbler SaaS

**Stitch** is a multi-tenant marketplace for tailoring and cobbler services. Customers
book vetted master tailors and expert cobblers, pay through a UPI QR flow, and track
their order through every step — while vendors manage fulfillment and admins keep the
network trusted.

> Master Tailors. Expert Cobblers. At Your Doorstep.

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 14 (App Router) + React 18  |
| Database   | PostgreSQL (Neon) via Prisma ORM    |
| Auth       | NextAuth (JWT sessions, role-based) |
| Styling    | Tailwind CSS (custom amber/gold + zinc theme) |
| Animation  | Framer Motion (cinematic SVG loader, scroll reveals) |
| Icons      | Lucide React                        |
| Payments   | Demo: mock UPI QR (qrcode.react) · Live: Razorpay |
| Validation | Zod                                 |

---

## 🚀 Setup

### 1. Clone & install

```bash
git clone <repo-url> stitch
cd stitch
npm install
```

### 2. Configure the database

Create a `.env` file at the project root with your Neon connection string:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
```

> Free tier: create one at [neon.tech](https://neon.tech) in under a minute.

### 3. Push the schema & seed demo data

```bash
npx prisma db push      # creates tables (Payment, StatusHistory, Order, Vendor, ...)
npm run db:seed         # seeds categories, demo users, a vendor + services
```

### 4. Run it

```bash
npm run dev             # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Handy scripts: `npm run db:studio` (Prisma Studio), `npm run db:push`, `npm run db:seed`.

---

## 🔐 Sign in with Google (optional)

Stitch supports Google OAuth **on top of** email/password — the Credentials provider is untouched.
With blank `GOOGLE_*` variables the feature is fully disabled and the Google button is hidden
automatically (the UI detects provider availability via `/api/auth/providers`).

### 1. Create OAuth credentials in Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create (or pick) a project.
2. **APIs & Services → OAuth consent screen** → choose **External**, fill in the app name and
   support email, then add yourself as a **test user** (while in *Testing* mode).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret**.

### 2. Fill in the environment

```env
GOOGLE_CLIENT_ID="<paste client id>"
GOOGLE_CLIENT_SECRET="<paste client secret>"
```

Then **restart the dev server** (`.env` changes only load at boot) and the
"Continue with Google" button appears on `/login` and the landing login modal.

### How it behaves

- **Choose your role first.** The Google button comes with a Customer / Vendor / Admin
  picker. The choice rides in a short-lived cookie, and after the redirect the
  `/oauth/welcome` bridge page applies it server-side (`POST /api/auth/oauth-role`):
  - **Customer** — default; lands on the marketplace (`/customer/vendors`).
  - **Vendor** — role upgraded *and* a business profile is provisioned (PENDING,
    awaiting admin approval — same as email signup).
  - **Admin** — requires the `ADMIN_INVITE_CODE` from `.env` (input appears when the
    Admin pill is selected). Without the code the sign-in proceeds with the
    existing/default role — nobody can self-assign admin.
  - Established roles are **never silently downgraded** (e.g. an admin choosing
    "Customer" stays admin). To change roles manually, use Prisma Studio
    (`npm run db:studio`).
- **First-time Google users** are provisioned automatically as `CUSTOMER`; the role
  picker (above) can immediately refine that.
- **Email linking:** if the Google email matches an existing password account, the accounts
  are linked (`allowDangerousEmailAccountLinking` — safe because Google emails are verified).
  The existing role is kept.
- The `jwt` callback re-syncs with the database on every sign-in **and every session
  access**, so sessions always carry the current Prisma `id` / `role` / `vendorId` —
  that's what makes the pre-redirect role choice appear in the session instantly.

> Google OAuth requires a public origin in production — register your deployed URL
> (e.g. `https://yourapp.com/api/auth/callback/google`) the same way.

### Troubleshooting: `error=access_denied` / "Access blocked"

If Google bounces you back with `?error=Callback` (the login page shows an amber
notice), the consent screen refused the sign-in. The usual causes, in order:

1. **The app is in Testing mode and your Google account isn't a test user** — open
   *OAuth consent screen → Audience / Test users → Add users* and add the Gmail
   address you're signing in with. (Publishing the app to *In production* removes
   this requirement.)
2. The consent screen was cancelled (Cancel / Deny) — just retry.
3. The redirect URI doesn't exactly match
   `http://localhost:3000/api/auth/callback/google` — but that usually errors
   earlier, at `redirect_uri_mismatch`.

---

## 💳 Payments: Demo vs Live (Razorpay)

Payments are environment-isolated via `NEXT_PUBLIC_PAYMENT_MODE` (see `src/lib/payments.ts`):

| | `demo` (default locally) | `live` |
| --- | --- | --- |
| Tracking page shows | Mock UPI QR (`stitch@upi`) + **Simulate Payment Success** | **Pay with UPI** → `POST /api/payments/create` |
| `POST /api/orders/[id]/pay` (mock confirm) | ✅ allowed | 🚫 **403 Forbidden** |
| Razorpay webhook `/api/webhooks/razorpay` | — | marks payment PAID (signature-verified) |

Locally, `.env.local` sets `demo`. For production, `.env.production` sets `live`.
⚠️ `.env.local` **overrides** `.env.production` — never deploy `.env.local` to your host.

### Switching to real payments

1. **Register at Razorpay** — [dashboard.razorpay.com](https://dashboard.razorpay.com) →
   *Settings → API Keys → Generate Key* → copy the **Key ID** and **Key Secret**.
2. **Set the env vars** on your production host (or in `.env.production`):
   ```env
   NEXT_PUBLIC_PAYMENT_MODE="live"
   NEXT_PUBLIC_APP_URL="https://<your-domain>"        # used to return users from Razorpay
   RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
   RAZORPAY_KEY_SECRET="xxxxxxxxxxxx"
   RAZORPAY_WEBHOOK_SECRET="a-strong-random-string"
   ```
3. **That's it for creation** — `POST /api/payments/create` is fully implemented:
   it creates a Razorpay **Payment Link** (hosted UPI checkout) via the REST API
   (no SDK needed), records a `PENDING` Payment row, and returns
   `{ paymentUrl }` — the client redirects to it and users land back on the
   tracking page afterwards.
4. **Set up the webhook** — Razorpay Dashboard → *Settings → Webhooks* → URL
   `https://<your-domain>/api/webhooks/razorpay`, events `payment_link.paid`,
   `payment.captured` + `payment.failed`, and put the same secret in
   `RAZORPAY_WEBHOOK_SECRET`. The handler verifies the HMAC signature
   (timing-safe), maps the event back to the order, and idempotently marks the
   payment PAID → order ACCEPTED → timeline updated.

---

## 🚢 Deployment (Vercel)

Pushes to `main` auto-deploy (Vercel Git integration). Set these env vars in
**Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Your Neon connection string (pooled) |
| `NEXTAUTH_URL` | `https://<your-domain>` |
| `NEXTAUTH_SECRET` | Long random string (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` |
| `NEXT_PUBLIC_PAYMENT_MODE` | `live` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | From Razorpay (empty = live checkout shows "not configured") |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth — add `https://<your-domain>/api/auth/callback/google` to the authorized redirect URIs |
| `ADMIN_INVITE_CODE` | Strong random string (NOT the demo one) |

Every page that reads the database is rendered dynamically
(`export const dynamic = "force-dynamic"`), so the build never touches Prisma —
it only needs the env vars at runtime.

---



## 🔑 Demo Credentials

All three demo accounts are seeded by `prisma/seed.ts` and available as **one-tap
quick-login pills** in the landing page's login modal.

| Role     | Email                | Password      | Lands on               |
| -------- | -------------------- | ------------- | ---------------------- |
| Admin    | `admin@stitch.dev`    | `admin123`    | `/admin/dashboard`     |
| Vendor   | `vendor@stitch.dev`   | `vendor123`   | `/vendor/dashboard`    |
| Customer | `customer@stitch.dev` | `customer123` | `/customer/vendors`    |

New accounts (customer or vendor) can be created at **`/signup`** — vendor profiles
start as `PENDING` and appear in the Admin approval queue.

---

## ✨ Features

### Cinematic Frontend
- **PremiumLoader** — a luxury-house opening sequence: a golden thread draws itself
  across a dark, film-grained stage, scissors snap it shut with spring physics, and the
  STITCH wordmark resolves from blur like a film title. Exits with a **curtain-split**
  reveal. Plays once per browser session (`sessionStorage`).
- **Single-page landing** — parallax hero over a tailored-suit photograph (Unsplash +
  `next/image`), marquee strip, four large interactive service cards with hover zoom +
  golden glow, a "Top Rated Professionals" showcase with verified badges, and a final CTA.
- **Auth modal** — spring-animated login with role-routed redirect and one-tap demo logins.
- **Signup page** — animated Customer/Vendor tabs; vendors register with business details.

### The Full Booking Loop (end-to-end)
1. **Book** — customer picks a service on a vendor card → `POST /api/orders` creates the
   order (`PENDING`, subtotal + 5% platform fee) and redirects to tracking.
2. **Pay** — the tracking page shows a real UPI deep-link QR (`upi://pay?...`) rendered
   with `qrcode.react`. "Simulate Payment Success" calls `POST /api/orders/[id]/pay` →
   Payment `PAID`, order `ACCEPTED`, history appended. In **live mode** this mock is
   403-blocked and Razorpay takes over (see "Payments: Demo vs Live").
3. **Fulfill** — vendor dashboard offers forward-only status moves
   (`ACCEPTED → PICKED_UP → IN_PROGRESS → READY → OUT_FOR_DELIVERY → DELIVERED`) via
   `POST /api/orders/[id]/status`; every change writes `StatusHistory`.
4. **Track** — the customer's animated vertical timeline fills with a golden thread as
   each step lands, with timestamps and notes.

### Role-Based Platform
- **Customer** — browse approved vendors, book services, pay, track orders.
- **Vendor** — studio dashboard with stats (awaiting payment / active / delivered /
  earnings), orders table, and status controls. Vendors can't accept unpaid orders.
- **Admin** — command center with platform stats (orders, paid revenue, users), vendor
  approval queue (`POST /api/admin/vendors/[id]`), and a recent-orders feed.
- **Middleware** (`withAuth`) gates `/admin/*`, `/vendor/*`, `/customer/*` by role;
  new signups can never self-assign `ADMIN`.

### Data Model (Prisma)
`User` (roles: CUSTOMER / VENDOR / ADMIN) · `Vendor` (PENDING / APPROVED / SUSPENDED) ·
`ServiceCategory` → `Service` · `Order` (status + paymentStatus) → `OrderItem` ·
`Payment` (UPI mock, UTR reference) · `StatusHistory` (full audit trail of the timeline).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # SPA landing page (loader + sections)
│   ├── layout.tsx                # Metadata, fonts, SessionProvider
│   ├── signup/ login/            # Auth pages
│   ├── admin/dashboard/          # Admin command center
│   ├── vendor/dashboard/         # Vendor studio
│   ├── customer/
│   │   ├── vendors/              # Marketplace search
│   │   └── orders/[id]/          # Tracking + UPI payment
│   └── api/
│       ├── auth/signup/          # Registration (customer & vendor)
│       ├── orders/               # Create order
│       ├── orders/[id]/pay/      # Mock UPI payment
│       ├── orders/[id]/status/   # Vendor fulfillment updates
│       └── admin/vendors/[id]/   # Vendor approval
├── components/
│   ├── landing/                  # PremiumLoader, HeroSection, ServiceGrid,
│   │                             # VendorShowcase, LoginModal, header, CTA, footer
│   ├── customer/                 # OrderTimeline, PaymentPanel, BookServiceForm
│   ├── vendor/                   # OrderStatusSelect
│   ├── admin/                    # ApproveVendorButton
│   └── dashboard/                # Shared dark dashboard header
├── lib/                          # prisma, auth, roles, utils
└── middleware.ts                 # Role-based route protection
```

---

## 🔒 Security Notes
- Passwords hashed with bcrypt (10 rounds); JWT sessions carry `id`, `role`, `vendorId`.
- Order ownership checks on payment & tracking; vendor checks on fulfillment;
  admin checks on approvals.
- All mutating APIs validate session + role server-side.

---

*Built with ❤️ (and a golden thread) — Stitch.*
