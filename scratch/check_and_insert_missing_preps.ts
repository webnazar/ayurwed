import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u886831643_ayurwed:Black_4Black_4@srv2203.hstgr.io:3306/u886831643_ayurwed?connection_limit=5"
    }
  }
});

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

// Robust simple CSV parser to handle quotes and commas
function parseCsv(content: string): any[] {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = parseCsvLine(lines[0]);
  const results: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    results.push(row);
  }
  
  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  try {
    const dbPreps = await db.preparation.findMany({ select: { slug: true } });
    const dbSlugs = new Set(dbPreps.map(p => p.slug));

    console.log(`Currently, there are ${dbPreps.length} preparations in the remote database.`);

    const csv1Path = path.join(process.cwd(), 'preparations.csv');
    const csv2Path = path.join(process.cwd(), 'ayurwed_extracts_master.csv');

    let csv1: any[] = [];
    let csv2: any[] = [];

    if (fs.existsSync(csv1Path)) {
      const content = fs.readFileSync(csv1Path, 'utf-8');
      csv1 = parseCsv(content);
      console.log(`Read ${csv1.length} rows from preparations.csv`);
    }

    if (fs.existsSync(csv2Path)) {
      const content = fs.readFileSync(csv2Path, 'utf-8');
      csv2 = parseCsv(content);
      console.log(`Read ${csv2.length} rows from ayurwed_extracts_master.csv`);
    }

    // We will collect any preparations that are in these CSVs but not in the DB
    const missingPreps: any[] = [];

    // Let's check csv1 (preparations.csv)
    for (const row of csv1) {
      const name = row.Name || row.name;
      if (!name) continue;
      const slug = slugify(name);
      if (!dbSlugs.has(slug)) {
        missingPreps.push({
          name: name,
          slug,
          type: "LIQUID_EXTRACT",
          description: row.Description || row.description || `Premium quality pure ${name} extract prepared classically.`,
          botanicalName: row.BotanicalName || row.botanicalName || `Botanical name for ${name}`,
          volume: 500,
          volumeUnit: "ml",
          mrp: 350,
          stock: 100,
          ingredients: [name],
          benefits: ["Immunity", "Vitality"],
          usage: "Take as directed by your physician.",
          images: [],
          isActive: true
        });
        dbSlugs.add(slug); // Avoid duplicates
      }
    }

    // Let's check csv2 (ayurwed_extracts_master.csv)
    for (const row of csv2) {
      const name = row.Name || row.name || row.title || row.Title;
      if (!name) continue;
      const slug = slugify(name);
      if (!dbSlugs.has(slug)) {
        missingPreps.push({
          name: name,
          slug,
          type: "LIQUID_EXTRACT",
          description: row.Description || row.description || `Premium quality pure ${name} extract prepared classically.`,
          botanicalName: row.BotanicalName || row.botanicalName || `Botanical name for ${name}`,
          volume: 500,
          volumeUnit: "ml",
          mrp: 350,
          stock: 100,
          ingredients: [name],
          benefits: ["Immunity", "Vitality"],
          usage: "Take as directed by your physician.",
          images: [],
          isActive: true
        });
        dbSlugs.add(slug);
      }
    }

    console.log(`Found ${missingPreps.length} missing preparations to insert.`);

    if (missingPreps.length > 0) {
      for (const prep of missingPreps) {
        await db.preparation.create({
          data: {
            name: prep.name,
            slug: prep.slug,
            type: prep.type,
            description: prep.description,
            botanicalName: prep.botanicalName,
            volume: prep.volume,
            volumeUnit: prep.volumeUnit,
            mrp: prep.mrp,
            stock: prep.stock,
            ingredients: JSON.stringify(prep.ingredients),
            benefits: JSON.stringify(prep.benefits),
            usage: prep.usage,
            images: JSON.stringify(prep.images),
            isActive: prep.isActive
          }
        });
        console.log(`Inserted missing preparation: ${prep.name}`);
      }
      console.log("All missing preparations inserted successfully.");
    } else {
      console.log("No preparations are missing from the database.");
    }

  } catch (e) {
    console.error("Error checking/inserting missing preparations:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
