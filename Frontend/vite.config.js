import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Folder where you drop your images (repo root -> Images/)
const IMAGES_DIR = path.resolve(__dirname, '..', 'Images')

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

const IMAGE_EXT = new Set(Object.keys(MIME))

/** List every image inside the Images folder (Logo.* is skipped — it is the brand mark). */
function listImages() {
  if (!fs.existsSync(IMAGES_DIR)) return []
  return fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .filter((f) => !f.toLowerCase().startsWith('logo'))
    .sort()
}

/** Find the brand logo inside the Images folder (any Logo*.png / logo*.jpg ...). */
function findLogo() {
  if (!fs.existsSync(IMAGES_DIR)) return null
  const hit = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .filter((f) => f.toLowerCase().startsWith('logo'))
    .sort()
  return hit[0] || null
}

/**
 * Serves the repo-root `Images/` folder at `/images/` (dev + build).
 * Drop a picture into `Images/` and the carousel picks it up automatically —
 * no need to copy anything into the app's public folder.
 */
function bookRiverImages() {
  return {
    name: 'book-river-images',

    configureServer(server) {
      server.middlewares.use('/images', (req, res, next) => {
        const clean = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')

        // JSON manifest -> the carousel reads this to know what to show
        if (clean === '' || clean === 'manifest.json') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify({ images: listImages(), logo: findLogo() }))
          return
        }

        const file = path.join(IMAGES_DIR, clean)
        // block path traversal
        if (!file.startsWith(IMAGES_DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          return next()
        }

        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(file).pipe(res)
      })
    },

    generateBundle() {
      // Copy every image into the build output + emit the manifest
      for (const name of listImages()) {
        this.emitFile({
          type: 'asset',
          fileName: `images/${name}`,
          source: fs.readFileSync(path.join(IMAGES_DIR, name)),
        })
      }
      const logo = findLogo()
      if (logo) {
        this.emitFile({
          type: 'asset',
          fileName: `images/${logo}`,
          source: fs.readFileSync(path.join(IMAGES_DIR, logo)),
        })
      }
      this.emitFile({
        type: 'asset',
        fileName: 'images/manifest.json',
        source: JSON.stringify({ images: listImages(), logo }),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), bookRiverImages()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // pictures uploaded from the Admin panel (served by the backend)
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
