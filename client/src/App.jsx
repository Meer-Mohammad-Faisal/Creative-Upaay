import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, CalendarDays, Check, ChevronRight, CircleUserRound, Clock3, Heart, Home, MapPin, Search, Ticket, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { request } from "./api";
import { clearBooking, logout, selectMovie, setSchedule, setUser, toggleSeat } from "./store";

const dates = [8,9,10,11,12,13,14].map((day) => ({ day, label: ["Wed","Thu","Fri","Sat","Sun","Mon","Tue"][day-8], value: `2026-10-${day}` }));
const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Shell({ children, back, title, action, noNav = false }) {
  const nav = useNavigate(); const path = useLocation().pathname;
  return <main className="phone-shell">
    <header className="topbar">{back ? <button className="icon-btn" onClick={() => nav(-1)} aria-label="Back"><ArrowLeft size={18}/></button> : <span className="brand-mark">C</span>}<strong>{title || "CinePass"}</strong>{action || <span/>}</header>
    <div className="page">{children}</div>
    {!noNav && <nav className="bottom-nav">
      <Link className={path === "/" ? "active" : ""} to="/" aria-label="Home"><Home/></Link>
      <Link className={path.includes("booking") || path.includes("seats") ? "active" : ""} to="/bookings" aria-label="Tickets"><Ticket/></Link>
      <button aria-label="Favorites"><Heart/></button>
      <Link className={path.includes("profile") ? "active" : ""} to="/profile" aria-label="Profile"><CircleUserRound/></Link>
    </nav>}
  </main>;
}

function Progress({ step }) { return <div className="progress"><span style={{ width: `${step * 20}%` }}/></div>; }
function Empty({ children }) { return <div className="empty">{children}</div>; }
function ErrorBox({ error }) { return error ? <p className="error-box">{error}</p> : null; }

function HomePage() {
  const [movies, setMovies] = useState([]); const [query, setQuery] = useState(""); const dispatch = useDispatch(); const nav = useNavigate();
  useEffect(() => { request("/movies").then(setMovies); }, []);
  const filtered = movies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
  const open = (m) => { dispatch(selectMovie(m)); nav(`/movie/${m.id}`); };
  return <Shell><section className="welcome"><div><small>Welcome back</small><h1>What would you<br/>like to watch?</h1></div><div className="avatar">DU</div></section>
    <label className="search"><Search size={17}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search movies"/></label>
    <div className="section-title"><h2>Now Showing</h2><button>See all</button></div>
    <div className="movie-strip">{filtered.map((m) => <button className="movie-card" key={m.id} onClick={()=>open(m)}><img src={m.poster} alt=""/><strong>{m.title}</strong><span>{m.rating} · {m.duration}</span></button>)}</div>
    <div className="section-title"><h2>Coming Soon</h2><button>See all</button></div>
    <button className="coming" onClick={()=>filtered[3] && open(filtered[3])}><img src={movies[3]?.banner} alt=""/><span><strong>{movies[3]?.title || "Dune: Part Two"}</strong><small>Experience it on the big screen</small></span><ChevronRight/></button>
    <div className="section-title"><h2>Popular cinemas</h2></div><div className="cinema-row"><MapPin/><span><strong>The Grandview</strong><small>Riverside Mall · From ₹280</small></span></div>
  </Shell>;
}

function MoviePage() {
  const { movie } = useSelector((s)=>s.booking); const nav = useNavigate(); const dispatch = useDispatch(); const [data,setData]=useState(movie);
  const id = useLocation().pathname.split("/").pop(); useEffect(()=>{ if(!data) request(`/movies/${id}`).then((m)=>{setData(m);dispatch(selectMovie(m));}); },[id]);
  if(!data) return <Shell back title="Movie Details"><Empty>Loading movie…</Empty></Shell>;
  return <Shell back title="Movie Details" action={<button className="icon-btn" aria-label="Favorite"><Heart size={18}/></button>}><img className="hero" src={data.banner} alt={data.title}/><div className="title-row"><div><h1>{data.title}</h1><p>{data.year} · {data.rating} · {data.duration}</p></div><span className="rating">★ 8.6</span></div><div className="chips">{data.genres.map((g)=><span key={g}>{g}</span>)}</div><h3>Storyline</h3><p className="muted copy">{data.description}</p><h3>Formats</h3><div className="chips">{data.formats.map((g)=><span key={g}>{g}</span>)}</div><h3>Top Cast</h3><div className="cast">{data.cast.map((c,i)=><div key={c}><span>{c.split(" ").map(x=>x[0]).join("")}</span><small>{c}</small></div>)}</div><button className="primary sticky-cta" onClick={()=>nav("/schedule")}>Book Tickets</button></Shell>;
}

