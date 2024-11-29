import app from "./app";
import config from "./config/env";
import IO from "./modules/socket/socket";

process.on("uncaughtException", () => { });
process.on("unhandledRejection", () => { });
console.log(`>>>> Node Environment: ${process.env.NODE_ENV}`);
IO;

app.listen(config.port, () => {
  console.log(">>>> Server started on port:", config.port || 80);
});
