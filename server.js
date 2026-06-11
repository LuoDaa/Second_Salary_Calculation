const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8996);
const HOST = "0.0.0.0";
const ROOT = __dirname;

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (raw || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function send(res, status, headers, body) {
  res.writeHead(status, {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
    "Vary": "X-Forwarded-For, Forwarded, Cookie",
    ...headers,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const ip = clientIp(req).replace(/^::ffff:/, "");
  let filePath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(ROOT, filePath);

  if (!fullPath.startsWith(ROOT)) {
    send(res, 403, { "Content-Type": "text/plain; charset=utf-8", "X-Client-IP-Cache-Key": ip }, "Forbidden");
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8", "X-Client-IP-Cache-Key": ip }, "Not found");
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".mjs": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".gltf": "model/gltf+json; charset=utf-8",
      ".glb": "model/gltf-binary",
      ".bin": "application/octet-stream",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml; charset=utf-8",
    };
    const contentType = types[ext] || "application/octet-stream";
    send(res, 200, { "Content-Type": contentType, "X-Client-IP-Cache-Key": ip }, data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Salary ticker listening on http://${HOST}:${PORT}`);
});
