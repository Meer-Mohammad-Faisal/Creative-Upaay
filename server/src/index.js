import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import { movies, occupiedSeats, scheduleFor } from "./catalog.js";
import { fileStore } from "./store.js";

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || "creative-upaay-demo-secret";
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "https://creative-upaay-jaj6.vercel.app",
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(",").map((value) => value.trim()).filter(Boolean)
]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || origin.endsWith(".vercel.app")) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const bookingSchema = new mongoose.Schema({ id: { type: String, unique: true }, userId: String, showKey: String, movie: Object, theatre: Object, date: String, time: String, format: String, screen: String, seats: [String], subtotal: Number, bookingFee: Number, total: Number, status: String, paymentMethod: String, transactionDate: String, cancelledAt: String }, { versionKey: false });
bookingSchema.index({ showKey: 1, status: 1 });
const Booking = mongoose.model("Booking", bookingSchema);
let mongoReady = false;
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => { mongoReady = true; console.log("MongoDB connected"); }).catch((e) => console.warn("MongoDB unavailable, using local store:", e.message));

const demoUser = { id: "demo-user", name: "Demo User", email: "demo@cinema.com", passwordHash: bcrypt.hashSync("Demo@123", 10) };
const tokenFor = (user) => jwt.sign({ sub: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
const auth = (req, res, next) => { try { req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET); next(); } catch { res.status(401).json({ message: "Please sign in to continue" }); } };

app.get("/api/health", (_req, res) => res.json({ ok: true, database: mongoReady ? "mongodb" : "local-persistent-store" }));
app.get("/api/movies", (_req, res) => res.json(movies));
app.get("/api/movies/:id", (req, res) => { const movie = movies.find((m) => m.id === req.params.id); movie ? res.json(movie) : res.status(404).json({ message: "Movie not found" }); });
app.get("/api/movies/:id/schedules", (req, res) => res.json(scheduleFor(req.params.id)));
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email !== demoUser.email || !bcrypt.compareSync(password || "", demoUser.passwordHash)) return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: tokenFor(demoUser), user: { id: demoUser.id, name: demoUser.name, email: demoUser.email } });
});
app.post("/api/auth/register", (req, res) => { const { name, email, password } = req.body; if (!name || !email || (password || "").length < 8) return res.status(400).json({ message: "Enter a name, valid email and 8+ character password" }); const user = { id: nanoid(), name, email }; res.status(201).json({ token: tokenFor(user), user }); });
app.get("/api/shows/:showKey/seats", async (req, res, next) => { try { const booked = mongoReady ? (await Booking.find({ showKey: req.params.showKey, status: "active" })).flatMap((b) => b.seats) : await fileStore.occupied(req.params.showKey); res.json({ occupied: [...new Set([...occupiedSeats, ...booked])] }); } catch (e) { next(e); } });
app.get("/api/bookings", auth, async (req, res, next) => { try { const items = mongoReady ? await Booking.find({ userId: req.user.sub }).sort({ transactionDate: -1 }).lean() : await fileStore.list(req.user.sub); res.json(items.sort((a,b) => b.transactionDate.localeCompare(a.transactionDate))); } catch (e) { next(e); } });
app.post("/api/bookings", auth, async (req, res, next) => { try {
  const b = req.body; if (!b.seats?.length || !b.showKey || !b.movie || !b.total) return res.status(400).json({ message: "Incomplete booking details" });
  if (b.paymentOutcome === "failure") return res.status(402).json({ message: "Payment declined. No seats were charged." });
  const booking = { ...b, id: `CU-${nanoid(8).toUpperCase()}`, userId: req.user.sub, status: "active", transactionDate: new Date().toISOString() };
  if (mongoReady) {
    const conflicts = await Booking.find({ showKey: b.showKey, status: "active", seats: { $in: b.seats } });
    if (conflicts.length) return res.status(409).json({ message: "One or more seats were just booked" });
    await Booking.create(booking);
  } else await fileStore.create(booking);
  res.status(201).json(booking);
} catch (e) { next(e); } });
app.patch("/api/bookings/:id/cancel", auth, async (req, res, next) => { try { const item = mongoReady ? await Booking.findOneAndUpdate({ id: req.params.id, userId: req.user.sub, status: "active" }, { status: "cancelled", cancelledAt: new Date().toISOString() }, { new: true }).lean() : await fileStore.cancel(req.params.id, req.user.sub); if (!item) return res.status(404).json({ message: "Active booking not found" }); res.json(item); } catch (e) { next(e); } });
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.message || "Something went wrong" }); });
app.listen(PORT, () => console.log(`Cinema API running at http://localhost:${PORT}`));
