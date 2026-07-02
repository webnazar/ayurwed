import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

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

// Map of herb keys to their synonyms and matching keywords for indications
const herbConfig: { [key: string]: { synonyms: string[], keywords: string[] } } = {
  "ashwagandha": {
    synonyms: ["ashwagandha", "aswagandha"],
    keywords: ["stress", "anxiety", "fatigue", "energy", "insomnia", "sleep", "vitality", "stamina", "strength", "muscle", "nervous"]
  },
  "brahmi": {
    synonyms: ["brahmi", "bacopa"],
    keywords: ["memory", "concentration", "cognitive", "brain", "fog", "focus", "stress", "anxiety", "sleep", "insomnia", "depression", "mind"]
  },
  "gotu kola": {
    synonyms: ["gotu kola", "mandukaparni", "mandukparni"],
    keywords: ["memory", "concentration", "cognitive", "brain", "stress", "anxiety", "skin", "glow", "wound"]
  },
  "tulsi": {
    synonyms: ["tulsi", "holy basil"],
    keywords: ["cough", "cold", "fever", "immunity", "respiratory", "stress", "bronchitis", "sinusitis", "congestion"]
  },
  "triphala": {
    synonyms: ["triphala"],
    keywords: ["constipation", "digestion", "digestive", "detox", "bowel", "laxative", "colon", "eye", "vision", "weight", "obesity"]
  },
  "amalaki": {
    synonyms: ["amalaki", "amla"],
    keywords: ["acid reflux", "acidity", "heartburn", "immunity", "hair", "skin", "glow", "aging", "antioxidant", "vision", "eye"]
  },
  "haritaki": {
    synonyms: ["haritaki", "harad"],
    keywords: ["constipation", "digestion", "digestive", "detox", "gas", "bloating"]
  },
  "vibhitaki": {
    synonyms: ["vibhitaki", "baheda", "bibhitaki"],
    keywords: ["cough", "cold", "asthma", "bronchitis", "throat", "voice", "hair"]
  },
  "guduchi": {
    synonyms: ["guduchi", "giloy"],
    keywords: ["immunity", "fever", "infection", "allergy", "allergies", "liver", "detox", "gout", "inflammation"]
  },
  "shatavari": {
    synonyms: ["shatavari"],
    keywords: ["hormonal", "menopause", "pcos", "pcod", "menstrual", "lactation", "fertility", "reproductive", "fatigue", "vitality"]
  },
  "guggulu": {
    synonyms: ["guggulu", "guggul"],
    keywords: ["joint", "arthritis", "cholesterol", "obesity", "weight", "inflammation", "gout", "acne"]
  },
  "turmeric": {
    synonyms: ["turmeric", "haldi", "haridra"],
    keywords: ["skin", "glow", "acne", "wound", "inflammation", "joint", "arthritis", "immunity", "allergy", "allergies", "eczema", "psoriasis"]
  },
  "ginger": {
    synonyms: ["ginger", "shunti", "adrak"],
    keywords: ["digestion", "digestive", "nausea", "gas", "bloating", "cough", "cold", "joint", "pain", "fever"]
  },
  "licorice": {
    synonyms: ["licorice", "yashtimadhu", "yashti madhu", "mulethi"],
    keywords: ["acidity", "ulcer", "reflux", "cough", "cold", "throat", "skin", "glow", "dry skin", "stress"]
  },
  "neem": {
    synonyms: ["neem", "nimba"],
    keywords: ["acne", "pimple", "skin", "eczema", "psoriasis", "dandruff", "detox", "blood purification", "infection"]
  },
  "arjuna": {
    synonyms: ["arjuna", "arjun"],
    keywords: ["heart", "cardiac", "blood pressure", "hypertension", "cholesterol", "circulation"]
  },
  "shilajit": {
    synonyms: ["shilajit"],
    keywords: ["fatigue", "energy", "vitality", "stamina", "strength", "fertility", "libido", "immunity", "joint"]
  },
  "aloe vera": {
    synonyms: ["aloe vera", "kumari"],
    keywords: ["skin", "glow", "burn", "constipation", "digestion", "digestive", "hair", "pcos", "pcod", "hormonal"]
  },
  "cumin": {
    synonyms: ["cumin", "jeeraka", "jeera"],
    keywords: ["digestion", "digestive", "gas", "bloating", "colic", "diarrhea"]
  },
  "coriander": {
    synonyms: ["coriander", "dhanyaka", "dhania"],
    keywords: ["gas", "bloating", "acidity", "digestion", "urinary", "burning urination", "uti"]
  },
  "fennel": {
    synonyms: ["fennel", "saunf"],
    keywords: ["gas", "bloating", "digestion", "colic", "acid reflux", "appetite"]
  },
  "cardamom": {
    synonyms: ["cardamom", "elaichi", "ela"],
    keywords: ["digestion", "nausea", "bad breath", "oral", "cough"]
  },
  "cinnamon": {
    synonyms: ["cinnamon", "dalchini", "twak"],
    keywords: ["diabetes", "blood sugar", "insulin", "digestion", "cough", "cold"]
  },
  "clove": {
    synonyms: ["clove", "lavanga", "laung"],
    keywords: ["toothache", "tooth", "oral", "dental", "cough", "cold", "headache"]
  },
  "pippali": {
    synonyms: ["pippali", "long pepper"],
    keywords: ["cough", "cold", "asthma", "bronchitis", "congestion", "digestion"]
  },
  "kalmegh": {
    synonyms: ["kalmegh"],
    keywords: ["liver", "detox", "fever", "immunity", "infection", "digestion"]
  },
  "punarnava": {
    synonyms: ["punarnava"],
    keywords: ["kidney", "urinary", "uti", "burning urination", "fluid retention", "edema", "liver", "weight"]
  },
  "gokshura": {
    synonyms: ["gokshura", "gokshur"],
    keywords: ["kidney", "urinary", "uti", "prostate", "libido", "stamina", "vitality"]
  },
  "bhringraj": {
    synonyms: ["bhringraj", "bhringraja"],
    keywords: ["hair", "alopecia", "dandruff", "scalp", "graying", "greying", "liver", "sleep", "insomnia"]
  },
  "manjistha": {
    synonyms: ["manjistha", "manjishta"],
    keywords: ["skin", "glow", "pigmentation", "acne", "detox", "blood purification"]
  },
  "kutki": {
    synonyms: ["kutki", "katuki"],
    keywords: ["liver", "jaundice", "detox", "fever", "eczema", "psoriasis", "skin", "digestion"]
  },
  "musta": {
    synonyms: ["musta", "nagarmotha"],
    keywords: ["diarrhea", "dysentery", "fever", "digestion", "spasm"]
  },
  "karela": {
    synonyms: ["karela"],
    keywords: ["diabetes", "blood sugar", "insulin"]
  },
  "jamun": {
    synonyms: ["jamun"],
    keywords: ["diabetes", "blood sugar", "insulin", "cholesterol"]
  },
  "gudmar": {
    synonyms: ["gudmar"],
    keywords: ["diabetes", "blood sugar", "insulin", "weight"]
  },
  "vijaysar": {
    synonyms: ["vijaysar"],
    keywords: ["diabetes", "blood sugar", "insulin", "cholesterol"]
  },
  "vasaka": {
    synonyms: ["vasaka", "vasa"],
    keywords: ["cough", "bronchitis", "asthma", "respiratory", "congestion"]
  },
  "shallaki": {
    synonyms: ["shallaki"],
    keywords: ["joint", "arthritis", "inflammation", "back pain", "pain"]
  },
  "nirgundi": {
    synonyms: ["nirgundi"],
    keywords: ["joint", "arthritis", "muscle", "stiffness", "pain", "back pain"]
  },
  "rasna": {
    synonyms: ["rasna"],
    keywords: ["joint", "arthritis", "muscle", "stiffness", "pain", "gout"]
  },
  "chirata": {
    synonyms: ["chirata", "chirayata"],
    keywords: ["fever", "skin", "liver", "immunity"]
  },
  "lodhra": {
    synonyms: ["lodhra"],
    keywords: ["menstrual", "bleeding", "uterine", "pcos", "pcod", "hormonal"]
  },
  "ashoka": {
    synonyms: ["ashoka"],
    keywords: ["menstrual", "bleeding", "uterine", "pcos", "pcod", "hormonal", "fertility"]
  },
  "swarna bhasma": {
    synonyms: ["swarna bhasma"],
    keywords: ["immunity", "rejuvenation", "strength", "cognitive", "heart"]
  },
  "rajat bhasma": {
    synonyms: ["rajat bhasma"],
    keywords: ["nervous", "anxiety", "stress", "brain", "memory"]
  },
  "khadira": {
    synonyms: ["khadira"],
    keywords: ["skin", "eczema", "psoriasis", "oral", "gums"]
  },
  "bakuchi": {
    synonyms: ["bakuchi"],
    keywords: ["vitiligo", "pigmentation", "skin", "psoriasis"]
  },
  "karanja": {
    synonyms: ["karanja"],
    keywords: ["skin", "wound", "eczema"]
  },
  "eranda": {
    synonyms: ["eranda", "castor"],
    keywords: ["constipation", "laxative", "joint", "back pain"]
  },
  "makardhwaj": {
    synonyms: ["makardhwaj", "makaradhwaja"],
    keywords: ["vitality", "stamina", "rejuvenation", "immunity"]
  },
  "pushkarmool": {
    synonyms: ["pushkarmool"],
    keywords: ["asthma", "bronchitis", "chest pain", "respiratory"]
  },
  "vacha": {
    synonyms: ["vacha"],
    keywords: ["speech", "cognitive", "memory", "throat", "brain"]
  },
  "jatamansi": {
    synonyms: ["jatamansi"],
    keywords: ["sleep", "insomnia", "anxiety", "stress", "depression", "headache"]
  },
  "tagar": {
    synonyms: ["tagar"],
    keywords: ["sleep", "insomnia", "anxiety", "stress", "muscle", "stiffness"]
  },
  "bala": {
    synonyms: ["bala"],
    keywords: ["strength", "muscle", "fatigue", "vitality", "joint"]
  },
  "atibala": {
    synonyms: ["atibala"],
    keywords: ["strength", "immunity", "urinary"]
  },
  "vidarikand": {
    synonyms: ["vidarikand", "vidari"],
    keywords: ["vitality", "strength", "lactation", "aging", "fertility"]
  },
  "akarkara": {
    synonyms: ["akarkara"],
    keywords: ["toothache", "libido", "stamina", "joint"]
  },
  "loha bhasma": {
    synonyms: ["loha bhasma"],
    keywords: ["anemia", "anaemia", "fatigue", "weakness"]
  },
  "shankha bhasma": {
    synonyms: ["shankha bhasma"],
    keywords: ["acidity", "reflux", "ulcer", "heartburn", "burning", "digestion"]
  },
  "praval pishti": {
    synonyms: ["praval pishti"],
    keywords: ["acidity", "reflux", "ulcer", "heartburn", "burning", "fever"]
  },
  "sariva": {
    synonyms: ["sariva", "anantmool"],
    keywords: ["skin", "blood purification", "burning", "urinary", "detox"]
  },
  "patol": {
    synonyms: ["patol"],
    keywords: ["liver", "fever", "skin"]
  },
  "kanchanar": {
    synonyms: ["kanchanar"],
    keywords: ["thyroid", "pcos", "pcod", "weight"]
  },
  "varuna": {
    synonyms: ["varuna"],
    keywords: ["kidney", "stone", "urinary", "uti"]
  },
  "hadjod": {
    synonyms: ["hadjod"],
    keywords: ["bone", "osteoporosis", "joint", "fracture"]
  },
  "japa": {
    synonyms: ["japa", "hibiscus"],
    keywords: ["hair", "dandruff", "scalp"]
  },
  "kumkumadi": {
    synonyms: ["kumkumadi"],
    keywords: ["skin", "glow", "pigmentation", "dark spots", "acne"]
  },
  "kesar": {
    synonyms: ["kesar", "saffron"],
    keywords: ["skin", "glow", "strength", "libido", "vitality", "stress"]
  },
  "chandana": {
    synonyms: ["chandana", "sandalwood"],
    keywords: ["burning", "stress", "anxiety", "skin", "acne", "dry skin"]
  },
  "ushira": {
    synonyms: ["ushira", "vetiver"],
    keywords: ["burning", "stress", "anxiety", "skin", "fever"]
  },
  "kalonji": {
    synonyms: ["kalonji"],
    keywords: ["immunity", "hair", "respiratory", "digestion"]
  },
  "indrayava": {
    synonyms: ["indrayava"],
    keywords: ["diarrhea", "dysentery", "skin"]
  },
  "priyangu": {
    synonyms: ["priyangu"],
    keywords: ["bleeding", "diarrhea", "skin"]
  },
  "moringa": {
    synonyms: ["moringa", "shigru"],
    keywords: ["joint", "arthritis", "inflammation", "back pain", "pain", "strength", "bone", "osteoporosis", "immunity"]
  },
  "kali musli": {
    synonyms: ["kali musli", "safed musli", "musli"],
    keywords: ["fatigue", "strength", "vitality", "stamina", "libido", "erectile", "fertility", "reproductive", "rejuvenation", "immunity"]
  },
  "black pepper": {
    synonyms: ["black pepper", "maricha", "kali mirch"],
    keywords: ["cough", "cold", "fever", "digestion", "bloating", "gas", "obesity", "metabolism", "respiratory"]
  },
  "fenugreek": {
    synonyms: ["fenugreek", "methi"],
    keywords: ["diabetes", "blood sugar", "lactation", "breast milk", "joint", "cholesterol", "digestion", "hair"]
  },
  "ajwain": {
    synonyms: ["ajwain", "carom"],
    keywords: ["gas", "bloating", "colic", "digestion", "spasm", "asthma", "respiratory", "cough"]
  },
  "garlic": {
    synonyms: ["garlic", "lashuna"],
    keywords: ["cholesterol", "blood pressure", "heart", "immunity", "joint", "digestion", "gas"]
  },
  "onion": {
    synonyms: ["onion", "palandu"],
    keywords: ["hair", "digestion", "strength", "immunity"]
  },
  "noni": {
    synonyms: ["noni"],
    keywords: ["immunity", "energy", "fatigue", "inflammation", "joint", "skin", "detox"]
  },
  "spirulina": {
    synonyms: ["spirulina"],
    keywords: ["immunity", "energy", "fatigue", "nutrition", "antioxidant"]
  },
  "wheatgrass": {
    synonyms: ["wheatgrass"],
    keywords: ["detox", "blood purification", "anemia", "energy", "digestion", "immunity"]
  },
  "kutaja": {
    synonyms: ["kutaja", "kutaj"],
    keywords: ["diarrhea", "dysentery", "irritable bowel", "ibs", "digestion"]
  },
  "bilva": {
    synonyms: ["bilva", "bilwa", "bael"],
    keywords: ["diarrhea", "dysentery", "ibs", "digestion", "bowel", "constipation"]
  },
  "chitrak": {
    synonyms: ["chitrak"],
    keywords: ["digestion", "appetite", "weight", "obesity", "metabolism"]
  },
  "vidanga": {
    synonyms: ["vidanga", "waividang"],
    keywords: ["worm", "parasite", "digestion", "bloating", "detox"]
  },
  "sarpagandha": {
    synonyms: ["sarpagandha"],
    keywords: ["blood pressure", "hypertension", "sleep", "insomnia", "anxiety", "stress"]
  },
  "devdaru": {
    synonyms: ["devdaru", "deodar"],
    keywords: ["cough", "cold", "asthma", "joint", "arthritis", "inflammation"]
  },
  "shatapushpa": {
    synonyms: ["shatapushpa", "dill"],
    keywords: ["menstrual", "lactation", "gas", "bloating", "digestion", "colic"]
  },
  "kushtha": {
    synonyms: ["kushtha", "kushth"],
    keywords: ["skin", "eczema", "psoriasis", "cough", "cold"]
  },
  "sarshapa": {
    synonyms: ["sarshapa", "mustard"],
    keywords: ["joint", "pain", "skin"]
  },
  "agnimantha": {
    synonyms: ["agnimantha"],
    keywords: ["joint", "pain", "fatigue", "inflammation"]
  },
  "shyonaka": {
    synonyms: ["shyonaka"],
    keywords: ["joint", "pain", "fatigue", "inflammation"]
  },
  "gambhari": {
    synonyms: ["gambhari"],
    keywords: ["joint", "pain", "fatigue", "inflammation", "lactation"]
  },
  "patala": {
    synonyms: ["patala"],
    keywords: ["joint", "pain", "fatigue", "inflammation", "cough"]
  },
  "brihati": {
    synonyms: ["brihati"],
    keywords: ["cough", "cold", "fever", "respiratory"]
  },
  "kantakari": {
    synonyms: ["kantakari"],
    keywords: ["cough", "cold", "asthma", "respiratory"]
  },
  "shalaparni": {
    synonyms: ["shalaparni"],
    keywords: ["fever", "respiratory", "strength", "fatigue"]
  },
  "prishnaparni": {
    synonyms: ["prishnaparni"],
    keywords: ["fracture", "bleeding", "strength", "fatigue"]
  },
  "mudgaparni": {
    synonyms: ["mudgaparni"],
    keywords: ["strength", "fatigue", "vitality"]
  },
  "mashaparni": {
    synonyms: ["mashaparni"],
    keywords: ["strength", "fatigue", "vitality", "libido"]
  },
  "shankhpushpi": {
    synonyms: ["shankhpushpi", "shankhapuspi"],
    keywords: ["memory", "concentration", "cognitive", "brain", "fog", "focus", "stress", "anxiety", "sleep", "insomnia", "depression", "mind"]
  },
  "kapikacchu": {
    synonyms: ["kapikacchu", "mucuna", "kaunch"],
    keywords: ["libido", "stamina", "vitality", "fertility", "reproductive", "strength", "muscle"]
  },
  "dashmool": {
    synonyms: ["dashmool", "dashmoola", "dasamula"],
    keywords: ["pain", "inflammation", "fever", "respiratory", "asthma", "cough", "cold", "joint", "arthritis", "back pain", "sciatica", "fatigue"]
  },
  "panchatikta": {
    synonyms: ["panchatikta", "panch tikta"],
    keywords: ["skin", "eczema", "psoriasis", "acne", "blood purification", "detox", "liver", "fever", "infection"]
  },
  "ginkgo": {
    synonyms: ["ginkgo biloba", "ginkgo"],
    keywords: ["memory", "concentration", "cognitive", "brain", "circulation", "vision", "eye"]
  },
  "trikatu": {
    synonyms: ["trikatu"],
    keywords: ["digestion", "metabolism", "weight", "obesity", "cough", "cold", "gas", "bloating"]
  },
  "chyawanprash": {
    synonyms: ["chyawanprash", "chyavanprash"],
    keywords: ["immunity", "rejuvenation", "strength", "vitality", "energy", "respiratory", "cough", "cold"]
  }
};

