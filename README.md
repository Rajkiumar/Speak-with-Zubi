# Speak-with-Zubi

Real-time child-friendly AI conversation demo built with React (frontend-only).

## What this project does

- Lets you upload any child-friendly image.
- Uses your object list to ask playful, safe questions.
- Keeps interaction active for about one minute.
- Triggers UI tool actions:
	- `celebrate_child`
	- `highlight_object`

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the local URL shown by Vite.

## Browser notes

- Use Chrome or Edge for best speech recognition support.
- Click **Start Voice Play** to begin (browser mic permission required).
- Add object names like `cat, tree, kite` before starting.
- If speech recognition is unavailable, the app still speaks and allows typed input.

## No backend needed

- This app does not require any backend or LLM API key.
- Conversation prompts are generated in-browser from object names you provide.