import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';

// Simple Ayurveda-themed fallback answers when Gemini API key is missing or calls fail
const AYURVEDA_FALLBACKS = [
  "Based on Ayurvedic principles, this preparation matches a Vata-balancing routine. Explore remedies in our [Shop](/shop) or read our [Knowledge Center](/knowledge).",
  "Ayurveda recommends warm, easily digestible meals when balancing Vata. Discover educational articles in our [Knowledge Center](/knowledge) or consult our [Doctors List](/doctors).",
  "For hair and scalp vitality, Bhringraj oil is a classical favorite. Check our [Shop](/shop) for authentic formulations.",
  "Ashwagandha is an adaptogen that helps with stress and sleep quality. Browse available remedies in our [Shop](/shop).",
  "For Pitta constitution, cooling herbs like Aloe Vera, Shatavari, and Amalaki are highly recommended. Learn more in our [Knowledge Center](/knowledge).",
  "AYURWED provides an authentic Ayurvedic Shop, an educational Knowledge Center, and a verified Doctors List. Please note that we do not book appointments or provide prescriptions; you can contact doctors directly from our [Doctors List](/doctors)."
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

    const systemInstruction = `You are Ayuri, a kind, knowledgeable Ayurvedic AI assistant for AYURWED.
You answer health, lifestyle, and herbal wellness questions using authentic, classical Ayurvedic guidelines (doshas, dinacharya, herbs, dietary tips).

PLATFORM SCOPE & THREE CORE PILLARS:
AYURWED exclusively offers three core services:
1. eCommerce Shop: Authentic classical Ayurvedic products, single herbs, and wellness formulations (Link: /shop).
2. Knowledge Center: Educational articles, wellness blogs, dosha balance guides, and classical wisdom (Link: /knowledge).
3. Doctors List: A verified directory of certified Ayurvedic doctors and practitioners with their direct contact details (Link: /doctors).

STRICT NEGATIVE CONSTRAINTS (MANDATORY & CRITICAL):
- AYURWED and Ayuri DO NOT handle medical prescriptions, digital prescriptions, or medicine prescribing.
- AYURWED and Ayuri DO NOT handle doctor appointment bookings, clinical scheduling, or video consultations.
- Ayuri does NOT diagnose diseases or prescribe medications.
- If a user asks to "book an appointment", "schedule a consultation", "get a prescription", or asks "can you prescribe medicine?":
  Politely and clearly explain:
  "AYURWED does not handle appointment bookings or medical prescriptions. Our platform provides an authentic Ayurvedic Shop, an educational Knowledge Center, and a verified Doctors List. You can browse our [Doctors List](/doctors) to view verified Ayurvedic practitioners and contact them directly, explore wellness remedies in our [Shop](/shop), or read helpful articles in our [Knowledge Center](/knowledge)."

RECOMMENDATIONS & LINKS:
Whenever relevant to the user's question, mention matching products or doctors from the lists below and provide their EXACT relative URLs using standard markdown links (e.g., [Ashwagandha Capsules](/shop/ashwagandha), [Knowledge Center](/knowledge), or [Dr. Nair](/doctors/1)).
Do not invent products or doctor URLs that are not in this list.

AVAILABLE PRODUCTS & MEDICINES:
${productContext || 'None available at the moment'}

AVAILABLE CERTIFIED CONSULTANTS (DOCTORS DIRECTORY):
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
