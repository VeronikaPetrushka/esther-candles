# ESTHER — wood candle storefront v2

Interactive React + TypeScript storefront for ESTHER handmade real-wood candles.

## Stack
- React 19
- TypeScript
- Vite 7
- GSAP + ScrollTrigger
- React Router
- Lucide icons

## Install
```bash
npm install
npm run dev
```

This project deliberately pins `@vitejs/plugin-react` to v5, which is compatible with Vite 7.

## Routes
- `/` — animated brand/storefront landing page
- `/catalog` — catalogue + filters
- `/product/:id` — product detail + image gallery
- `/cart` — shopping cart
- `/checkout` — customer, Nova Poshta and payment flow
- `/success/:orderId` — order confirmation

`vercel.json` includes the SPA rewrite needed for direct route refreshes on Vercel.

## Demo commerce behavior
Cart and demo orders are stored in `localStorage`, so the complete flow works without a backend.

Optional production hooks:
```env
VITE_ORDER_ENDPOINT=https://your-api.example/orders
VITE_PAYMENT_ENDPOINT=https://your-api.example/payments/create
```

When `VITE_ORDER_ENDPOINT` is configured, checkout POSTs the created order as JSON. When `VITE_PAYMENT_ENDPOINT` is configured and the customer chooses card payment, the project also POSTs payment details needed to create a server-side payment session.

> Product prices in `src/data/products.ts` are demo storefront values because prices were not present in the supplied ESTHER screenshots. Replace them with the real catalogue prices before production.

## Motion direction
The interaction system uses GSAP for:
- hero line/image reveal
- mouse depth and floating material nodes
- scroll-parallax typography
- pinned horizontal product archive
- scroll-based image masks and content reveals
- magnetic CTA behavior
- product hover image scaling / UI inversion
- continuous ticker/footer motion
- route transitions
- workshop modal entrance

Reduced-motion preferences are respected.

## Workshop reservations + admin

The homepage workshop calendar is now data-driven. The next published masterclass is displayed automatically, and visitors can click **«Зарезервувати місце»** or a highlighted calendar day to open the reservation form.

Demo admin: `/admin`

- Login: `admin`
- Password: `esther2026`
- Manage masterclasses (date, time, city, duration, capacity, price, description, publish/draft)
- View registrations with attendee, booking timestamp, event date/time and guest count
- Change registration status: new / confirmed / cancelled
- View locally created shop orders

Workshop and registration data currently persist in browser `localStorage` (`esther.workshops.v1` and `esther.workshopBookings.v1`). For production, replace this storage layer with Supabase or another backend so all devices share the same calendar and bookings.
# esther-candles
