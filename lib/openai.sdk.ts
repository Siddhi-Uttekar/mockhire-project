import { OpenAI } from "openai";

export const client = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT, // e.g: "https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/"
  apiKey: process.env.AZURE_OPENAI_API_KEY,   // Your Azure OpenAI API key
});
