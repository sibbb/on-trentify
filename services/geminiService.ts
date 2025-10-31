import { GoogleGenAI, Type } from "@google/genai";

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
- If the input is an object, club or concept, provide a direct, well-known, cheaper alternative, if it is a brand, provide the cheaper version of that brand that someone would buy if they couldnt afford the other brand. If it is a sport club, provide the local sportsclub that is not as good as them etc (e.g., Rolex -> Casio, Gold -> Silver, Champagne -> Prosecco, Real Madrid -> Atletico Madrid).
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

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.IMAGE_API}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-5-image-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                modalities: ['image', 'text'],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.choices && result.choices[0]?.message?.images && result.choices[0].message.images.length > 0) {
            const imageUrl = result.choices[0].message.images[0].image_url.url;
            // Extract base64 data from data URL (format: data:image/png;base64,...)
            const base64Data = imageUrl.split(',')[1];
            return base64Data;
        }

        throw new Error("No image data found in the OpenRouter response.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate an image from the AI.");
    }
};
