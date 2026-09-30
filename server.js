const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const QR_TTL_MS = 120 * 60 * 1000;
const tokens = new Map();
const publicFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/expired.html", ["expired.html", "text/html; charset=utf-8"]],
  ["/expired.css", ["expired.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]]
]);

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(value));
}

function sendExpired(response) {
  fs.readFile(path.join(__dirname, "expired.html"), (error, contents) => {
    response.writeHead(410, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer"
    });
    response.end(error
      ? "<!doctype html><html lang=\"id\"><meta charset=\"utf-8\"><title>Link kedaluwarsa</title><h1>Link sudah kedaluwarsa.</h1>"
      : contents.toString().replace("<head>", "<head><base href=\"/\">"));
  });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 4096) {
        reject(Object.assign(new Error("Request terlalu besar"), { status: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error("JSON tidak valid"), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");

  if (request.method === "POST" && requestUrl.pathname === "/api/qr") {
    try {
      const body = await readJson(request);
      const destination = new URL(body.destinationUrl);
      if (
        !["http:", "https:"].includes(destination.protocol) ||
        !destination.hostname.includes(".")
      ) {
        sendJson(response, 400, { error: "Masukkan tautan web http:// atau https:// yang valid." });
        return;
      }

      const token = randomBytes(24).toString("base64url");
      const expiresAt = Date.now() + QR_TTL_MS;
      tokens.set(token, { destination: destination.href, expiresAt });
      sendJson(response, 201, { path: `/r/${token}`, expiresAt });
    } catch (error) {
      sendJson(response, error.status || 400, { error: error.message || "Permintaan tidak valid." });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/r/")) {
    const token = requestUrl.pathname.slice(3);
    const entry = tokens.get(token);
    if (!entry || entry.expiresAt <= Date.now()) {
      tokens.delete(token);
      sendExpired(response);
      return;
    }

    response.writeHead(302, {
      Location: entry.destination,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer"
    });
    response.end();
    return;
  }

  const file = publicFiles.get(requestUrl.pathname);
  if (request.method === "GET" && file) {
    const filePath = path.join(__dirname, file[0]);
    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404);
        response.end("File tidak ditemukan");
        return;
      }
      response.writeHead(200, {
        "Content-Type": file[1],
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      });
      response.end(contents);
    });
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Tidak ditemukan");
});

setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of tokens) {
    if (entry.expiresAt <= now) tokens.delete(token);
  }
}, QR_TTL_MS).unref();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Ruang QR berjalan di http://localhost:${PORT}`);
});