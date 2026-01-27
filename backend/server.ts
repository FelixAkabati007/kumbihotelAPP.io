import app from "./app";

console.log("Starting server...");

const PORT = process.env.PORT || 3001;

console.log(`Attempting to listen on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
