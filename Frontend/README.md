# 📚 Book River — Frontend

React (Vite) + Tailwind CSS v4 — customer storefront.

## ▶️ Run Command

```bash
cd "d:\Book River\Frontend"
npm run dev
```
→ http://localhost:5173

> Pehli baar? `npm install` pehle chalayein.

## Build
```bash
npm run build      # production build → dist/
npm run preview    # build preview
npm run lint       # eslint check
```

## Ports
| App | Port |
|---|---|
| Frontend | 5173 |
| Admin | 5174 |
| Backend | 5000 |

## Env (`.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=...
```

## Folder
```
src/
├── api/client.js       → Axios (auto token, error handling)
├── store/cartStore.js  → Zustand cart (persist)
├── pages/              → Your screens
├── components/  components/ui/  hooks/  utils/
├── App.jsx  main.jsx  index.css
```

## Installed
`react` · `react-router-dom` · `zustand` · `axios` · `react-hook-form` + `@hookform/resolvers` · `zod` · `framer-motion` · `swiper` · `react-hot-toast` · `react-pdf` · `lucide-react` · `@stripe/stripe-js` · `cloudinary` · `tailwindcss` v4
