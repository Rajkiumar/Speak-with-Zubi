import axios from "axios";

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://speak-with-zubi-3.onrender.com";

const apiClient = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 15000,
});

export const sendMessage = async (message, options = {}) => {
  const payload = {
    message,
    ...(options.imageBase64 ? { imageBase64: options.imageBase64 } : {}),
    ...(options.mimeType ? { mimeType: options.mimeType } : {}),
  };

  try {
    const response = await apiClient.post("/api/chat", payload);
    return response.data;
  } catch (error) {
    const isNetworkError = !error.response;
    const canRetryWithLoopback =
      isNetworkError &&
      typeof defaultBaseUrl === "string" &&
      defaultBaseUrl.includes("localhost");

    if (canRetryWithLoopback) {
      try {
        const fallbackBaseUrl = defaultBaseUrl.replace("localhost", "127.0.0.1");
        const retryClient = axios.create({
          baseURL: fallbackBaseUrl,
          timeout: 15000,
        });
        const retryResponse = await retryClient.post("/api/chat", payload);
        return retryResponse.data;
      } catch (retryError) {
        const retryMessage =
          retryError.response?.data?.error || retryError.message || "Network error";
        const wrappedRetry = new Error(
          `Unable to connect to backend. Tried ${defaultBaseUrl} and ${defaultBaseUrl.replace("localhost", "127.0.0.1")}. Last error: ${retryMessage}`
        );
        wrappedRetry.status = retryError.response?.status || 0;
        throw wrappedRetry;
      }
    }

    const messageFromServer =
      error.response?.data?.error ||
      error.response?.data?.message ||
      `Unable to connect to backend at ${defaultBaseUrl}`;

    const wrapped = new Error(messageFromServer);
    wrapped.status = error.response?.status || 0;
    throw wrapped;
  }
};