import http from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, "data");
const menu = [
  { id: 1, name: "Biscoff Velvet Latte", price: 199 },
  { id: 2, name: "Waffle Pops", price: 209 },
  { id: 3, name: "Penne Veg Pasta", price: 299 },
  { id: 4, name: "Lebanese Power Bowl", price: 299 },
  { id: 5, name: "Brew Special Meal", price: 349 },
  { id: 6, name: "Biscoff Cheesecake", price: 209 },
  { id: 7, name: "Classic Sub Sandwich", price: 249 },
  { id: 8, name: "Bruschetta Mozzarella", price: 249 },
  { id: 9, name: "Loaded Nachos", price: 249 },
  { id: 10, name: "Classic French Toast", price: 209 },
  { id: 11, name: "French Chocolate Croissant", price: 199 },
  { id: 12, name: "Honey Butter Toast", price: 209 },
  { id: 13, name: "Nutella Croffle", price: 249 },
  { id: 14, name: "Tiramisu", price: 209 },
];

async function readRecords(file) {
  try {
    return JSON.parse(await readFile(path.join(dataDirectory, file), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveRecord(file, record) {
  await mkdir(dataDirectory, { recursive: true });
  const records = await readRecords(file);
  records.push(record);
  await writeFile(path.join(dataDirectory, file), `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function send(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 20_000) throw new Error("Request is too large.");
  }
  return JSON.parse(body || "{}");
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/api/health") {
      return send(response, 200, { ok: true });
    }

    if (request.method !== "POST") return send(response, 404, { error: "Endpoint not found." });
    const body = await readBody(request);

    if (url.pathname === "/api/orders") {
      const name = String(body.name || "").trim();
      const phone = String(body.phone || "").trim();
      if (name.length < 2 || name.length > 100) return send(response, 400, { error: "Enter your name." });
      if (!/^[+\d][\d\s()-]{7,19}$/.test(phone)) return send(response, 400, { error: "Enter a valid phone number." });
      if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) {
        return send(response, 400, { error: "Your cart is empty." });
      }
      const items = body.items.map(({ id, quantity }) => {
        const product = menu.find((item) => item.id === Number(id));
        const count = Number(quantity);
        if (!product || !Number.isInteger(count) || count < 1 || count > 50) throw new Error("Invalid cart item.");
        return { ...product, quantity: count, lineTotal: product.price * count };
      });
      const order = {
        id: randomUUID(),
        name,
        phone,
        notes: String(body.notes || "").trim().slice(0, 500),
        items,
        total: items.reduce((sum, item) => sum + item.lineTotal, 0),
        status: "received",
        createdAt: new Date().toISOString(),
      };
      await saveRecord("orders.json", order);
      return send(response, 201, { message: "Order received.", order });
    }

    if (url.pathname === "/api/reservations") {
      const name = String(body.name || "").trim();
      const phone = String(body.phone || "").trim();
      const date = String(body.date || "");
      const time = String(body.time || "");
      const guests = Number(body.guests);
      if (name.length < 2 || name.length > 100) return send(response, 400, { error: "Enter your name." });
      if (!/^[+\d][\d\s()-]{7,19}$/.test(phone)) return send(response, 400, { error: "Enter a valid phone number." });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
        return send(response, 400, { error: "Choose a valid reservation date." });
      }
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return send(response, 400, { error: "Choose a reservation time." });
      if (!Number.isInteger(guests) || guests < 1 || guests > 20) return send(response, 400, { error: "Choose 1 to 20 guests." });
      const reservation = {
        id: randomUUID(), name, phone, date, time, guests,
        notes: String(body.notes || "").trim().slice(0, 500),
        status: "requested", createdAt: new Date().toISOString(),
      };
      await saveRecord("reservations.json", reservation);
      return send(response, 201, { message: "Reservation request received.", reservation });
    }

    return send(response, 404, { error: "Endpoint not found." });
  } catch (error) {
    const status = error instanceof SyntaxError || error.message === "Invalid cart item." ? 400 : 500;
    return send(response, status, {
      error: error instanceof SyntaxError ? "Invalid JSON request." : error.message || "Something went wrong.",
    });
  }
});

const port = Number(process.env.API_PORT || 3001);
server.listen(port, () => console.log(`Brew Haus API listening on http://localhost:${port}`));
