# CinePass - Creative Upaay Full Stack Assignment

A complete mobile-first movie ticket reservation application built from the supplied Figma. The UI is intentionally capped at `390px` and implements the full discovery-to-digital-ticket journey.

## Demo

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Email: `demo@cinema.com`
- Password: `Demo@123`
- Test card: `4242 4242 4242 4242`, expiry `12/28`, CVV `123`

## Implemented features

### Level 1

- Home page with now-showing, coming-soon, cinema, search and bottom navigation
- Movie detail, formats, cast and scheduling screens
- Horizontal date selector, cinemas, screens and showtimes
- Programmatic 12 x 12 seat matrix across rows A-M (I omitted, matching cinema convention)
- Available, occupied and selected seat states with a 6-seat limit
- Live ticket price and booking fee calculation
- Redux booking state persisted to local storage across refreshes
- Booking summary, payment, success and QR ticket screens
- Persistent booking API and booking cancellation that releases seats

### Level 2 / bonus

- Simulated payment success and explicit declined-payment path with validation
- JWT authentication and an evaluator-ready demo account
- MongoDB via Mongoose when `MONGODB_URI` is supplied
- Atomic serialized local reservations and conflict checks; Mongo reservations recheck the master seat state before confirmation
- Persistent local JSON fallback so the project runs without external credentials
- Booking history, QR tickets, transaction dates and cancellation

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run install:all
npm run dev
```

The app opens on `http://localhost:5173`. MongoDB is optional. To use it, copy `server/.env.example` to `server/.env`, set `MONGODB_URI`, and restart the API.

```bash
npm run build
```

## Architecture

`client/` contains a Vite React application. Redux Toolkit owns the selected movie, schedule, seats, price inputs and signed-in user; a store subscription persists that state. React Router keeps each Figma screen independently addressable.

`server/` contains an Express REST API. Catalog data is deterministic seed data. Confirmed bookings use MongoDB when configured, otherwise a serialized file store provides durable local persistence. The server, rather than the client, performs the final seat-conflict check before creating a booking.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service and persistence status |
| `GET` | `/api/movies` | Movie catalog |
| `GET` | `/api/movies/:id/schedules` | Cinema/showtime options |
| `GET` | `/api/shows/:showKey/seats` | Current occupied seats |
| `POST` | `/api/auth/login` | Authenticate and issue JWT |
| `POST` | `/api/auth/register` | Create demo user session |
| `GET` | `/api/bookings` | User booking history |
| `POST` | `/api/bookings` | Validate payment and reserve seats |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel and release seats |

## Assumptions

- Prices are in INR and vary by cinema.
- A transaction can contain at most six seats.
- The payment gateway is intentionally simulated as requested; checking "Simulate declined payment" exercises rollback behavior.
- Registration issues a valid demo JWT without persisting user profiles because the assignment evaluates the booking workflow rather than account administration.
- Poster and banner images are served from TMDB's public image CDN; all application code and booking data are local.

## Deployment

- Client: deploy `client/` to Vercel or Netlify and set `VITE_API_URL` to the API URL plus `/api`.
- Server: deploy `server/` to Render/Railway, set `CLIENT_URL`, `JWT_SECRET`, and `MONGODB_URI`, then use `npm start`.

## Suggested demo recording

1. Search and open **Meg 2: The Trench**.
2. Pick a cinema, date and time; select two seats and refresh to show Redux persistence.
3. Sign in with the visible demo credentials.
4. Complete payment and show the generated QR ticket.
5. Open **My Bookings**, cancel the ticket, then return to the same show to demonstrate released seats.
6. Optionally check **Simulate declined payment** to demonstrate failure handling without reserving seats.
