# Backend API

## POST /api/chat

Send a child prompt, and optionally an image for visual scanning.

### Request body

```json
{
  "message": "Ask me questions based on this image",
  "imageBase64": "<base64 image data without data-url prefix>",
  "mimeType": "image/png"
}
```

- `message` is optional if `imageBase64` is present.
- `imageBase64` must be raw base64 (not `data:image/...;base64,`).
- `mimeType` is optional (defaults to `image/png`).

### Response shape

```json
{
  "reply": "...",
  "tool": "celebrate_child | highlight_object | null",
  "args": {}
}
```
