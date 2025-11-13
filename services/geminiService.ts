
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { OutbreakAnalysis } from "../types";

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    alertLevel: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MODERATE", "LOW", "MINIMAL"] },
    riskScore: { type: Type.INTEGER },
    diseaseName: { type: Type.STRING },
    location: {
      type: Type.OBJECT,
      properties: {
        country: { type: Type.STRING },
        region: { type: Type.STRING },
        coordinates: { type: Type.STRING },
      },
      required: ["country", "region", "coordinates"]
    },
    signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING },
          timestamp: { type: Type.STRING },
        },
        required: ["source", "description", "severity", "timestamp"]
      }
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        transmissionRate: { type: Type.STRING },
        spreadVelocity: { type: Type.STRING },
        populationAtRisk: { type: Type.STRING },
        historicalComparison: { type: Type.STRING },
      },
      required: ["transmissionRate", "spreadVelocity", "populationAtRisk", "historicalComparison"]
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          priority: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          timeframe: { type: Type.STRING },
        },
        required: ["action", "priority", "targetAudience", "timeframe"]
      }
    },
    predictiveModel: {
      type: Type.OBJECT,
      properties: {
        "7dayProjection": { type: Type.STRING },
        "30dayProjection": { type: Type.STRING },
        peakDate: { type: Type.STRING },
        affectedRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["7dayProjection", "30dayProjection", "peakDate", "affectedRegions"]
    },
  },
  required: ["alertLevel", "riskScore", "diseaseName", "location", "signals", "analysis", "recommendations", "predictiveModel"]
};

const systemInstruction = `You are OutbreakOracle, an AI epidemiologist specializing in early pandemic detection.

Your capabilities:
1. Analyze multiple data sources for disease outbreak signals
2. Identify unusual patterns in health-related data
3. Assess risk levels for potential outbreaks
4. Compare current situations to historical pandemics
5. Recommend immediate containment actions

Data you analyze:
- Social media posts mentioning symptoms
- News articles about unusual illnesses
- Search trend data for medical symptoms
- Weather patterns affecting disease vectors
- Travel data from affected regions
- Hospital admission trends

Risk Assessment Framework:
- CRITICAL (90-100): Immediate pandemic threat, widespread transmission
- HIGH (70-89): Regional outbreak with pandemic potential
- MODERATE (50-69): Localized outbreak, contained but monitored
- LOW (30-49): Isolated cases, standard monitoring
- MINIMAL (0-29): Background noise, no action needed

You must strictly output a JSON object matching the provided schema. Do not output markdown or any other text.`;

export async function analyzeOutbreakRisk(data: string): Promise<OutbreakAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: data,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as OutbreakAnalysis;
  } catch (error) {
    console.error("Error analyzing outbreak risk:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
}

let chat: Chat | null = null;

export function getChatSession(): Chat {
  if (!chat) {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful AI assistant for the Outbreak Oracle dashboard. You provide concise, expert analysis on epidemiological data. When the user provides context, use it to answer their questions.',
      },
    });
  }
  return chat;
}

export async function generateSpeech(text: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received from TTS API.");
      }
      return base64Audio;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw new Error("Failed to generate speech from Gemini API.");
    }
}