function SchedulePage() {
  const state=useSelector((s)=>s.booking); const dispatch=useDispatch(); const nav=useNavigate(); const [theatres,setTheatres]=useState([]); const [date,setDate]=useState(state.date);
  useEffect(()=>{ if(state.movie) request(`/movies/${state.movie.id}/schedules`).then(setTheatres); },[state.movie]); if(!state.movie) return <Navigate to="/"/>;
  const choose=(t,s,time)=>{dispatch(setSchedule({theatre:{id:t.id,name:t.name,address:t.address},date,time,format:s.format,screen:s.name,seatPrice:t.price}));nav("/seats");};
  return <Shell back title="Choose Showtime"><Progress step={1}/><div className="mini-movie"><img src={state.movie.poster} alt=""/><span><strong>{state.movie.title}</strong><small>{state.movie.duration} · {state.movie.genres.join(", ")}</small></span></div><h3>Select date</h3><div className="date-strip">{dates.map((d)=><button key={d.day} className={date===d.value?"selected":""} onClick={()=>setDate(d.value)}><small>{d.label}</small><strong>{d.day}</strong><span>Oct</span></button>)}</div><div className="filter-row"><strong>{theatres.length} cinemas</strong><button><MapPin size={15}/> Near me</button></div>{theatres.map((t)=><article className="theatre" key={t.id}><div><strong>{t.name}</strong><small>{t.address}</small></div>{t.screens.map((s)=><div className="screen-row" key={s.name}><span>{s.format}<small>{s.name}</small></span><div>{s.times.map((time)=><button key={time} onClick={()=>choose(t,s,time)}>{time}</button>)}</div></div>)}</article>)}</Shell>;
}

function SeatsPage() {
  const state=useSelector((s)=>s.booking); const dispatch=useDispatch(); const nav=useNavigate(); const [occupied,setOccupied]=useState([]); const [error,setError]=useState("");
  const key=[state.movie?.id,state.theatre?.id,state.date,state.time,state.screen].join("|");
  useEffect(()=>{ if(state.theatre) request(`/shows/${encodeURIComponent(key)}/seats`).then((r)=>setOccupied(r.occupied)); },[key]); if(!state.theatre) return <Navigate to="/schedule"/>;
  const pick=(seat)=>{if(state.selectedSeats.length>=6&&!state.selectedSeats.includes(seat)){setError("You can select up to 6 seats");return;} setError("");dispatch(toggleSeat(seat));};
  const total=state.selectedSeats.length*state.seatPrice;
  return <Shell back title="Select Seats"><Progress step={2}/><div className="seat-heading"><div><strong>Screen 1</strong><small>{state.time}</small></div><strong>{currency(total)}</strong></div><div className="screen-curve"><span>SCREEN</span></div><div className="seat-grid">{["A","B","C","D","E","F","G","H","J","K","L","M"].map((row)=><div className="seat-row" key={row}><b>{row}</b>{Array.from({length:12},(_,i)=>`${row}${i+1}`).map((seat)=><button key={seat} disabled={occupied.includes(seat)} className={state.selectedSeats.includes(seat)?"selected":""} onClick={()=>pick(seat)} aria-label={`Seat ${seat}`}>{seat.slice(1)}</button>)}</div>)}</div><div className="legend"><span><i/>Available</span><span><i className="occupied"/>Occupied</span><span><i className="chosen"/>Selected</span></div><ErrorBox error={error}/><button className="primary" disabled={!state.selectedSeats.length} onClick={()=>nav("/summary")}>View Booking Summary</button></Shell>;
}

