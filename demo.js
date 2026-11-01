// Scroll-Demo der Startseite: jeder Schritt zeigt einen anderen Chat.
(function () {
  var demo = document.getElementById("demo");
  if (!demo) return;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SZENEN = [
    { titel: "Umformulieren", satz: "aus Stichpunkten wird eine Nachricht", av: "🏠", name: "Hausverwaltung Berger",
      rein: "Guten Tag, gibt es noch Probleme mit der Heizung?", chip: "Professionell ⌃", k: "g",
      tipp: "heizung seit 3 wo aus, bis fr jemand schicken",
      raus: "Guten Tag, die Heizung ist seit 3 Wochen aus. Bitte schicken Sie bis Freitag jemanden vorbei. Vielen Dank!" },
    { titel: "Freundlich", satz: "die Krankmeldung in zwei Sekunden", av: "💼", name: "Chef Markus",
      rein: "Morgen! Bist du um 9 im Büro?", chip: "Freundlich ⌃", k: "g",
      tipp: "bin krank fieber komm heute nich, sag morgen bescheid",
      raus: "Guten Morgen Markus, ich bin heute leider krank und habe Fieber. Ich komme heute nicht und sage dir morgen Bescheid." },
    { titel: "Auf Englisch", satz: "gleiche Nachricht, andere Sprache", av: "🏡", name: "Ana · Ferienwohnung Lissabon",
      rein: "Hi! What time will you arrive?", chip: "Englisch ⌃", k: "y",
      tipp: "wir kommen erst um 22 uhr an, ist das ok?",
      raus: "We won't arrive until 10 pm, is that okay?" },
    { titel: "Was steht da?", satz: "Behördendeutsch einfach erklärt", av: "⚡", name: "Stadtwerke",
      rein: "Hiermit teilen wir Ihnen mit, dass sich Ihr monatlicher Abschlag gemäß Ziffer 4.2 unserer AGB zum 01.01. auf 86 € erhöht, sofern Sie nicht binnen vier Wochen widersprechen.",
      chip: "Kopiert ⌃", k: "p", status: "Text kopiert",
      erklaer: "Ab 1. Januar zahlst du jeden Monat 86 €. Wenn du das nicht willst, musst du innerhalb von 4 Wochen widersprechen." }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var chat = $("demoChat"), feld = $("demoFeld"), erkl = $("demoErklaer");
  var grid = demo.querySelector(".grid"), punkte = demo.querySelectorAll(".punkte i");
  var phone = demo.querySelector(".phone");
  var aktuell = -1, uhren = [];

  function blase(klasse, text) {
    var d = document.createElement("div");
    d.className = klasse; d.textContent = text; chat.appendChild(d);
  }
  function spaeter(fn, ms) { uhren.push(setTimeout(fn, ruhig ? 0 : ms)); }

  function zeige(i) {
    if (i === aktuell) return;
    aktuell = i;
    uhren.forEach(clearTimeout); uhren = [];
    var s = SZENEN[i];
    $("demoTitel").innerHTML = "<b></b>";
    $("demoTitel").firstChild.textContent = s.titel;
    $("demoTitel").appendChild(document.createTextNode(s.satz));
    $("demoAv").textContent = s.av; $("demoName").textContent = s.name;
    $("demoChip").textContent = s.chip; $("demoStatus").textContent = s.status || "Text erkannt";
    punkte.forEach(function (p, n) { p.classList.toggle("an", n === i); });
    chat.innerHTML = ""; erkl.classList.remove("an");
    grid.classList.remove("wahl");
    grid.querySelectorAll(".t").forEach(function (t) { t.classList.toggle("aktiv", t.dataset.k === s.k); });
    blase("bin", s.rein);
    feld.textContent = s.tipp || "Nachricht"; feld.classList.toggle("leer", !s.tipp);
    spaeter(function () { grid.classList.add("wahl"); }, 700);
    spaeter(function () {
      grid.classList.remove("wahl");
      if (s.erklaer) { erkl.lastChild.textContent = s.erklaer; erkl.classList.add("an"); return; }
      feld.textContent = "Nachricht"; feld.classList.add("leer");
      blase("bout", s.raus);
    }, 1500);
  }

  function groesse() {
    phone.style.zoom = Math.min(1, Math.max(0.6, (window.innerHeight - 64 - 120) / 715));
  }
  groesse(); window.addEventListener("resize", groesse);

  var beob = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) { if (e.isIntersecting) zeige(Number(e.target.dataset.i)); });
  }, { rootMargin: "-50% 0px -50% 0px" });
  demo.querySelectorAll(".demo-schritte div").forEach(function (d) { beob.observe(d); });
})();
