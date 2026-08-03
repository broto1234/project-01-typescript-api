import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import prisma from './lib/prisma';

const PORT = env.port;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

//Store the server instance
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Add Graceful shutdown
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Disconnected from database.");
      process.exit(0);
    } catch (err) {
      console.error("Shutdown error:", err);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});