function SummaryPage() {
  const s=useSelector((x)=>x.booking); const nav=useNavigate(); if(!s.selectedSeats.length)return <Navigate to="/seats"/>; const subtotal=s.selectedSeats.length*s.seatPrice,total=subtotal+s.bookingFee;
  return <Shell back title="Booking Summary"><Progress step={3}/><img className="summary-banner" src={s.movie.banner} alt=""/><h2>{s.movie.title}</h2><div className="summary-meta"><span><MapPin/>{s.theatre.name}</span><span><CalendarDays/>{new Date(`${s.date}T12:00:00`).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><span><Clock3/>{s.time}</span></div><div className="info-grid"><span><small>Screen</small><strong>{s.screen}</strong></span><span><small>Format</small><strong>{s.format}</strong></span><span><small>Seats</small><strong>{s.selectedSeats.join(", ")}</strong></span></div><div className="receipt"><span>{s.selectedSeats.length}x Tickets <strong>{currency(subtotal)}</strong></span><span>Booking Fee <strong>{currency(s.bookingFee)}</strong></span><hr/><span className="total">Total <strong>{currency(total)}</strong></span></div><button className="primary" onClick={()=>nav(s.user?"/checkout":"/login")}>Proceed to Payment</button></Shell>;
}

function LoginPage() {
  const [mode,setMode]=useState("login"),[form,setForm]=useState({name:"",email:"demo@cinema.com",password:"Demo@123"}),[error,setError]=useState(""); const dispatch=useDispatch(),nav=useNavigate();
  const submit=async(e)=>{e.preventDefault();setError("");try{const r=await request(`/auth/${mode}`,{method:"POST",body:JSON.stringify(form)});localStorage.setItem("cinema-token",r.token);dispatch(setUser(r.user));nav("/checkout");}catch(err){setError(err.message);}};
  return <Shell back title="Welcome" noNav><div className="auth-logo"><span className="brand-mark large">C</span><h1>{mode==="login"?"Sign in to continue":"Create your account"}</h1><p>Reserve your seats in just a few taps.</p></div><form className="form" onSubmit={submit}>{mode==="register"&&<label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>}<label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8}/></label><ErrorBox error={error}/><button className="primary">{mode==="login"?"Login":"Sign up"}</button></form><div className="demo"><strong>Demo credentials</strong><span>demo@cinema.com</span><span>Demo@123</span></div><button className="text-btn" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"New here? Create an account":"Already registered? Sign in"}</button></Shell>;
}

function CheckoutPage() {
  const s=useSelector((x)=>x.booking),dispatch=useDispatch(),nav=useNavigate(); const [method,setMethod]=useState("Credit/Debit Card"),[form,setForm]=useState({name:"Demo User",card:"4242 4242 4242 4242",expiry:"12/28",cvv:"123"}),[error,setError]=useState(""),[busy,setBusy]=useState(false),[fail,setFail]=useState(false); if(!s.user)return <Navigate to="/login"/>;
  const subtotal=s.selectedSeats.length*s.seatPrice,total=subtotal+s.bookingFee;
  const pay=async(e)=>{e.preventDefault();setBusy(true);setError("");try{if(method.includes("Card")&&(!/^\d{4} \d{4} \d{4} \d{4}$/.test(form.card)||!/^\d{2}\/\d{2}$/.test(form.expiry)||!/^\d{3}$/.test(form.cvv)))throw new Error("Check your card details");const booking=await request("/bookings",{method:"POST",body:JSON.stringify({showKey:[s.movie.id,s.theatre.id,s.date,s.time,s.screen].join("|"),movie:s.movie,theatre:s.theatre,date:s.date,time:s.time,format:s.format,screen:s.screen,seats:s.selectedSeats,subtotal,bookingFee:s.bookingFee,total,paymentMethod:method,paymentOutcome:fail?"failure":"success"})});dispatch(clearBooking());nav("/success",{state:{booking}});}catch(err){setError(err.message);}finally{setBusy(false);}};
  return <Shell back title="Checkout" noNav><Progress step={4}/><form className="form checkout" onSubmit={pay}><h3>Summary</h3><div className="receipt compact"><span>{s.selectedSeats.length}x Tickets <strong>{currency(subtotal)}</strong></span><span>Booking Fee <strong>{currency(s.bookingFee)}</strong></span><hr/><span className="total">Total <strong>{currency(total)}</strong></span></div><h3>Choose payment method</h3><div className="radio-row">{["Credit/Debit Card","Mobile Wallet"].map(m=><label key={m}><input type="radio" checked={method===m} onChange={()=>setMethod(m)}/>{m}</label>)}</div>{method.includes("Card")&&<><label>Name on card<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Card number<input inputMode="numeric" value={form.card} onChange={e=>setForm({...form,card:e.target.value})}/></label><div className="two-col"><label>Expiry date<input value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})}/></label><label>CVV<input type="password" value={form.cvv} onChange={e=>setForm({...form,cvv:e.target.value})}/></label></div></>}<label className="check"><input type="checkbox" checked={fail} onChange={e=>setFail(e.target.checked)}/> Simulate declined payment</label><ErrorBox error={error}/><button className="primary" disabled={busy}>{busy?"Processing…":"Complete Payment"}</button></form></Shell>;
}

