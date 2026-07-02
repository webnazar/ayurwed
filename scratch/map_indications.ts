import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Comprehensive High-Fidelity Ayurvedic Herb & Synonym to Indication Mapping
const herbToIndications: { [key: string]: { synonyms: string[], indications: string[] } } = {
  "ginger": {
    synonyms: ["ginger", "shunti", "adrak"],
    indications: [
      "Digestive Issues (Agnimandya)",
      "Gas & Bloating (Adhmana)",
      "Cough & Cold",
      "Joint Pain & Arthritis (Sandhivata)",
      "Fever (Jwara)"
    ]
  },
  "licorice": {
    synonyms: ["licorice", "yashtimadhu", "yashti madhu", "mulethi"],
    indications: [
      "Acid Reflux (Amlapitta)",
      "Cough & Cold",
      "Skin Care & Glow",
      "Dry Skin",
      "Stress & Anxiety",
      "Hyperacidity & Ulcers"
    ]
  },
  "arjuna": {
    synonyms: ["arjuna", "arjun"],
    indications: [
      "Heart Health (Hridroga)",
      "Blood Pressure Support",
      "Cholesterol & Lipid Balance"
    ]
  },
  "triphala": {
    synonyms: ["triphala"],
    indications: [
      "Constipation (Vibandha)",
      "Digestive Issues (Agnimandya)",
      "Detoxification (Panchakarma Support)",
      "Eye Care (Netra Roga)",
      "Skin Care & Glow",
      "Weight Management"
    ]
  },
  "shilajit": {
    synonyms: ["shilajit"],
    indications: [
      "Fatigue & Low Energy",
      "Men's Vitality & Stamina",
      "Fertility & Reproductive Health",
      "Joint Pain & Arthritis (Sandhivata)",
      "Immunity Support"
    ]
  },
  "guduchi": {
    synonyms: ["guduchi", "giloy"],
    indications: [
      "Immunity Support",
      "Fever (Jwara)",
      "Liver Health & Detox",
      "Allergies (Hay Fever)",
      "Eczema & Psoriasis (Kushtha)"
    ]
  },
  "cinnamon": {
    synonyms: ["cinnamon", "dalchini", "twak"],
    indications: [
      "Diabetes Care (Madhumeha)",
      "Digestive Issues (Agnimandya)",
      "Cough & Cold"
    ]
  },
  "amalaki": {
    synonyms: ["amalaki", "amla"],
    indications: [
      "Acid Reflux (Amlapitta)",
      "Immunity Support",
      "Skin Care & Glow",
      "Hair Loss (Khalitya)",
      "Premature Greying",
      "Eye Care (Netra Roga)"
    ]
  },
  "cardamom": {
    synonyms: ["cardamom", "elaichi", "ela"],
    indications: [
      "Digestive Issues (Agnimandya)",
      "Gas & Bloating (Adhmana)",
      "Oral & Dental Health"
    ]
  },
  "bhringraj": {
    synonyms: ["bhringraj", "bhringraja"],
    indications: [
      "Hair Loss (Khalitya)",
      "Premature Greying",
      "Dandruff & Scalp Issues",
      "Liver Health & Detox",
      "Insomnia (Anidra)"
    ]
  },
  "coriander": {
    synonyms: ["coriander", "dhanyaka", "dhania"],
    indications: [
      "Gas & Bloating (Adhmana)",
      "Acid Reflux (Amlapitta)",
      "Digestive Issues (Agnimandya)",
      "Urinary Tract Infections (Mutrakrichha)"
    ]
  },
  "clove": {
    synonyms: ["clove", "lavanga", "laung"],
    indications: [
      "Oral & Dental Health",
      "Cough & Cold",
      "Headache & Migraine (Shirashoola)"
    ]
  },
  "punarnava": {
    synonyms: ["punarnava"],
    indications: [
      "Kidney & Urinary Health",
      "Urinary Tract Infections (Mutrakrichha)",
      "Liver Health & Detox",
      "Weight Management"
    ]
  },
  "guggulu": {
    synonyms: ["guggulu", "guggul"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Cholesterol & Lipid Balance",
      "Obesity (Sthaulya)",
      "Acne & Pimples (Yauvana Pidika)"
    ]
  },
  "pippali": {
    synonyms: ["pippali", "long pepper"],
    indications: [
      "Cough & Cold",
      "Asthma & Bronchitis (Shwasa Roga)",
      "Digestive Issues (Agnimandya)"
    ]
  },
  "kutki": {
    synonyms: ["kutki", "katuki"],
    indications: [
      "Liver Health & Detox",
      "Fever (Jwara)",
      "Eczema & Psoriasis (Kushtha)",
      "Digestive Issues (Agnimandya)"
    ]
  },
  "haritaki": {
    synonyms: ["haritaki", "harad"],
    indications: [
      "Constipation (Vibandha)",
      "Digestive Issues (Agnimandya)",
      "Detoxification (Panchakarma Support)"
    ]
  },
  "turmeric": {
    synonyms: ["turmeric", "haldi", "haridra"],
    indications: [
      "Skin Care & Glow",
      "Acne & Pimples (Yauvana Pidika)",
      "Eczema & Psoriasis (Kushtha)",
      "Joint Pain & Arthritis (Sandhivata)",
      "Wound Healing",
      "Immunity Support"
    ]
  },
  "brahmi": {
    synonyms: ["brahmi"],
    indications: [
      "Memory & Concentration (Medhya)",
      "Stress & Anxiety",
      "Insomnia (Anidra)",
      "Depression & Low Mood"
    ]
  },
  "fennel": {
    synonyms: ["fennel", "saunf"],
    indications: [
      "Gas & Bloating (Adhmana)",
      "Digestive Issues (Agnimandya)",
      "Acid Reflux (Amlapitta)"
    ]
  },
  "neem": {
    synonyms: ["neem", "nimba"],
    indications: [
      "Acne & Pimples (Yauvana Pidika)",
      "Eczema & Psoriasis (Kushtha)",
      "Dandruff & Scalp Issues",
      "Detoxification (Panchakarma Support)"
    ]
  },
  "gotu kola": {
    synonyms: ["gotu kola", "mandukaparni", "mandukparni"],
    indications: [
      "Memory & Concentration (Medhya)",
      "Stress & Anxiety",
      "Skin Care & Glow",
      "Wound Healing"
    ]
  },
  "vibhitaki": {
    synonyms: ["vibhitaki", "baheda"],
    indications: [
      "Cough & Cold",
      "Asthma & Bronchitis (Shwasa Roga)",
      "Hair Loss (Khalitya)"
    ]
  },
  "shatavari": {
    synonyms: ["shatavari"],
    indications: [
      "Women's Hormonal Balance",
      "Fertility & Reproductive Health",
      "Menopause Support",
      "Fatigue & Low Energy"
    ]
  },
  "cumin": {
    synonyms: ["cumin", "jeeraka", "jeera"],
    indications: [
      "Digestive Issues (Agnimandya)",
      "Gas & Bloating (Adhmana)",
      "Diarrhea & Loose Motions (Atisara)"
    ]
  },
  "aloe vera": {
    synonyms: ["aloe vera", "kumari"],
    indications: [
      "Skin Care & Glow",
      "Dry Skin",
      "Constipation (Vibandha)",
      "PCOS/PCOD Support",
      "Women's Hormonal Balance"
    ]
  },
  "manjistha": {
    synonyms: ["manjistha", "manjishta"],
    indications: [
      "Skin Care & Glow",
      "Acne & Pimples (Yauvana Pidika)",
      "Pigmentation & Dark Spots",
      "Detoxification (Panchakarma Support)"
    ]
  },
  "ashwagandha": {
    synonyms: ["ashwagandha", "aswagandha"],
    indications: [
      "Stress & Anxiety",
      "Fatigue & Low Energy",
      "Insomnia (Anidra)",
      "Men's Vitality & Stamina",
      "Joint Pain & Arthritis (Sandhivata)",
      "Muscle Pain & Stiffness"
    ]
  },
  "musta": {
    synonyms: ["musta", "nagarmotha"],
    indications: [
      "Diarrhea & Loose Motions (Atisara)",
      "Digestive Issues (Agnimandya)",
      "Fever (Jwara)"
    ]
  },
  "kalmegh": {
    synonyms: ["kalmegh"],
    indications: [
      "Liver Health & Detox",
      "Fever (Jwara)",
      "Immunity Support",
      "Digestive Issues (Agnimandya)"
    ]
  },
  "gokshura": {
    synonyms: ["gokshura", "gokshur"],
    indications: [
      "Kidney & Urinary Health",
      "Urinary Tract Infections (Mutrakrichha)",
      "Men's Vitality & Stamina"
    ]
  },
  "tulsi": {
    synonyms: ["tulsi"],
    indications: [
      "Cough & Cold",
      "Sinusitis",
      "Fever (Jwara)",
      "Stress & Anxiety",
      "Immunity Support"
    ]
  },
  "nagakesar": {
    synonyms: ["nagakesar"],
    indications: [
      "Menstrual Cramps (Kashtartava)",
      "Skin Care & Glow"
    ]
  },
  "pushkarmool": {
    synonyms: ["pushkarmool"],
    indications: [
      "Asthma & Bronchitis (Shwasa Roga)",
      "Cough & Cold",
      "Heart Health (Hridroga)"
    ]
  },
  "vacha": {
    synonyms: ["vacha"],
    indications: [
      "Memory & Concentration (Medhya)",
      "Cough & Cold",
      "Stress & Anxiety"
    ]
  },
  "jatamansi": {
    synonyms: ["jatamansi"],
    indications: [
      "Stress & Anxiety",
      "Insomnia (Anidra)",
      "Depression & Low Mood",
      "Headache & Migraine (Shirashoola)"
    ]
  },
  "tagar": {
    synonyms: ["tagar"],
    indications: [
      "Insomnia (Anidra)",
      "Stress & Anxiety",
      "Muscle Pain & Stiffness"
    ]
  },
  "kapikacchu": {
    synonyms: ["kapikacchu"],
    indications: [
      "Men's Vitality & Stamina",
      "Fertility & Reproductive Health",
      "Fatigue & Low Energy"
    ]
  },
  "bala": {
    synonyms: ["bala"],
    indications: [
      "Fatigue & Low Energy",
      "Muscle Pain & Stiffness",
      "Joint Pain & Arthritis (Sandhivata)",
      "Men's Vitality & Stamina"
    ]
  },
  "atibala": {
    synonyms: ["atibala"],
    indications: [
      "Fatigue & Low Energy",
      "Urinary Tract Infections (Mutrakrichha)",
      "Immunity Support"
    ]
  },
  "vidarikand": {
    synonyms: ["vidarikand"],
    indications: [
      "Fatigue & Low Energy",
      "Men's Vitality & Stamina",
      "Women's Hormonal Balance",
      "Fertility & Reproductive Health"
    ]
  },
  "akarkara": {
    synonyms: ["akarkara"],
    indications: [
      "Men's Vitality & Stamina",
      "Oral & Dental Health",
      "Joint Pain & Arthritis (Sandhivata)"
    ]
  },
  "makardhwaj": {
    synonyms: ["makardhwaj", "makaradhwaja"],
    indications: [
      "Men's Vitality & Stamina",
      "Fatigue & Low Energy",
      "Immunity Support"
    ]
  },
  "swarna bhasma": {
    synonyms: ["swarna bhasma"],
    indications: [
      "Immunity Support",
      "Memory & Concentration (Medhya)",
      "Fatigue & Low Energy",
      "Heart Health (Hridroga)"
    ]
  },
  "rajat bhasma": {
    synonyms: ["rajat bhasma"],
    indications: [
      "Stress & Anxiety",
      "Memory & Concentration (Medhya)",
      "Fatigue & Low Energy"
    ]
  },
  "trikatu": {
    synonyms: ["trikatu"],
    indications: [
      "Digestive Issues (Agnimandya)",
      "Gas & Bloating (Adhmana)",
      "Cough & Cold",
      "Weight Management",
      "Obesity (Sthaulya)"
    ]
  },
  "dashmool": {
    synonyms: ["dashmool", "dashmoola"],
    indications: [
      "Fatigue & Low Energy",
      "Joint Pain & Arthritis (Sandhivata)",
      "Back Pain (Kati Shoola)",
      "Muscle Pain & Stiffness"
    ]
  },
  "chyawanprash": {
    synonyms: ["chyawanprash"],
    indications: [
      "Immunity Support",
      "Fatigue & Low Energy",
      "Cough & Cold",
      "Children's Health"
    ]
  },
  "khadira": {
    synonyms: ["khadira"],
    indications: [
      "Skin Care & Glow",
      "Eczema & Psoriasis (Kushtha)",
      "Oral & Dental Health"
    ]
  },
  "bakuchi": {
    synonyms: ["bakuchi"],
    indications: [
      "Eczema & Psoriasis (Kushtha)",
      "Pigmentation & Dark Spots",
      "Skin Care & Glow"
    ]
  },
  "karanja": {
    synonyms: ["karanja"],
    indications: [
      "Skin Care & Glow",
      "Eczema & Psoriasis (Kushtha)",
      "Wound Healing"
    ]
  },
  "kushtha": {
    synonyms: ["kushtha"],
    indications: [
      "Skin Care & Glow",
      "Eczema & Psoriasis (Kushtha)",
      "Cough & Cold"
    ]
  },
  "sarshapa": {
    synonyms: ["sarshapa"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Skin Care & Glow"
    ]
  },
  "eranda": {
    synonyms: ["eranda", "castor"],
    indications: [
      "Constipation (Vibandha)",
      "Joint Pain & Arthritis (Sandhivata)",
      "Back Pain (Kati Shoola)",
      "Muscle Pain & Stiffness"
    ]
  },
  "loha bhasma": {
    synonyms: ["loha bhasma"],
    indications: [
      "Anemia (Pandu Roga)",
      "Fatigue & Low Energy",
      "Liver Health & Detox"
    ]
  },
  "shankha bhasma": {
    synonyms: ["shankha bhasma"],
    indications: [
      "Acid Reflux (Amlapitta)",
      "Hyperacidity & Ulcers",
      "Digestive Issues (Agnimandya)",
      "Gas & Bloating (Adhmana)"
    ]
  },
  "praval pishti": {
    synonyms: ["praval pishti"],
    indications: [
      "Acid Reflux (Amlapitta)",
      "Hyperacidity & Ulcers",
      "Fever (Jwara)"
    ]
  },
  "lodhra": {
    synonyms: ["lodhra"],
    indications: [
      "Women's Hormonal Balance",
      "Menstrual Cramps (Kashtartava)",
      "PCOS/PCOD Support",
      "Skin Care & Glow"
    ]
  },
  "ashoka": {
    synonyms: ["ashoka"],
    indications: [
      "Women's Hormonal Balance",
      "Menstrual Cramps (Kashtartava)",
      "PCOS/PCOD Support",
      "Fertility & Reproductive Health"
    ]
  },
  "karela": {
    synonyms: ["karela"],
    indications: [
      "Diabetes Care (Madhumeha)",
      "Blood Pressure Support",
      "Obesity (Sthaulya)"
    ]
  },
  "jamun": {
    synonyms: ["jamun"],
    indications: [
      "Diabetes Care (Madhumeha)",
      "Digestive Issues (Agnimandya)",
      "Cholesterol & Lipid Balance"
    ]
  },
  "gudmar": {
    synonyms: ["gudmar"],
    indications: [
      "Diabetes Care (Madhumeha)",
      "Weight Management",
      "Obesity (Sthaulya)"
    ]
  },
  "vijaysar": {
    synonyms: ["vijaysar"],
    indications: [
      "Diabetes Care (Madhumeha)",
      "Weight Management",
      "Cholesterol & Lipid Balance"
    ]
  },
  "panchatikta": {
    synonyms: ["panchatikta"],
    indications: [
      "Eczema & Psoriasis (Kushtha)",
      "Acne & Pimples (Yauvana Pidika)",
      "Detoxification (Panchakarma Support)",
      "Fever (Jwara)"
    ]
  },
  "sariva": {
    synonyms: ["sariva", "anantmool"],
    indications: [
      "Skin Care & Glow",
      "Eczema & Psoriasis (Kushtha)",
      "Kidney & Urinary Health",
      "Detoxification (Panchakarma Support)"
    ]
  },
  "patol": {
    synonyms: ["patol"],
    indications: [
      "Liver Health & Detox",
      "Skin Care & Glow",
      "Fever (Jwara)"
    ]
  },
  "kanchanar": {
    synonyms: ["kanchanar"],
    indications: [
      "PCOS/PCOD Support",
      "Weight Management"
    ]
  },
  "varuna": {
    synonyms: ["varuna"],
    indications: [
      "Kidney & Urinary Health",
      "Urinary Tract Infections (Mutrakrichha)"
    ]
  },
  "moringa": {
    synonyms: ["moringa", "shigru"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Fatigue & Low Energy",
      "Bone Health & Osteoporosis",
      "Immunity Support"
    ]
  },
  "hadjod": {
    synonyms: ["hadjod"],
    indications: [
      "Bone Health & Osteoporosis",
      "Joint Pain & Arthritis (Sandhivata)",
      "Wound Healing"
    ]
  },
  "bhumyamalaki": {
    synonyms: ["bhumyamalaki", "bhumi amla", "bhumi amlaki"],
    indications: [
      "Liver Health & Detox",
      "Kidney & Urinary Health",
      "Diabetes Care (Madhumeha)",
      "Fever (Jwara)"
    ]
  },
  "japa": {
    synonyms: ["japa", "hibiscus"],
    indications: [
      "Hair Loss (Khalitya)",
      "Premature Greying",
      "Dandruff & Scalp Issues"
    ]
  },
  "kumkumadi": {
    synonyms: ["kumkumadi"],
    indications: [
      "Skin Care & Glow",
      "Pigmentation & Dark Spots",
      "Acne & Pimples (Yauvana Pidika)"
    ]
  },
  "kesar": {
    synonyms: ["kesar", "saffron"],
    indications: [
      "Skin Care & Glow",
      "Stress & Anxiety",
      "Men's Vitality & Stamina",
      "Fatigue & Low Energy"
    ]
  },
  "chandana": {
    synonyms: ["chandana", "sandalwood"],
    indications: [
      "Skin Care & Glow",
      "Stress & Anxiety",
      "Eczema & Psoriasis (Kushtha)",
      "Dry Skin"
    ]
  },
  "ushira": {
    synonyms: ["ushira", "vetiver"],
    indications: [
      "Stress & Anxiety",
      "Skin Care & Glow",
      "Fever (Jwara)"
    ]
  },
  "nirgundi": {
    synonyms: ["nirgundi"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Muscle Pain & Stiffness",
      "Back Pain (Kati Shoola)"
    ]
  },
  "rasna": {
    synonyms: ["rasna"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Muscle Pain & Stiffness",
      "Gout (Vatarakta)"
    ]
  },
  "vasaka": {
    synonyms: ["vasaka", "vasa"],
    indications: [
      "Asthma & Bronchitis (Shwasa Roga)",
      "Cough & Cold"
    ]
  },
  "shallaki": {
    synonyms: ["shallaki"],
    indications: [
      "Joint Pain & Arthritis (Sandhivata)",
      "Muscle Pain & Stiffness",
      "Back Pain (Kati Shoola)"
    ]
  },
  "chirayata": {
    synonyms: ["chirayata"],
    indications: [
      "Fever (Jwara)",
      "Liver Health & Detox",
      "Skin Care & Glow",
      "Immunity Support"
    ]
  },
  "indrayava": {
    synonyms: ["indrayava"],
    indications: [
      "Diarrhea & Loose Motions (Atisara)",
      "Digestive Issues (Agnimandya)",
      "Eczema & Psoriasis (Kushtha)"
    ]
  },
  "priyangu": {
    synonyms: ["priyangu"],
    indications: [
      "Skin Care & Glow",
      "Diarrhea & Loose Motions (Atisara)"
    ]
  }
};

