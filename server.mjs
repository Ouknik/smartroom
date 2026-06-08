// server.js — Custom Node.js server for Next.js on cPanel hosting
// This file is intentionally plain CommonJS/ESM-compatible and avoids
// TypeScript so it runs directly with `node server.js` without compilation.

import { createServer } from 'http'
import next from 'next'

// cPanel injects the PORT env var automatically; fall back to 3000 locally.
const port = parseInt(process.env.PORT || '3000', 10)
const hostname = process.env.HOSTNAME || 'localhost'
const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res)
    } catch (err) {
      console.error('Error handling request:', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> SmartRoom ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${dev ? 'development' : 'production'}`)
  })
})
