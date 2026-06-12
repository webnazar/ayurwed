import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple Ayurveda-themed fallback answers when Gemini API key is missing or calls fail
const AYURVEDA_FALLBACKS = [
  "Based on Ayurvedic principles, this preparation matches a Vata-balancing routine. Try consuming it with warm water or milk.",
  "Ayurveda recommends avoiding raw foods or cold drinks if you are experiencing Vata imbalance. Root vegetables and warm ghee are beneficial.",
  "For hair health, Bringadi oil is excellent. Ensure you massage it into the scalp twice a week, leaving it for 30 minutes before washing.",
  "Ashwagandha is an adaptogen that helps with stress and sleep quality. It is best consumed at night with warm milk.",
  "For Pitta constitution, cooling herbs like Aloe Vera, Shatavari, and Amalaki are highly recommended.",
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_gemini_api_key_for_compilation') {
      // Return a simulated delay and fallback message
      await new Promise(resolve => setTimeout(resolve, 800));
      const randomFallback = AYURVEDA_FALLBACKS[Math.floor(Math.random() * AYURVEDA_FALLBACKS.length)];
      return NextResponse.json({
        content: `[Ayuri AI Fallback] ${randomFallback} (Please configure a valid GEMINI_API_KEY in your environment for live Gemini model responses).`
      });
    }

    // Live call to Google Gemini model
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for speed and lightweight footprint
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are Ayuri, a kind, knowledgeable Ayurvedic AI assistant. You answer health and wellness questions using authentic, classical Ayurvedic guidelines. Suggest lifestyle modifications, dosha balancing routines, and single herbs. Always remind users to consult a certified practitioner for diagnostic checks.",
    });

    const response = await model.generateContent(lastMessage);
    const text = response.response.text();

    return NextResponse.json({ content: text });
  } catch (err: any) {
    console.error('[CHAT_API_ERROR]', err);
    // Return fallback in case of rate limits/network errors
    const randomFallback = AYURVEDA_FALLBACKS[Math.floor(Math.random() * AYURVEDA_FALLBACKS.length)];
    return NextResponse.json({
      content: `[Ayuri AI Fallback] ${randomFallback} (Note: live API call failed due to ${err.message || 'connection issue'}).`
    });
  }
}
