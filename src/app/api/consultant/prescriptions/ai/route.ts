import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { patient, indications, notes } = body;

    if (!patient || !indications) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Fetch available preparations to feed into the AI
    const preparations = await prisma.preparation.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        benefits: true,
        usage: true
      }
    });

    const prepContext = preparations.map(p => 
      `ID: ${p.id} | Name: ${p.name} | Type: ${p.type} | Benefits: ${JSON.stringify(p.benefits)} | Usage: ${p.usage}`
    ).join('\n');

    const prompt = `
    You are the Ancient Intelligence Prescription Engine (AIPE) for an Ayurvedic platform.
    Your task is to analyze patient data, consultation notes, and indications to suggest suitable Ayurvedic preparations from the available list.
    
    IMPORTANT: You must ONLY suggest preparations from the provided Available Preparations list. Do not invent new ones.
    Return your response strictly as a JSON array of suggestion objects.
    Each suggestion object must have the following fields:
    - "preparationId": number (the ID of the suggested preparation)
    - "preparationName": string (the name of the suggested preparation)
    - "dosage": string (e.g., "10 Drops", "1 Tablet")
    - "frequency": string (e.g., "Twice Daily", "Morning and Evening")
    - "duration": string (e.g., "15 Days", "1 Month")
    - "instructions": string (e.g., "After meals with warm water")
    - "reason": string (a brief explanation of why this is suggested based on the patient's indications)

    --- INPUT DATA ---
    Patient Profile:
    Age: ${patient.age || 'Unknown'}
    Gender: ${patient.gender || 'Unknown'}
    Weight: ${patient.weight || 'Unknown'}
    Chronic Diseases: ${patient.chronicDiseases || 'None reported'}
    Allergies: ${patient.allergies || 'None reported'}

    Consultation Notes / Symptoms:
    ${notes || 'No notes provided'}

    Indications:
    ${indications.map((i: any) => i.name).join(', ')}

    Available Preparations:
    ${prepContext}
    --- END INPUT DATA ---
    
    Provide your output as a valid JSON array. Do not include markdown blocks like \`\`\`json.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON
    let suggestions = [];
    try {
      // Find JSON array in the response string if it's wrapped in something else
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(responseText);
      }
    } catch (e) {
      console.error("Failed to parse AI response", responseText);
      return NextResponse.json({ error: 'Failed to generate valid suggestions' }, { status: 500 });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AIPE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
