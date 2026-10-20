import type { CoachContext, RiskFlag } from "./types";

type Rule = RiskFlag & { patterns: RegExp[]; objection?: string };

/**
 * Deterministische Warnregeln. Sie greifen IMMER – auch wenn die KI ausfällt
 * oder etwas übersieht. Die KI erhält die erkannten Flags zusätzlich im Prompt.
 */
const RULES: Rule[] = [
  {
    id: "blutverduenner",
    level: "danger",
    title: "Blutverdünner",
    text: "Kunde nimmt Blutverdünner: Ginkgo, Omega-3 (hochdosiert), Kurkuma, Vitamin K, Sägepalme und Cranberry nur nach ärztlicher Rücksprache. Keine Empfehlung ohne Hinweis auf den Arzt.",
    patterns: [
      /blutverd[üu]nn/i,
      /marcumar|phenprocoumon|falithrom|warfarin|xarelto|rivaroxaban|eliquis|apixaban|pradaxa|dabigatran|lixiana|edoxaban|clopidogrel|plavix|brilique|ticagrelor/i,
      /\bASS\b/,
      /aspirin|gerinnungshemm|antikoagul/i,
    ],
  },
  {
    id: "krebs",
    level: "danger",
    title: "Krebserkrankung / Krebstherapie",
    text: "Bei Krebserkrankung, Chemo-, Strahlen- oder Hormontherapie: KEINE Produktempfehlung ohne Rücksprache mit dem behandelnden Onkologen. Nahrungsergänzungen können Therapien beeinflussen.",
    patterns: [/krebs|tumor|chemo|bestrahl|strahlentherap|onkolog|metastas|karzinom|leuk[äa]mie|lymphom/i],
  },
  {
    id: "makula-feucht",
    level: "warn",
    title: "Feuchte Makuladegeneration / Augenbehandlung",
    text: "Die augenärztliche Behandlung (z. B. Spritzen ins Auge) hat absoluten Vorrang. Nahrungsergänzung höchstens als Ergänzung nach Rücksprache mit dem Augenarzt – keine Heilung oder Behandlung versprechen.",
    patterns: [/feucht\w*\s+makula|makula\w*\s+feucht|spritze\w*\s+(ins|in das|ins)\s+auge|augenspritze|anti-?vegf|lucentis|eylea|vabysmo|ivom/i],
  },
  {
    id: "medikamente",
    level: "warn",
    title: "Mehrere Medikamente",
    text: "Bei regelmäßiger Einnahme mehrerer Medikamente: Empfehlen, die Ergänzung vorab mit Hausarzt oder Apotheke abzustimmen. Nicht kleinreden.",
    patterns: [/viele\s+medikament|mehrere\s+medikament|medikamente\s+nehm|tabletten|medikation/i],
    objection: "medikamente",
  },
  {
    id: "op",
    level: "warn",
    title: "Operation",
    text: "Bei kürzlicher oder geplanter Operation: Ergänzungen mit Einfluss auf die Blutgerinnung (z. B. Ginkgo, Omega-3, Kurkuma) nur nach ärztlicher Rücksprache.",
    patterns: [/operation|operiert|\bOP\b|eingriff/i],
  },
  {
    id: "schwanger",
    level: "danger",
    title: "Schwangerschaft / Stillzeit",
    text: "In Schwangerschaft und Stillzeit keine Empfehlung ohne ärztliche Rücksprache.",
    patterns: [/schwanger|stillzeit|stillt\b/i],
  },
  {
    id: "niere-leber",
    level: "warn",
    title: "Nieren- oder Lebererkrankung",
    text: "Bei Nieren- oder Lebererkrankung (insbesondere Dialyse) Nahrungsergänzungen nur nach ärztlicher Rücksprache (z. B. Magnesium, Kurkuma).",
    patterns: [/niere|dialyse|leber/i],
  },
  {
    id: "diabetes",
    level: "info",
    title: "Diabetes",
    text: "Bei Diabetes-Medikamenten (z. B. Insulin, Metformin) auf Präparate mit möglichem Einfluss auf den Blutzucker (z. B. Ginseng, Kurkuma) hinweisen und ärztliche Rücksprache empfehlen.",
    patterns: [/diabet|insulin|metformin|zucker\s*krank|blutzucker/i],
  },
  {
    id: "schilddruese",
    level: "info",
    title: "Schilddrüse",
    text: "Bei L-Thyroxin: Mineralstoffe (Magnesium, Calcium, Eisen) mit mehreren Stunden Abstand einnehmen.",
    patterns: [/schilddr[üu]se|thyroxin|euthyrox|l-thyrox/i],
  },
  {
    id: "notfall",
    level: "danger",
    title: "Mögliches Warnsymptom",
    text: "Bei Brustschmerzen, Atemnot, plötzlichen Sehstörungen, Lähmungen, Blut im Urin, Fieber oder starken Schmerzen: Kein Verkauf. Freundlich, aber deutlich zur sofortigen ärztlichen Abklärung raten (Notfall: 112).",
    patterns: [/brustschmerz|atemnot|l[äa]hmung|pl[öo]tzlich\w*\s+(nicht|schlecht)\w*\s+seh|blut\s+im\s+urin|fieber|starke\s+schmerz|schlaganfall|herzinfarkt/i],
  },
  {
    id: "geschaeftsfaehigkeit",
    level: "danger",
    title: "Geschäftsfähigkeit fraglich",
    text: "Hinweise auf Demenz, Verwirrtheit oder gesetzliche Betreuung: KEINEN Abschluss tätigen. Gespräch freundlich beenden bzw. ggf. Angehörige/Betreuer einbeziehen.",
    patterns: [/demenz|alzheimer|verwirrt|betreuer|betreuung|vormund/i],
  },
  {
    id: "kein-kontakt",
    level: "warn",
    title: "Werbewiderspruch beachten",
    text: "Möchte der Kunde keine Anrufe mehr: Wunsch sofort respektieren und Sperrvermerk zusagen (UWG § 7, DSGVO Art. 21). Kein weiterer Verkaufsversuch.",
    patterns: [/nicht\s+mehr\s+anrufen|keine\s+anrufe|aus\s+der\s+liste|sperrvermerk|werbewiderspruch/i],
    objection: "staendig-angerufen",
  },
  {
    id: "vegetarisch",
    level: "info",
    title: "Vegetarische/vegane Ernährung",
    text: "Bei fleischloser Ernährung und Müdigkeit: Ernährungsweise genauer erfragen; Vitamin B12 kann ein Thema sein. Anhaltende Müdigkeit ärztlich abklären lassen (Blutbild).",
    patterns: [/vegan|vegetar|kein\s+fleisch|esse?\s+kein\w*\s+fleisch/i],
  },
];

export function detectRisks(texts: string[], ctx?: Partial<CoachContext>): RiskFlag[] {
  const joined = texts.join("\n");
  const hits: RiskFlag[] = [];
  for (const rule of RULES) {
    const textHit = rule.patterns.some((p) => p.test(joined));
    const objectionHit = rule.objection && ctx?.objection === rule.objection;
    if (textHit || objectionHit) {
      hits.push({ id: rule.id, level: rule.level, title: rule.title, text: rule.text });
    }
  }
  const order = { danger: 0, warn: 1, info: 2 } as const;
  return hits.sort((a, b) => order[a.level] - order[b.level]);
}