function SuccessPage() { const booking=useLocation().state?.booking; const nav=useNavigate(); if(!booking)return <Navigate to="/bookings"/>; return <Shell noNav title=""><div className="success"><div className="checkmark"><Check/></div><h2>Payment Successful!</h2><p>Your seats are reserved.</p><TicketCard booking={booking}/><button className="primary" onClick={()=>nav("/bookings")}>View My Bookings</button><button className="text-btn" onClick={()=>nav("/")}>Back to home</button></div></Shell>; }

function TicketCard({booking,onCancel}) { return <article className={`ticket-card ${booking.status}`}><img src={booking.movie.banner} alt=""/><div className="ticket-body"><h3>{booking.movie.title}</h3><div className="ticket-info"><span><small>Cinema</small>{booking.theatre.name}</span><span><small>Screen</small>{booking.screen} · {booking.format}</span><span><small>Date</small>{new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><span><small>Time</small>{booking.time}</span><span><small>Seats</small>{booking.seats.join(", ")}</span><span><small>Amount Paid</small>{currency(booking.total)}</span></div><div className="ticket-footer"><div><small>Booking ID</small><strong>{booking.id}</strong>{booking.status==="active"&&onCancel&&<button className="danger" onClick={()=>onCancel(booking.id)}>Cancel Booking</button>}</div><QRCodeSVG value={booking.id} size={76}/></div>{booking.status==="cancelled"&&<b className="cancelled-label">CANCELLED</b>}</div></article>; }

function BookingsPage(){const [items,setItems]=useState([]),[error,setError]=useState("");const user=useSelector(s=>s.booking.user);const nav=useNavigate();const load=()=>request("/bookings").then(setItems).catch(e=>setError(e.message));useEffect(()=>{if(user)load();},[user]);if(!user)return <Shell back title="My Bookings"><Empty><Ticket size={36}/><h2>No tickets yet</h2><p>Sign in to view your bookings.</p><button className="primary" onClick={()=>nav("/login")}>Sign in</button></Empty></Shell>;const cancel=async(id)=>{if(!confirm("Cancel this booking and release its seats?"))return;try{await request(`/bookings/${id}/cancel`,{method:"PATCH"});load();}catch(e){setError(e.message)}};return <Shell back title="My Bookings"><div className="tabs"><button className="active">My Bookings</button><button>Past Bookings</button></div><ErrorBox error={error}/>{items.length?items.map(b=><TicketCard key={b.id} booking={b} onCancel={cancel}/>):<Empty><Ticket size={36}/><h2>No bookings yet</h2><p>Your movie tickets will appear here.</p></Empty>}</Shell>}

function ProfilePage(){const user=useSelector(s=>s.booking.user),dispatch=useDispatch(),nav=useNavigate();return <Shell back title="Profile"><div className="profile"><div className="avatar big">{user?.name?.split(" ").map(x=>x[0]).join("")||"GU"}</div><h2>{user?.name||"Guest"}</h2><p>{user?.email||"Sign in to manage your bookings"}</p>{user?<button className="outline" onClick={()=>{dispatch(logout());nav("/")}}>Sign out</button>:<button className="primary" onClick={()=>nav("/login")}>Sign in</button>}</div></Shell>}

export default function App(){return <Routes><Route path="/" element={<HomePage/>}/><Route path="/movie/:id" element={<MoviePage/>}/><Route path="/schedule" element={<SchedulePage/>}/><Route path="/seats" element={<SeatsPage/>}/><Route path="/summary" element={<SummaryPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/success" element={<SuccessPage/>}/><Route path="/bookings" element={<BookingsPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>}
