import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import session from "./api/session.mjs";
import cards from "./api/cards.mjs";
import google from './api/google.mjs';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const config = JSON.parse(await readFile(new URL("./vercel.json", import.meta.url), "utf8"));
const server = http.createServer(async (req, res) => {
  for (const h of config.headers[0].headers) res.setHeader(h.key, h.value);
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/session") return await session(req, res);
    if (url.pathname === "/api/cards") return await cards(req, res);
    if (['/api/auth/google','/api/auth/google/callback'].includes(url.pathname)) return await google(req,res);
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); return res.end(); }
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const target = path.resolve(root, `.${pathname}`);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    const data = await readFile(target);
    res.setHeader("Content-Type", types[path.extname(target)] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(req.method === "HEAD" ? undefined : data);
  } catch { res.writeHead(404); res.end("Not found"); }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, process.env.HOST || "127.0.0.1", () => console.log(`AWS Recall: http://localhost:${port}`));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(() => process.exit(0)));
