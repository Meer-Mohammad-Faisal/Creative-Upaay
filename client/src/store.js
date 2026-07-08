import { configureStore, createSlice } from "@reduxjs/toolkit";

const saved = JSON.parse(localStorage.getItem("cinema-state") || "null");
const initialState = saved || { movie: null, theatre: null, date: "2026-10-10", time: "10:00 AM", format: "2D", screen: "Screen 1", selectedSeats: [], seatPrice: 280, bookingFee: 20, user: null };
const booking = createSlice({ name: "booking", initialState, reducers: {
  selectMovie: (s, a) => { s.movie = a.payload; s.selectedSeats = []; },
  setSchedule: (s, a) => Object.assign(s, a.payload, { selectedSeats: [] }),
  toggleSeat: (s, a) => { const seat = a.payload; const i = s.selectedSeats.indexOf(seat); if (i >= 0) s.selectedSeats.splice(i, 1); else if (s.selectedSeats.length < 6) s.selectedSeats.push(seat); },
  clearBooking: (s) => { s.selectedSeats = []; },
  setUser: (s, a) => { s.user = a.payload; },
  logout: (s) => { s.user = null; localStorage.removeItem("cinema-token"); }
} });
export const { selectMovie, setSchedule, toggleSeat, clearBooking, setUser, logout } = booking.actions;
export const store = configureStore({ reducer: { booking: booking.reducer } });
store.subscribe(() => localStorage.setItem("cinema-state", JSON.stringify(store.getState().booking)));
