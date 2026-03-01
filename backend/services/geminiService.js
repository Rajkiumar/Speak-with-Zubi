import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { SYSTEM_PROMPT } from "../utils/promptTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const buildQuotaFallback = (userMessage, hasImage) => {
  const message = (userMessage || "").toLowerCase();
  const objects = ["cat", "tree", "sun", "kite", "flower", "cloud", "ball"];
  const objectName = objects.find((item) => message.includes(item));

  if (objectName) {
    return {
      reply: null,
      tool: "highlight_object",
      args: { object_name: objectName },
    };
  }

  if (hasImage) {
    return {
      reply: "I can see your picture! What bright thing do you notice first?",
      tool: null,
      args: {},
    };
  }

  return {
    reply: "Wow! Great sharing! What do you see next in the picture?",
    tool: "celebrate_child",
    args: {},
  };
};

export const generateGeminiResponse = async (userMessage, imageInput = {}) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
    const imageBase64 = imageInput.imageBase64;
    const mimeType = imageInput.mimeType || "image/png";

    if (!apiKey) {
      const error = new Error("GEMINI_API_KEY is missing");
      error.statusCode = 500;
      throw error;
    }

    const userParts = [{ text: userMessage }];

    if (imageBase64) {
      userParts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64,
        },
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: userParts,
          },
        ],
        tools: [
          {
            functionDeclarations: [
              {
                name: "celebrate_child",
                description: "Show celebration animation for the child",
              },
              {
                name: "highlight_object",
                description: "Highlight an object in the image",
                parameters: {
                  type: "object",
                  properties: {
                    object_name: {
                      type: "string",
                      description: "Name of object to highlight",
                    },
                  },
                  required: ["object_name"],
                },
              },
            ],
          },
        ],
      },
      {
        timeout: 15000,
      }
    );

    const candidate = response.data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionPart = parts.find((part) => part.functionCall);
    const textPart = parts.find((part) => part.text);

    if (!candidate) {
      const error = new Error("Gemini returned no candidates");
      error.statusCode = 502;
      throw error;
    }

    if (functionPart?.functionCall) {
      return {
        reply: null,
        tool: functionPart.functionCall.name,
        args: functionPart.functionCall.args || {},
      };
    }

    return {
      reply: textPart?.text || "That sounds fun! What do you see next?",
      tool: null,
    };
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("Gemini quota exceeded. Using local fallback response.");
      return buildQuotaFallback(userMessage, Boolean(imageInput.imageBase64));
    }

    const upstream = error.response?.data;
    const upstreamMessage =
      upstream?.error?.message || upstream?.message || error.message;

    const wrappedError = new Error(upstreamMessage || "Gemini request failed");
    wrappedError.statusCode = error.response?.status || error.statusCode || 502;
    wrappedError.details = upstream || null;
    console.error("Gemini Error:", wrappedError.message, wrappedError.details || "");
    throw wrappedError;
  }
};