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

const AYURI_STRUCTURAL_DISCLAIMER = "\n\n*Disclaimer: Ayuri AI provides general educational and wellness guidance only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a certified Ayurvedic doctor before starting any herbal regimen or treatment plan.*";

function formatAyuriResponse(text: string): string {
  if (!text) return `Ayuri wellness guidance is available.${AYURI_STRUCTURAL_DISCLAIMER}`;
  if (text.includes("not a substitute for professional medical advice") || text.includes("not a substitute for medical advice")) {
    return text;
  }
  return `${text.trim()}${AYURI_STRUCTURAL_DISCLAIMER}`;
}

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
        content: formatAyuriResponse(`[Ayuri AI Fallback] ${randomFallback} (Please configure a valid GEMINI_API_KEY in your environment for live Gemini model responses).`)
      });
    }

    // Fetch products and consultants for contextual recommendations (RAG)
    let products: any[] = [];
    let consultants: any[] = [];
    try {
      products = await db.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, type: true, benefits: true, slug: true }
      });
      consultants = await db.consultantProfile.findMany({
        where: { isVerified: true },
        select: { id: true, specialization: true, user: { select: { name: true } } }
      });
    } catch (dbErr) {
      console.error('[CHAT_DB_ERROR] Failed to fetch context', dbErr);
    }

    const productContext = products.map(p => `- ${p.name} (${p.type || 'Product'}): ${JSON.stringify(p.benefits || '')} (Link: /shop/${p.slug})`).join('\n');
    const doctorContext = consultants.map(c => `- Dr. ${c.user?.name || 'Practitioner'} (${c.specialization}) (Link: /doctors/${c.id})`).join('\n');

    const systemInstruction = `You are Ayuri, a kind, knowledgeable Ayurvedic AI assistant. You answer health and wellness questions using authentic, classical Ayurvedic guidelines.
Suggest lifestyle modifications, dosha balancing routines, and single herbs.

Below are the actual wellness products, medicines, and certified consultants available on our platform. 
Whenever relevant to the user's question, mention these products or consultants and provide their EXACT relative URLs using standard markdown links (e.g., [Ashwagandha Capsules](/shop/ashwagandha) or [Dr. Nair](/doctors/1)).
Do not invent products or doctor URLs that are not in this list.

AVAILABLE PRODUCTS & MEDICINES:
${productContext || 'None available at the moment'}

AVAILABLE CERTIFIED CONSULTANTS:
${doctorContext || 'None available at the moment'}

CRITICAL MANDATORY REQUIREMENT:
Every single response MUST end with an explicit structural inline disclaimer line:
"Disclaimer: Ayuri AI provides general educational and wellness guidance only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a certified Ayurvedic doctor before starting any herbal regimen."`;

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

    return NextResponse.json({ content: formatAyuriResponse(text) });
  } catch (err: any) {
    console.error('[CHAT_API_ERROR]', err);
    // Return fallback in case of rate limits/network errors
    const randomFallback = AYURVEDA_FALLBACKS[Math.floor(Math.random() * AYURVEDA_FALLBACKS.length)];
    return NextResponse.json({
      content: formatAyuriResponse(`[Ayuri AI Fallback] ${randomFallback} (Note: live API call failed due to ${err.message || 'connection issue'}).`)
    });
  }
}
