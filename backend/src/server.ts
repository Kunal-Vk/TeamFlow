import app from "./app";
import { env } from "./config/env";

const startServer = () => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
};

startServer();