import { generalNotesFor } from "./knowledge";
import type { CoachContext, Product, RiskFlag } from "./types";

/**
 * Regelbasierter Coach für den Demo-Modus (kein OPENAI_API_KEY) und als
 * Notfall-Antwort, falls die KI nicht erreichbar ist. Liefert dasselbe
 * Marker-Format wie die KI.
 */

const OBJECTION_REPLY: Record<string, { say: string; question: string; bridge: string }> = {
  "genug-produkte": {
    say: "Das verstehe ich gut, [Name]. Viele meiner Kunden haben schon einiges zu Hause. Mir geht es nur darum, ob das, was Sie haben, auch wirklich zu Ihnen passt.",
    question: "Darf ich fragen, welche Produkte Sie im Moment regelmäßig nehmen?",
    bridge: "Wenn es eine sinnvolle Ergänzung gibt, sage ich es Ihnen – und wenn nicht, dann sage ich Ihnen das genauso ehrlich.",
  },
  medikamente: {
    say: "Das ist ein ganz wichtiger Punkt, [Name], danke, dass Sie das sagen. Bei mehreren Medikamenten sollte man nichts einfach dazunehmen, ohne es abzustimmen.",
    question: "Welche Medikamente nehmen Sie denn regelmäßig, zum Beispiel etwas zur Blutverdünnung?",
    bridge: "Ich kann Ihnen die Produktinformationen gern zuschicken, dann können Sie das in Ruhe mit Ihrem Arzt oder Apotheker besprechen.",
  },
  "zu-teuer": {
    say: "Das verstehe ich, [Name]. Es soll ja auch ins Budget passen. Lassen Sie uns kurz schauen, was das tatsächlich pro Tag ausmacht.",
    question: "Was wäre Ihnen denn für so etwas im Monat wichtig – eher eine kleine Packung zum Ausprobieren?",
    bridge: "Ich schaue gern nach, welche Packungsgröße für Sie am sinnvollsten ist, und rechne es Ihnen ehrlich aus.",
  },
  "brauche-nicht": {
    say: "Das ist völlig in Ordnung, [Name]. Ich möchte Ihnen auch nichts aufdrängen, was Sie nicht brauchen.",
    question: "Darf ich nur kurz fragen: Gibt es etwas, das Sie im Alltag im Moment stört oder das Sie gern verbessern würden?",
    bridge: "Wenn nichts davon zutrifft, ist das doch eine gute Nachricht – dann wünsche ich Ihnen weiterhin alles Gute.",
  },
  "keine-beschwerden": {
    say: "Das freut mich wirklich, [Name], das hört man gern. Viele Kunden nutzen unsere Produkte, um ihre Ernährung gezielt zu ergänzen.",
    question: "Wie sieht es denn mit Ihrer Ernährung aus – essen Sie zum Beispiel regelmäßig Fisch oder viel Gemüse?",
    bridge: "Wenn Sie möchten, sage ich Ihnen kurz, was da sinnvoll sein könnte – ganz unverbindlich.",
  },
  "keine-zeit": {
    say: "Natürlich, [Name], ich halte mich ganz kurz. Nur eine Frage, dann entscheiden Sie.",
    question: "Passt es Ihnen besser, wenn ich zu einer anderen Uhrzeit noch einmal kurz anrufe?",
    bridge: "Dann notiere ich mir eine Zeit, die Ihnen passt – oder wir machen es jetzt in einer Minute.",
  },
  "staendig-angerufen": {
    say: "Das kann ich gut verstehen, [Name], das ist wirklich lästig. Wenn Sie keine Anrufe mehr möchten, trage ich das sofort für Sie ein.",
    question: "Möchten Sie, dass wir Sie nicht mehr anrufen?",
    bridge: "Wenn Sie keine Anrufe mehr wünschen, ist das selbstverständlich in Ordnung – ich notiere es sofort. Ansonsten halte ich mich ganz kurz.",
  },
  ueberlegen: {
    say: "Sehr gern, [Name], das ist eine vernünftige Entscheidung. Sie sollen sich ja wohlfühlen.",
    question: "Gibt es etwas Bestimmtes, das Sie noch wissen möchten, damit Sie gut entscheiden können?",
    bridge: "Wenn es Ihnen recht ist, melde ich mich in ein paar Tagen noch einmal kurz – passt Ihnen eher vormittags oder nachmittags?",
  },
  "arzt-fragen": {
    say: "Das finde ich sehr gut, [Name]. Ihr Arzt kennt Sie am besten, und das ist genau der richtige Weg.",
    question: "Soll ich Ihnen die Produktinformationen mit den Inhaltsstoffen zuschicken, damit Sie sie mitnehmen können?",
    bridge: "Dann melde ich mich nach Ihrem Arzttermin gern noch einmal – wann haben Sie den Termin?",
  },
  "nichts-bestellen": {
    say: "Das respektiere ich selbstverständlich, [Name]. Vielen Dank, dass Sie sich die Zeit genommen haben.",
    question: "Darf ich Sie in Zukunft noch einmal kontaktieren, oder möchten Sie lieber keine Anrufe mehr?",
    bridge: "Dann wünsche ich Ihnen alles Gute und einen schönen Tag, [Name].",
  },
};

