const app = require("./app.js");
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.info(`Server stabil berjalan di port ${PORT}`);
  console.info(`Waktu: ${new Date()}`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`Gagal: Port ${PORT} sudah dipakai layanan lain!`);
    process.exit(1);
  }
});
