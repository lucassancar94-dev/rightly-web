// Erzeugt data/products.json mit den ersten Produktkandidaten.
// WICHTIG: Es werden bewusst KEINE Inhaltsstoffe, Mengen, Preise oder
// Dosierungen eingetragen, da diese nicht aus offiziellen Herstellerunterlagen
// vorliegen. Bitte über den Admin-Bereich (/admin) ergänzen und dann als
// "verifiziert" markieren.
import { writeFileSync } from "node:fs";

const now = new Date().toISOString();
const NAME_HINT = "Hinweis aus dem Produktnamen abgeleitet – NICHT bestätigt. Vor Verwendung im Gespräch Herstellerunterlagen prüfen.";

const base = (p) => ({
  description: "",
  ingredients: [],
  dosage: "",
  manufacturerInfo: "Aura Natura – Herstellerangaben noch nicht hinterlegt.",
  approvedClaims: [],
  typicalQuestions: [],
  salesArguments: [],
  precautions: [],
  interactions: [],
  price: "",
  offers: [],
  imageUrl: "",
  verified: false,
  source: "Erstanlage ohne Herstellerunterlagen",
  updatedAt: now,
  ...p,
});

const products = [
  base({
    id: "sehkraft-forte",
    name: "Sehkraft Forte",
    categories: ["augen"],
    unverifiedNotes: `Augen-Präparat (Name). Mögliche Inhaltsstoffe wie Lutein/Zeaxanthin, Zink oder Vitamine sind NICHT bestätigt. ${NAME_HINT}`,
    typicalQuestions: [
      { q: "Ersetzt das meine Behandlung beim Augenarzt?", a: "Nein. Die augenärztliche Behandlung hat immer Vorrang. Ein Nahrungsergänzungsmittel kann höchstens eine Ergänzung sein – am besten mit dem Augenarzt absprechen." },
    ],
  }),
  base({
    id: "fermentura-sehkraft-plus",
    name: "Fermentura Sehkraft+",
    categories: ["augen"],
    unverifiedNotes: `Augen-Präparat mit fermentierten Bestandteilen (Name „Fermentura“). Zusammensetzung NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "omega-pur",
    name: "Omega Pur",
    categories: ["herz", "augen", "gedaechtnis"],
    unverifiedNotes: `Vermutlich Omega-3-Fettsäuren (Name). EPA/DHA-Gehalt NICHT bestätigt – Health-Claims zu Herz (ab 250 mg EPA+DHA), Sehkraft und Gehirn (ab 250 mg DHA) erst nach Prüfung verwenden. ${NAME_HINT}`,
  }),
  base({
    id: "magnesium-duo-tag-nacht",
    name: "Magnesium Duo Tag & Nacht",
    categories: ["muskeln", "muedigkeit", "schlaf"],
    unverifiedNotes: `Magnesium-Präparat mit Tag- und Nacht-Kapsel (Name). Magnesiumverbindung, Menge und weitere Inhaltsstoffe der Nacht-Kapsel NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "ginkgo-duo",
    name: "Ginkgo Duo",
    categories: ["gedaechtnis"],
    unverifiedNotes: `Vermutlich Ginkgo-Extrakt (Name). Falls Ginkgo enthalten: Vorsicht bei Blutverdünnern und vor Operationen. Zusammensetzung NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "sibirischer-ginseng",
    name: "Sibirischer Ginseng",
    categories: ["muedigkeit", "immun", "herbst"],
    unverifiedNotes: `Vermutlich Eleutherococcus senticosus (Name). Extraktmenge NICHT bestätigt. Für Pflanzenstoffe gibt es keine zugelassenen Health-Claims. ${NAME_HINT}`,
  }),
  base({
    id: "kurkuma",
    name: "Kurkuma",
    categories: ["gelenke", "verdauung"],
    unverifiedNotes: `Vermutlich Kurkuma/Curcumin (Name). Menge und Zusätze (z. B. Piperin) NICHT bestätigt. Falls enthalten: Vorsicht bei Blutverdünnern, Gallen- und Lebererkrankungen. ${NAME_HINT}`,
  }),
  base({
    id: "fermentura-prosta",
    name: "Fermentura Prosta",
    categories: ["prostata"],
    unverifiedNotes: `Prostata-Präparat mit fermentierten Bestandteilen (Name). Zusammensetzung NICHT bestätigt. Prostatabeschwerden immer urologisch abklären lassen. ${NAME_HINT}`,
  }),
  base({
    id: "prosta-intens",
    name: "Prosta Intens",
    categories: ["prostata", "blase"],
    unverifiedNotes: `Prostata-Präparat (Name). Zusammensetzung NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "blasenwohl-intens",
    name: "Blasenwohl Intens",
    categories: ["blase"],
    unverifiedNotes: `Blasen-Präparat (Name). Zusammensetzung NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "blasenvital",
    name: "BlasenVital",
    categories: ["blase"],
    unverifiedNotes: `Blasen-Präparat (Name). Zusammensetzung NICHT bestätigt. ${NAME_HINT}`,
  }),
  base({
    id: "doloferm",
    name: "Doloferm",
    categories: ["gelenke"],
    unverifiedNotes: `Anwendungsbereich und Zusammensetzung NICHT bestätigt (Name deutet evtl. auf Bewegungsapparat/fermentierte Bestandteile hin). Vor jeder Empfehlung Herstellerunterlagen prüfen. ${NAME_HINT}`,
  }),
  base({
    id: "erekorin-plus",
    name: "Erekorin Plus",
    categories: ["andere"],
    unverifiedNotes: `Vermutlich Präparat für Männer (Name). Zusammensetzung NICHT bestätigt. Achtung: Aussagen zu Potenz/Erektionsstörungen sind für Nahrungsergänzungsmittel nicht zulässig. Bei Herzmedikamenten (insb. Nitraten) ärztliche Rücksprache. ${NAME_HINT}`,
  }),
];

writeFileSync(new URL("../data/products.json", import.meta.url), JSON.stringify(products, null, 2) + "\n");
console.log(`${products.length} Produkte geschrieben.`);
