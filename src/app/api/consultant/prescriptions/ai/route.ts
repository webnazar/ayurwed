import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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
    const preparations = await db.preparation.findMany({
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
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            suggestions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  preparationId: { type: SchemaType.INTEGER, description: "the ID of the suggested preparation" },
                  preparationName: { type: SchemaType.STRING, description: "the name of the suggested preparation" },
                  dosage: { type: SchemaType.STRING, description: "e.g., '10 Drops', '1 Tablet'" },
                  frequency: { type: SchemaType.STRING, description: "e.g., 'Twice Daily', 'Morning and Evening'" },
                  duration: { type: SchemaType.STRING, description: "e.g., '15 Days', '1 Month'" },
                  instructions: { type: SchemaType.STRING, description: "e.g., 'After meals with warm water'" },
                  reason: { type: SchemaType.STRING, description: "a brief explanation of why this is suggested based on the patient's indications" }
                },
                required: [
                  "preparationId",
                  "preparationName",
                  "dosage",
                  "frequency",
                  "duration",
                  "instructions",
                  "reason"
                ]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let suggestions = [];
    try {
      const parsed = JSON.parse(responseText);
      suggestions = parsed.suggestions || [];
    } catch (e) {
      console.error("Failed to parse AIPE structured response", responseText, e);
      return NextResponse.json({ error: 'Failed to generate valid suggestions' }, { status: 500 });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AIPE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
