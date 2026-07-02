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

function parseCsv(content: string): any[] {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const results: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple split
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    results.push(row);
  }
  
  return results;
}

async function main() {
  try {
    const csvPath = path.join(process.cwd(), 'ayurwed_extracts_master.csv');
    if (!fs.existsSync(csvPath)) {
      console.error("Master CSV not found!");
      return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const csvPreps = parseCsv(content);
    
    const validSlugs = new Set<string>();
    for (const row of csvPreps) {
      const name = row.Name || row.name || row.title || row.Title;
      if (name) {
        validSlugs.add(slugify(name));
      }
    }

    console.log(`Found ${validSlugs.size} valid preparation slugs in master CSV.`);

    const dbPreps = await db.preparation.findMany({ select: { id: true, name: true, slug: true } });
    console.log(`Current preparations in DB: ${dbPreps.length}`);

    let deleteCount = 0;
    for (const prep of dbPreps) {
      if (!validSlugs.has(prep.slug)) {
        await db.preparation.delete({
          where: { id: prep.id }
        });
        console.log(`Deleted incorrect preparation: ${prep.name}`);
        deleteCount++;
      }
    }

    console.log(`Cleanup complete. Deleted ${deleteCount} incorrect preparations.`);
  } catch (e) {
    console.error("Error during cleanup:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
