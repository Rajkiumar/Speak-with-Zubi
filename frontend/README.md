# Speak-with-Zubi Frontend

React + Vite frontend for the Speak-with-Zubi child interaction app.

## Live App

- https://speak-with-zubi-qdsn.vercel.app/

## Local Development

```bash
npm install
npm run dev
```

## Environment Variable

Create `frontend/.env` (optional):

```env
VITE_API_BASE_URL=https://speak-with-zubi-1.onrender.com
```

If this variable is not set, the app uses the default configured base URL in `src/services/api.js`.

## Build

```bash
npm run build
```

## Frontend Behavior

- Uploads an image and sends it to backend for visual context.
- Starts and continues a playful voice conversation.
- Reacts to tool responses with celebration and object highlighting UI.

