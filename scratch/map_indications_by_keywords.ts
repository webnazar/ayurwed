import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u886831643_ayurwed:Black_4Black_4@srv2203.hstgr.io:3306/u886831643_ayurwed?connection_limit=5"
    }
  }
});

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
    synonyms: ["vibhitaki", "baheda"],
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
  }
};

async function main() {
  try {
    console.log("Fetching remote preparations and indications...");
    const dbPreparations = await db.preparation.findMany();
    const dbIndications = await db.indication.findMany();

    console.log(`Found ${dbPreparations.length} preparations and ${dbIndications.length} indications in REMOTE database.`);

    let totalUpdated = 0;

    for (const prep of dbPreparations) {
      const prepNameLower = prep.name.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      const matchedIndicationIds: number[] = [];
      const matchedHerbKeys: string[] = [];

      // 1. Identify which herbs are in the preparation
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
          
          // 2. Find all indications that contain any of this herb's keywords
          for (const ind of dbIndications) {
            const indNameLower = ind.name.toLowerCase();
            const matchesKeyword = config.keywords.some(keyword => {
              // Exact word match or substring depending on context
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
        // Update the preparation's indications in the remote database
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
      } else {
        console.warn(`No matching indications found for preparation: [${prep.name}]`);
      }
    }

    console.log(`\nSuccessfully mapped and updated ${totalUpdated} preparations on REMOTE.`);
  } catch (e) {
    console.error("Error during mapping:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