async function main() {
  try {
    // 1. Read preparations from CSV and ensure they exist in DB
    const csv1Path = path.join(process.cwd(), 'ayurwed_extracts_master.csv');
    let csvPreps: any[] = [];
    if (fs.existsSync(csv1Path)) {
      const content = fs.readFileSync(csv1Path, 'utf-8');
      csvPreps = parseCsv(content);
    }
    
    const dbPreps = await db.preparation.findMany();
    const dbPrepSlugs = new Set(dbPreps.map(p => p.slug));
    
    console.log("Checking for missing preparations...");
    for (const row of csvPreps) {
      const originalName = row["Preparation Name"] || row["name"] || row["title"];
      if (!originalName) continue;
      
      // Normalize name: "Tulsi Extract" -> "Tulsi"
      let normalizedName = originalName.trim();
      if (normalizedName.toLowerCase().endsWith(" extract")) {
        normalizedName = normalizedName.substring(0, normalizedName.length - 8).trim();
      }
      
      const slug = slugify(normalizedName);
      if (!dbPrepSlugs.has(slug)) {
        console.log(`Adding missing preparation: ${normalizedName}`);
        
        await db.preparation.create({
          data: {
            name: normalizedName,
            slug: slug,
            type: "LIQUID_EXTRACT",
            description: row.Description || `Premium quality pure ${normalizedName} extract prepared classically.`,
            botanicalName: row.BotanicalName || `Botanical name for ${normalizedName}`,
            volume: row.Volume ? parseInt(row.Volume) : 500,
            volumeUnit: row["Volume Unit"] || "ml",
            mrp: 350,
            stock: 100,
            ingredients: JSON.stringify([normalizedName]),
            benefits: JSON.stringify([row.Benefits || "Immunity", "Vitality"]),
            usage: row.Usage || "Take as directed by your physician.",
            images: JSON.stringify([]),
            isActive: true
          }
        });
        dbPrepSlugs.add(slug);
      }
    }
    
    // 2. Read indications from CSV and ensure they exist in DB
    const csv2Path = path.join(process.cwd(), 'preparations.csv');
    let csvIndications: any[] = [];
    if (fs.existsSync(csv2Path)) {
      const content = fs.readFileSync(csv2Path, 'utf-8');
      csvIndications = parseCsv(content);
    }
    
    const dbIndications = await db.indication.findMany();
    const dbIndicationNames = new Set(dbIndications.map(i => i.name.toLowerCase().trim()));
    
    console.log("Checking for missing indications...");
    let addedIndCount = 0;
    for (const row of csvIndications) {
      const indName = row.Name || row.name;
      if (!indName) continue;
      
      const normalizedIndName = indName.trim();
      const lowerIndName = normalizedIndName.toLowerCase();
      if (!dbIndicationNames.has(lowerIndName)) {
        console.log(`Adding missing indication: ${normalizedIndName}`);
        
        await db.indication.create({
          data: {
            name: normalizedIndName,
            slug: slugify(normalizedIndName),
            description: row.Description || `Information and guidelines for managing ${normalizedIndName} naturally.`,
          }
        });
        dbIndicationNames.add(lowerIndName);
        addedIndCount++;
      }
    }
    console.log(`Added ${addedIndCount} missing indications.`);
    
    // 3. Perform keyword-based mapping
    console.log("\nStarting keyword-based indication mapping...");
    const updatedDbPreps = await db.preparation.findMany();
    const updatedDbIndications = await db.indication.findMany();
    
    let totalUpdated = 0;
    for (const prep of updatedDbPreps) {
      const prepNameLower = prep.name.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      const matchedIndicationIds: number[] = [];
      const matchedHerbKeys: string[] = [];
      
      for (const [herbKey, config] of Object.entries(herbConfig)) {
        let isHerbMatched = false;
        for (const syn of config.synonyms) {
          const formattedSyn = syn.toLowerCase();
          const regex = new RegExp(`\\b${formattedSyn}\\b|${formattedSyn}`, 'i');
          if (regex.test(prepNameLower)) {
            isHerbMatched = true;
            break;
          }
        }
        
        if (isHerbMatched) {
          matchedHerbKeys.push(herbKey);
          
          for (const ind of updatedDbIndications) {
            const indNameLower = ind.name.toLowerCase();
            const matchesKeyword = config.keywords.some(keyword => {
              const keyRegex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'i');
              return keyRegex.test(indNameLower);
            });
            
            if (matchesKeyword && !matchedIndicationIds.includes(ind.id)) {
              matchedIndicationIds.push(ind.id);
            }
          }
        }
      }
      
      if (matchedIndicationIds.length > 0) {
        await db.preparation.update({
          where: { id: prep.id },
          data: {
            indications: {
              set: matchedIndicationIds.map(id => ({ id }))
            }
          }
        });
        console.log(`Updated [${prep.name}]: Connected ${matchedIndicationIds.length} indications via herbs: ${matchedHerbKeys.join(', ')}`);
        totalUpdated++;
      }
    }
    
    console.log(`\nSuccessfully mapped and updated ${totalUpdated} preparations.`);
  } catch (e) {
    console.error("Error during sync and mapping:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
