import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PoorMansVersionResult {
    poorMansVersion: string;
    isPerson: boolean;
}

export const getPoorMansVersion = async (originalInput: string): Promise<PoorMansVersionResult> => {
    try {
        const prompt = `Analyze the input: "${originalInput}".
First, determine if the input is a famous person.
Then, determine the "poor man's version" of the input based on the following rules:
- If the input is an object or concept, provide a direct, well-known, cheaper alternative (e.g., Rolex -> Casio, Gold -> Silver, Champagne -> Prosecco).
- If the input is a famous person, provide the name of another well-known person who is widely considered to be an imitator, a follower, or aspires to be like the original person (e.g., Donald Trump -> JD Vance or Viktor Orbán).

Return the result as a JSON object.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        poorMansVersion: {
                            type: Type.STRING,
                            description: "The name of the poor man's version item or person."
                        },
                        isPerson: {
                            type: Type.BOOLEAN,
                            description: "True if the original input was a person."
                        }
                    },
                    required: ["poorMansVersion", "isPerson"]
                }
            }
        });

        const result = JSON.parse(response.text) as PoorMansVersionResult;

        if (!result.poorMansVersion) {
            throw new Error("AI returned an empty response for the concept.");
        }
        return result;
    } catch (error) {
        console.error("Error getting poor man's version:", error);
        throw new Error("Failed to get a creative alternative from the AI.");
    }
};

export const generateImageOf = async (item: string, isPerson: boolean): Promise<string> => {
    try {
        const prompt = isPerson
            ? `A 3d rendered version of ${item}. Do not show a real person, make it a fictional character.`
            : `A high-quality, photorealistic image of: ${item}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error("No image data found in the AI response.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate an image from the AI.");
    }
};
