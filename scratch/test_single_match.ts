import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u886831643_ayurwed:Black_4Black_4@srv2203.hstgr.io:3306/u886831643_ayurwed?connection_limit=5"
    }
  }
});

async function main() {
  try {
    const dbIndications = await db.indication.findMany();
    const prepName = "Moringa";
    const prepNameLower = prepName.toLowerCase();
    
    // Check moringa config
    const synonyms = ["moringa", "shigru"];
    const keywords = ["joint", "arthritis", "inflammation", "back pain", "pain", "strength", "bone", "osteoporosis", "immunity"];
    
    console.log(`Testing prep: ${prepName}`);
    let isHerbMatched = false;
    for (const syn of synonyms) {
      const formattedSyn = syn.toLowerCase();
      const regex = new RegExp(`\\b${formattedSyn}\\b|${formattedSyn}`, 'i');
      if (regex.test(prepNameLower)) {
        isHerbMatched = true;
        console.log(`Matched synonym: ${syn}`);
      }
    }
    
    if (isHerbMatched) {
      const matched: string[] = [];
      for (const ind of dbIndications) {
        const indNameLower = ind.name.toLowerCase();
        const matchesKeyword = keywords.some(keyword => {
          const keyRegex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'i');
          const res = keyRegex.test(indNameLower);
          if (res) {
            console.log(`  Indication "${ind.name}" matched keyword "${keyword}"`);
          }
          return res;
        });
        if (matchesKeyword) {
          matched.push(ind.name);
        }
      }
      console.log(`Total matched indications for ${prepName}: ${matched.length}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
}

main();
