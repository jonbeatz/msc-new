/**
 * Cursor `beforeShellExecution` hook: block `npm run verify:next` / `clean:next` when
 * something is listening on port 3000. Running those deletes `.next` and breaks the live
 * `next dev` process (500 + `/_next/static/chunks/fallback/*`).
 *
 * Safe alternative: `npm run verify:next:safe` (stops port 3000 first).
 *
 * Only JSON on stdout. Debug to stderr.
 */

import net from "node:net"

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (c) => chunks.push(c))
    process.stdin.on("end", () => resolve(chunks.join("")))
    process.stdin.on("error", reject)
  })
}

function portInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy()
      resolve(true)
    })
    socket.on("error", () => resolve(false))
    socket.setTimeout(1200, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

function isNukeCommand(cmd) {
  if (!cmd || typeof cmd !== "string") return false
  const c = cmd
  if (/verify:next:safe|verify-next-safe/.test(c)) return false
  if (/(\bnpm\s+run\s+verify:next\b|\bverify:next\b)/.test(c) && !/verify:next:safe/.test(c)) return true
  if (/\bnpm\s+run\s+clean:next\b|\bclean:next\b/.test(c)) return true
  if (/clean-next-cache\.mjs/.test(c)) return true
  // Manual `.next` wipes (same outcome as clean:next for a live dev server).
  if (/\bnpx\s+rimraf\b.*\.next\b/.test(c)) return true
  if (/\brimraf\b.*\.next\b/.test(c)) return true
  if (/\bRemove-Item\b.*\.next\b/.test(c)) return true
  return false
}

function deny(msg, agentMsg) {
  const o = {
    permission: "deny",
    userMessage: msg,
    user_message: msg,
    agentMessage: agentMsg,
    agent_message: agentMsg,
  }
  process.stdout.write(JSON.stringify(o))
}

async function main() {
  let input = {}
  try {
    const raw = await readStdin()
    if (raw?.trim()) input = JSON.parse(raw)
  } catch (e) {
    console.error("[guard-clean-while-dev] stdin parse:", e.message)
  }

  const cmd =
    input.command ??
    input.shellCommand ??
    input.fullCommand ??
    (typeof input.arguments === "string" ? input.arguments : "") ??
    ""

  if (!isNukeCommand(cmd)) {
    process.stdout.write(JSON.stringify({ permission: "allow" }))
    return
  }

  if (!(await portInUse(3000))) {
    process.stdout.write(JSON.stringify({ permission: "allow" }))
    return
  }

  const userMsg =
    "Port 3000 is in use (next dev is probably running). This command deletes `.next` and will corrupt that server — blank page, 500, and broken `/_next/static/chunks/fallback/*`. Stop dev first (Ctrl+C), or run: npm run verify:next:safe"
  const agentMsg =
    "Do not run verify:next, clean:next, or rimraf/remove of `.next` while dev is on 3000. Use npm run verify:next:safe (kills port 3000 then verify) or stop dev first."
  deny(userMsg, agentMsg)
}

main().catch((e) => {
  console.error("[guard-clean-while-dev]", e)
  process.stdout.write(JSON.stringify({ permission: "allow" }))
})
