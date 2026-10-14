import { spawn } from "node:child_process";

const processes = [
  spawn(process.execPath, ["server.js"], { stdio: "inherit" }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], { stdio: "inherit" }),
];

function stop() {
  for (const child of processes) child.kill("SIGINT");
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) process.exitCode = code;
    stop();
  });
}
