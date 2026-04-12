/**
 * Free the dev port before `clean:next` runs. Cleaning `.next` while another
 * Node process still serves the same port leaves broken vendor-chunks (e.g.
 * missing `./vendor-chunks/escape-html.js`) and 500s on /admin.
 */
import { execFileSync } from "node:child_process"
import process from "node:process"

const port = process.env.DEV_PORT || "3000"

function killWin32() {
  try {
    const out = execFileSync(
      "cmd",
      ["/c", `netstat -ano | findstr :${port}`],
      { encoding: "utf8" },
    )
    const pids = new Set()
    for (const line of out.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed.includes("LISTENING")) continue
      const parts = trimmed.split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid)
    }
    for (const pid of pids) {
      try {
        execFileSync("taskkill", ["/PID", pid, "/F"], { stdio: "ignore" })
        console.log(`[kill-dev-port] stopped PID ${pid} on port ${port}`)
      } catch {
        // ignore
      }
    }
  } catch {
    // no listeners
  }
}

function killPosix() {
  try {
    execFileSync("sh", [
      "-c",
      `pids=$(lsof -ti:${port} 2>/dev/null); if [ -n "$pids" ]; then kill -9 $pids 2>/dev/null; echo "[kill-dev-port] stopped PIDs on port ${port}"; fi`,
    ])
  } catch {
    // ignore
  }
}

if (process.platform === "win32") killWin32()
else killPosix()