const COMPLAINT_QUESTION: Record<string, string> = {
  augen: "Sind Sie wegen Ihrer Augen in augenärztlicher Behandlung, und hat Ihr Augenarzt Ihnen schon etwas empfohlen?",
  gelenke: "Seit wann haben Sie die Beschwerden, und waren Sie damit schon beim Arzt?",
  muedigkeit: "Wie ernähren Sie sich denn – essen Sie zum Beispiel Fleisch und Milchprodukte?",
  muskeln: "Wann treten die Krämpfe auf – eher nachts oder auch tagsüber?",
  gedaechtnis: "Nehmen Sie Medikamente zur Blutverdünnung, zum Beispiel Marcumar oder ASS?",
  prostata: "Waren Sie damit schon beim Urologen?",
  blase: "Haben Sie dabei auch Schmerzen oder Brennen? Dann sollte das unbedingt ein Arzt anschauen.",
  immun: "Wie oft sind Sie denn im Jahr erkältet?",
  herbst: "Wie oft kommen Sie im Herbst und Winter an die frische Luft und in die Sonne?",
  haut: "Seit wann haben Sie das, und haben Sie es schon ärztlich abklären lassen?",
  verdauung: "Was macht Ihnen bei der Verdauung am meisten zu schaffen?",
  herz: "Nehmen Sie Medikamente für Herz oder Blutdruck?",
  schlaf: "Ist es eher das Einschlafen oder das Durchschlafen?",
};

const ACTION_REPLY: Record<string, string> = {
  kuerzer: "Ich verstehe Sie, [Name]. Darf ich Ihnen kurz etwas Passendes vorstellen?",
  einfacher: "Ganz einfach gesagt, [Name]: Ich möchte nur wissen, was Sie brauchen. Dann sage ich Ihnen ehrlich, ob wir etwas Passendes haben.",
  "kunde-lehnt-ab": "Das ist völlig in Ordnung, [Name]. Vielen Dank für Ihre Zeit, und ich wünsche Ihnen alles Gute.",
  preis: "Ich rechne Ihnen das gern ehrlich aus, [Name] – dann sehen Sie, was es pro Tag ausmacht, und entscheiden ganz in Ruhe.",
  abschluss: "Wenn Sie möchten, [Name], schicke ich Ihnen das gern zu. Soll ich das so für Sie notieren?",
  "mehr-argumente": "Das Schöne ist, [Name]: Sie können ganz in Ruhe schauen, ob es zu Ihnen passt. Und bei Fragen bin ich jederzeit für Sie da.",
};

export function fallbackAnswer(opts: {
  products: Product[];
  ctx: CoachContext;
  risks: RiskFlag[];
  actionId?: string;
}): string {
  const { products, ctx, risks, actionId } = opts;
  const obj = ctx.objection ? OBJECTION_REPLY[ctx.objection] : undefined;
  const blocked = risks.some((r) => ["krebs", "notfall", "geschaeftsfaehigkeit", "schwanger"].includes(r.id));
  const anticoagulant = risks.some((r) => r.id === "blutverduenner");
  const affectsClotting = (p: Product) =>
    generalNotesFor(p).some((n) => n.notes.some((t) => /blutverd|marcumar|blutgerinnung/i.test(t)));
  const declined = actionId === "kunde-lehnt-ab" || ctx.objection === "nichts-bestellen" || ctx.objection === "staendig-angerufen";

  const say =
    (actionId && ACTION_REPLY[actionId]) ||
    obj?.say ||
    "Danke, dass Sie mir das erzählen, [Name]. Ich möchte Ihnen nur etwas vorschlagen, das wirklich zu Ihnen passt.";

  const firstComplaint = ctx.complaints.find((c) => COMPLAINT_QUESTION[c]);
  const question = obj?.question || (firstComplaint ? COMPLAINT_QUESTION[firstComplaint] : "Was ist Ihnen im Moment am wichtigsten für Ihre Gesundheit?");
  const bridge = declined
    ? "Vielen Dank für das Gespräch, [Name]. Ich wünsche Ihnen alles Gute."
    : obj?.bridge || "Wenn Sie möchten, stelle ich Ihnen kurz ein Produkt vor, das dazu passen könnte – ganz unverbindlich.";

  const matches =
    blocked || declined
      ? []
      : products
          .filter((p) => !(anticoagulant && affectsClotting(p)))
          .map((p) => ({ p, score: p.categories.filter((c) => ctx.complaints.includes(c)).length + (p.verified ? 0.5 : 0) }))
          .filter((x) => x.score >= 1)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

  const hints = risks.map((r) => `- ${r.title} – siehe Warnhinweis oben.`);
  if (matches.some((m) => !m.p.verified)) hints.push("- Produktdaten noch nicht verifiziert: keine Inhaltsstoffe, Dosierungen oder Preise nennen, bevor sie geprüft sind.");
  hints.push("- Demo-Modus: regelbasierte Antwort ohne KI (OPENAI_API_KEY fehlt oder KI nicht erreichbar).");

  return [
    "[SAGEN]",
    say,
    "[PRODUKTE]",
    matches.length ? matches.map((m) => `${m.p.id} | passt zur Kategorie ${m.p.categories.join(", ")}`).join("\n") : "keine",
    "[FRAGE]",
    question,
    "[UEBERLEITUNG]",
    bridge,
    "[HINWEISE]",
    hints.join("\n"),
  ].join("\n");
}