async function main() {
  try {
    // 1. Fetch all preparations and indications from the DB
    const dbPreparations = await db.preparation.findMany();
    const dbIndications = await db.indication.findMany();

    // Create a map of indication name to its ID
    const indicationMap = new Map<string, number>();
    dbIndications.forEach(ind => {
      indicationMap.set(ind.name.toLowerCase().trim(), ind.id);
    });

    console.log(`Starting mapping of indications to ${dbPreparations.length} preparations...`);

    let totalUpdated = 0;

    for (const prep of dbPreparations) {
      const prepNameLower = prep.name.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      const matchedIndicationIds: number[] = [];
      const matchedHerbNames: string[] = [];

      // Find which herbs match the preparation name
      for (const [herbKey, config] of Object.entries(herbToIndications)) {
        let isMatched = false;
        
        // Check all synonyms
        for (const syn of config.synonyms) {
          const formattedSyn = syn.toLowerCase();
          
          // Use boundary matching or simple word matching to avoid false positives
          // e.g. "amla" shouldn't match "amalaki" incorrectly, but here "amla" is a synonym of "amalaki".
          // We can check if the name contains the synonym as a word
          const regex = new RegExp(`\\b${formattedSyn}\\b|${formattedSyn}`, 'i');
          if (regex.test(prepNameLower)) {
            isMatched = true;
            break;
          }
        }

        if (isMatched) {
          matchedHerbNames.push(herbKey);
          for (const indName of config.indications) {
            const indId = indicationMap.get(indName.toLowerCase().trim());
            if (indId !== undefined && !matchedIndicationIds.includes(indId)) {
              matchedIndicationIds.push(indId);
            }
          }
        }
      }

      if (matchedIndicationIds.length > 0) {
        // Update the preparation's indications in the database
        await db.preparation.update({
          where: { id: prep.id },
          data: {
            indications: {
              set: matchedIndicationIds.map(id => ({ id }))
            }
          }
        });
        console.log(`Updated [${prep.name}]: Associated with ${matchedIndicationIds.length} indications via herbs: ${matchedHerbNames.join(', ')}`);
        totalUpdated++;
      } else {
        console.warn(`No matching herbs found for preparation: [${prep.name}]`);
      }
    }

    console.log(`\nSuccessfully mapped and updated ${totalUpdated} preparations.`);
  } catch (e) {
    console.error("Error during mapping:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
