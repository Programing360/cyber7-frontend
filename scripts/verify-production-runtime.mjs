import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "..");

const PORT = process.env.VERIFY_PORT ? Number(process.env.VERIFY_PORT) : 3005;

function fetchUrl(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${PORT}${urlPath}`,
      { method: "GET", headers, timeout: 3000 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, data, headers: res.headers }),
        );
      },
    );
    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchUrl("/login");
      return true;
    } catch (err) {
      // console.log(`Waiting for server (attempt ${i + 1}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw new Error("Server failed to start in time");
}

async function run() {
  // console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: frontendDir,
    env: { ...process.env, NODE_ENV: "production" },
    shell: true,
    stdio: "inherit",
  });

  const cleanup = () => {
    // console.log("Shutting down production server...");
    try {
      spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
    } catch (e) {
      server.kill();
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    await waitForServer();
    // console.log(`Server is ready on http://localhost:${PORT}! Running security verification probes...\n`);

    const results = [];

    // Probe 1: /admin
    // console.log("--> Probing /admin");
    const p1 = await fetchUrl("/admin");
    const lockedP1 = p1.data.includes(
      "Platform Administration — Production Locked",
    );
    const leakedP1 =
      p1.data.includes("Total Workspaces") || p1.data.includes("742,000");
    results.push({
      route: "/admin",
      status: p1.status,
      failClosed: lockedP1 && !leakedP1,
      lockedScreen: lockedP1,
      leakedData: leakedP1,
    });

    // Probe 2: /admin/login
    // console.log("--> Probing /admin/login");
    const p2 = await fetchUrl("/admin/login");
    const lockedP2 =
      p2.data.includes("Platform Administration — Production Locked") ||
      p2.data.includes("Console Locked in Production");
    const leakedP2 =
      p2.data.includes("admin@vexchat.app") && p2.data.includes("password");
    results.push({
      route: "/admin/login",
      status: p2.status,
      failClosed: lockedP2 && !leakedP2,
      lockedScreen: lockedP2,
      leakedData: leakedP2,
    });

    // Probe 3: /admin/workspaces
    // console.log("--> Probing /admin/workspaces");
    const p3 = await fetchUrl("/admin/workspaces");
    const lockedP3 = p3.data.includes(
      "Platform Administration — Production Locked",
    );
    const leakedP3 =
      p3.data.includes("Apex Retail Ltd") ||
      p3.data.includes("Bengal Logistics");
    results.push({
      route: "/admin/workspaces",
      status: p3.status,
      failClosed: lockedP3 && !leakedP3,
      lockedScreen: lockedP3,
      leakedData: leakedP3,
    });

    // Probe 4: /admin/payments
    // console.log("--> Probing /admin/payments");
    const p4 = await fetchUrl("/admin/payments");
    const lockedP4 = p4.data.includes(
      "Platform Administration — Production Locked",
    );
    const leakedP4 =
      p4.data.includes("INV-2026-0042") ||
      p4.data.includes("City Bank Transfer");
    results.push({
      route: "/admin/payments",
      status: p4.status,
      failClosed: lockedP4 && !leakedP4,
      lockedScreen: lockedP4,
      leakedData: leakedP4,
    });

    // Probe 5: /admin?preview=true (Query param bypass attempt)
    // console.log("--> Probing /admin?preview=true (Bypass attempt)");
    const p5 = await fetchUrl("/admin?preview=true");
    const lockedP5 = p5.data.includes(
      "Platform Administration — Production Locked",
    );
    const leakedP5 = p5.data.includes("Total Workspaces");
    results.push({
      route: "/admin?preview=true",
      status: p5.status,
      failClosed: lockedP5 && !leakedP5,
      lockedScreen: lockedP5,
      leakedData: leakedP5,
    });

    // Probe 6: /admin with Cookie spoofing
    ("--> Probing /admin with Cookie: admin_preview=1 (Bypass attempt)");
    const p6 = await fetchUrl("/admin", {
      Cookie: "admin_preview=1; admin_session=bypass",
    });
    const lockedP6 = p6.data.includes(
      "Platform Administration — Production Locked",
    );
    const leakedP6 = p6.data.includes("Total Workspaces");
    results.push({
      route: "/admin (Cookie spoof)",
      status: p6.status,
      failClosed: lockedP6 && !leakedP6,
      lockedScreen: lockedP6,
      leakedData: leakedP6,
    });

    // Probe 7: Customer route regression check
    // console.log("--> Probing /login (Customer route check)");
    const p7 = await fetchUrl("/login");
    const custLoginOk = p7.status === 200 && p7.data.includes("Welcome back");
    results.push({
      route: "/login",
      status: p7.status,
      failClosed: custLoginOk,
      lockedScreen: false,
      leakedData: false,
    });

    // Probe 8: Customer billing route check
    // console.log("--> Probing /billing (Customer billing route check)");
    const p8 = await fetchUrl("/billing");
    const custBillingOk = p8.status === 200;
    results.push({
      route: "/billing",
      status: p8.status,
      failClosed: custBillingOk,
      lockedScreen: false,
      leakedData: false,
    });

    // Probe 9: Containment check for /super-admin
    // console.log("--> Probing /super-admin (Legacy containment check)");
    const p9 = await fetchUrl("/super-admin");
    const superAdminContained =
      p9.data.includes("Access Restricted") || p9.data.includes("redirect");
    results.push({
      route: "/super-admin",
      status: p9.status,
      failClosed: superAdminContained,
      lockedScreen: superAdminContained,
      leakedData: false,
    });

    const allPassed = results.every((r) => r.failClosed);
    if (!allPassed) {
      console.error(
        "\n❌ CRITICAL ERROR: Some production runtime verification checks FAILED!",
      );
      process.exitCode = 1;
    } else {
      // console.log("\n✅ ALL PRODUCTION RUNTIME VERIFICATION CHECKS PASSED!");
      // console.log(
      //   "Platform admin routes strictly fail-closed; no dashboard data leaked; no parameter/cookie bypass possible.",
      // );
    }
  } finally {
    cleanup();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
