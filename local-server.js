const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf"
};

http.createServer((req, res) => {
  const cleanPath = decodeURIComponent(req.url.split("?")[0]);

  if (cleanPath === "/config.js") {
    const config = {
      SUPABASE_URL: String(process.env.SUPABASE_URL || "").trim(),
      SUPABASE_ANON_KEY: String(process.env.SUPABASE_ANON_KEY || "").trim()
    };

    res.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    });
    res.end(`window.GTD_CONFIG = ${JSON.stringify(config)};`);
    return;
  }

  const filePath = path.join(root, cleanPath === "/" ? "index.html" : cleanPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`GTD-Ability Tecnologia em http://localhost:${port}`);
});
