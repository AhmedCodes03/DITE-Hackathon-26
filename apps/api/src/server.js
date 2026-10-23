import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const port = process.env.PORT || 5000;

function describeMongoTarget(uri) {
  if (!uri) return "unknown host";

  try {
    const parsed = new URL(uri);
    return parsed.host || uri;
  } catch {
    return uri;
  }
}

async function bootstrap() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  const mongoTarget = describeMongoTarget(env.mongoUri);
  const isMongoConnectionError =
    error?.name === "MongooseServerSelectionError" ||
    String(error?.message || "").includes("ECONNREFUSED");

  console.error("\nFailed to start API.");

  if (isMongoConnectionError) {
    console.error(`\nMongoDB is not reachable at: ${mongoTarget}`);
    console.error("Try one of these fixes:");
    console.error("1) Start MongoDB locally on port 27017");
    console.error(
      "2) Set a valid MONGO_URI in apps/api/.env (or system environment variables)"
    );
    console.error(
      "3) If using Docker, start the stack first: docker compose up -d mongo"
    );
    console.error(`\nCurrent MONGO_URI: ${env.mongoUri}`);
  } else {
    console.error(error);
  }

  process.exit(1);
});
// API server ready
