import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocketIO } from "./socket";
import { trySetupSupabaseTables, seedSupabaseRestaurant } from "./lib/supabase";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);
initSocketIO(httpServer);

async function start() {
  logger.info("Initializing Supabase...");
  const tablesReady = await trySetupSupabaseTables();
  if (tablesReady) {
    await seedSupabaseRestaurant();
  } else {
    logger.info("Supabase tables not auto-created — using local PostgreSQL as primary store. To use Supabase, run the SQL from the logs in your Supabase dashboard SQL editor.");
  }

  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening with Socket.io");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
