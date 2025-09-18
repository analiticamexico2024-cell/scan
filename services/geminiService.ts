
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract all text from this document image. Present it exactly as it appears, preserving the original formatting, line breaks, and spacing as much as possible. Do not add any commentary, just the extracted text."
          }
        ],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    if (error instanceof Error) {
        return `Error processing document: ${error.message}`;
    }
    return "An unknown error occurred during document processing.";
  }
};
