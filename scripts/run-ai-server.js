/**
 * Cross-platform launcher for the Python AI service (FastAPI + uvicorn).
 * Uses apps/backend/ai/venv so npm scripts work on Windows and Unix.
 */
const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const aiDir = path.join(root, "apps", "backend", "ai");
const venvPython =
  process.platform === "win32"
    ? path.join(aiDir, "venv", "Scripts", "python.exe")
    : path.join(aiDir, "venv", "bin", "python");

const proc = spawn(
  venvPython,
  [
    "-m",
    "uvicorn",
    "ai_service:app",
    "--host",
    "0.0.0.0",
    "--port",
    "8000",
  ],
  { cwd: aiDir, stdio: "inherit", shell: false },
);

proc.on("exit", (code) => {
  process.exit(code === null ? 1 : code);
});
