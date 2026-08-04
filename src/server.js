import "dotenv/config";
import http from "http";
import { setupWebSocket } from "./websocket.js";
import app from "./app.js";

const PORT = process.env.PORT || 4001;

// create server from express
const server = http.createServer(app);

// attach ws
setupWebSocket(server);

// START THE SERVER (important part)
server.listen(PORT, () => {
  console.log(`🚀 API + WS running on http://localhost:${PORT}`);
});
