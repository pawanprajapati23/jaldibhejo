const { io } = require("socket.io-client");
const socket = io("http://localhost:3001", { autoConnect: false });

console.log("Creating room...");
try {
  socket.emit('create-room', "123456");
  console.log("Emitted successfully");
} catch(e) {
  console.error("Error emitting:", e);
}
