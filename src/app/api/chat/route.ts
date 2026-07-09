import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';

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

    // Fetch preparations and consultants for contextual recommendations (RAG)
    let preparations: any[] = [];
    let consultants: any[] = [];
    try {
      preparations = await db.preparation.findMany({
        where: { isActive: true },
        select: { id: true, name: true, type: true, benefits: true }
      });
      consultants = await db.consultantProfile.findMany({
        where: { isVerified: true },
        select: { id: true, specialization: true, user: { select: { name: true } } }
      });
    } catch (dbErr) {
      console.error('[CHAT_DB_ERROR] Failed to fetch context', dbErr);
    }

    const prepContext = preparations.map(p => `- ${p.name} (${p.type}): ${JSON.stringify(p.benefits)} (Link: /preparations/${p.id})`).join('\n');
    const doctorContext = consultants.map(c => `- Dr. ${c.user?.name || 'Practitioner'} (${c.specialization}) (Link: /doctors/${c.id})`).join('\n');

    const systemInstruction = `You are Ayuri, a kind, knowledgeable Ayurvedic AI assistant. You answer health and wellness questions using authentic, classical Ayurvedic guidelines.
Suggest lifestyle modifications, dosha balancing routines, and single herbs.

Below are the actual wellness preparations and certified consultants available on our platform. 
Whenever relevant to the user's question, mention these preparations or consultants and provide their EXACT relative URLs using standard markdown links (e.g., [Bringadi Oil](/preparations/3) or [Dr. Nair](/doctors/1)).
Do not invent preparations or doctor URLs that are not in this list.

AVAILABLE PREPARATIONS:
${prepContext || 'None available at the moment'}

AVAILABLE CERTIFIED CONSULTANTS:
${doctorContext || 'None available at the moment'}

Always remind users to consult a certified practitioner for diagnostic checks.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    // Format chat history for multi-turn Gemini API
    const history = (messages.slice(0, -1) || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

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
