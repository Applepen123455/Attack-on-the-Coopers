const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let file = url.pathname === "/" ? "/index.html" : url.pathname;
  file = path.normalize(file).replace(/^(\.\.[\/\\])+/, "");
  const full = path.join(ROOT, file);

  if (!full.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(full).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
const rooms = new Map();

function getRoom(name) {
  if (!rooms.has(name)) {
    rooms.set(name, {
      seed: Date.now(),
      players: new Map(),
      roomStates: {},
      bossKills: 0,
      bossTotal: 3,
      dungeonLevel: 1
    });
  }
  return rooms.get(name);
}

function send(ws, msg) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

function broadcast(room, msg, except = null) {
  for (const [id, client] of room.players) {
    if (client.ws !== except) send(client.ws, msg);
  }
}

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomName = url.searchParams.get("room") || "coopers";
  const room = getRoom(roomName);
  const id = Math.random().toString(36).slice(2, 10);

  room.players.set(id, { ws, state: {} });

  send(ws, {
    type: "init",
    id,
    room: roomName,
    seed: room.seed,
    roomStates: room.roomStates,
    bossKills: room.bossKills,
    bossTotal: room.bossTotal,
    dungeonLevel: room.dungeonLevel || 1
  });

  broadcast(room, { type: "join", id }, ws);

  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === "player") {
      room.players.get(id).state = msg;
      broadcast(room, { ...msg, id }, ws);
      return;
    }

    if (msg.type === "roomClear" && msg.key) {
      room.roomStates[msg.key] = { ...(room.roomStates[msg.key] || {}), ...(msg.payload || {}), clr: 1 };
      broadcast(room, { type: "roomClear", key: msg.key, payload: room.roomStates[msg.key] });
      return;
    }

    if (msg.type === "bossProgress") {
      room.bossKills = Math.max(room.bossKills, msg.bossKills || 0);
      room.bossTotal = msg.bossTotal || room.bossTotal || 3;
      room.dungeonLevel = Math.max(room.dungeonLevel || 1, msg.dungeonLevel || 1);
      broadcast(room, { type: "bossProgress", bossKills: room.bossKills, bossTotal: room.bossTotal, dungeonLevel: room.dungeonLevel || 1 });
      send(ws, { type: "bossProgress", bossKills: room.bossKills, bossTotal: room.bossTotal, dungeonLevel: room.dungeonLevel || 1 });
      return;
    }
  });

  ws.on("close", () => {
    room.players.delete(id);
    broadcast(room, { type: "leave", id });
    if (room.players.size === 0) {
      // Keep the room alive for a while so reconnects do not reset instantly.
      setTimeout(() => {
        const r = rooms.get(roomName);
        if (r && r.players.size === 0) rooms.delete(roomName);
      }, 10 * 60 * 1000);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Attack on the Coopers multiplayer server running`);
  console.log(`Open on this computer: http://localhost:${PORT}?room=coopers`);
  console.log(`Other computers on same Wi-Fi: http://YOUR_IP_ADDRESS:${PORT}?room=coopers`);
});
