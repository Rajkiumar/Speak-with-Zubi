import { generateGeminiResponse } from "../services/geminiService.js";

export const handleChat = async (req, res) => {
  try {
    const { message, imageBase64, mimeType } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({
        error: "Message or imageBase64 is required",
      });
    }

    const aiResponse = await generateGeminiResponse(message || "Describe this image", {
      imageBase64,
      mimeType,
    });

    res.json(aiResponse);
  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal Server Error",
      details: error.details || null,
    });
  }
};