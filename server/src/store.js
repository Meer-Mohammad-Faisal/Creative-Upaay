import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/bookings.json");
let queue = Promise.resolve();

async function read() {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return []; }
}

async function write(data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export const fileStore = {
  list: async (userId) => (await read()).filter((b) => b.userId === userId),
  occupied: async (showKey) => (await read()).filter((b) => b.showKey === showKey && b.status === "active").flatMap((b) => b.seats),
  create: (booking) => queue = queue.then(async () => {
    const all = await read();
    const unavailable = new Set(all.filter((b) => b.showKey === booking.showKey && b.status === "active").flatMap((b) => b.seats));
    if (booking.seats.some((seat) => unavailable.has(seat))) throw Object.assign(new Error("One or more seats were just booked"), { status: 409 });
    all.push(booking); await write(all); return booking;
  }),
  cancel: (id, userId) => queue = queue.then(async () => {
    const all = await read(); const item = all.find((b) => b.id === id && b.userId === userId);
    if (!item) throw Object.assign(new Error("Booking not found"), { status: 404 });
    item.status = "cancelled"; item.cancelledAt = new Date().toISOString(); await write(all); return item;
  })
};
