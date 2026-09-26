// Demoflow uit sectie 10 van het plan, van cliënt tot psycholoog.
// Gebruik: npm run dev (of npm run build && npm start), daarna npm run test:demo
// BASE_URL en CHROME_PATH kan je overschrijven.
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const B = process.env.BASE_URL ?? "http://localhost:3000";
const chrome =
  process.env.CHROME_PATH ??
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/opt/pw-browsers/chromium", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
let failures = 0;
const ok = (name, cond) => {
  if (!cond) failures += 1;
  console.log(cond ? "PASS" : "FAIL", name);
};
const wait = (ms) => page.waitForTimeout(ms);
const text = () => page.evaluate(() => document.body.innerText);

const SECRET = "GEHEIMZIN enkel voor mij";
const PRIVATE_NOTE = "Aandachtspunt: relatie met moeder";

// ------------------------------------------------------------------ Cliënt

await page.goto(B + "/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.click("button[type=submit]");
await page.waitForURL("**/c/welkom");
ok("onboarding bij de eerste keer", await page.isVisible("text=Welkom, Lotte"));
await page.click("text=Volgende");
await wait(350);
ok("onboarding legt delen uit", await page.isVisible("text=Enkel voor mij"));
await page.click("text=Volgende");
await wait(350);
await page.click("text=Aan de slag");
await page.waitForURL("**/c/vandaag");
await wait(400);

// 1. Check-in
await page.click("role=radio[name=/Rustig/]");
await wait(300);
await page.fill("textarea[aria-label='Wil je er iets bij zeggen?']", "Demo check-in: rustige ochtend.");
await page.click("button:has-text('Bewaren')");
await wait(500);
ok("check-in bewaard, compacte samenvatting", await page.isVisible("text=Vandaag:"));

// 2. Opdracht invullen in een sheet
const row = page.locator("li", { hasText: "Gedachtenschema" });
ok("eenmalige opdracht staat in Voor vandaag", (await row.count()) > 0);
await row.getByRole("button", { name: "Invullen" }).click();
await wait(400);
await page.fill("textarea[aria-label='Je antwoord']", "Demo antwoord: ik dacht dat ik tekortschoot.");
await page.click("role=dialog >> button:has-text('Bewaren')");
await wait(500);
ok("opdracht afgewerkt", (await page.locator("li", { hasText: "Gedachtenschema" }).getByRole("button", { name: "Invullen" }).count()) === 0);

// 3. Vrije notitie, gedeeld, en meenemen naar de sessie
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
await page.click("text=Schrijf iets");
await page.waitForURL("**/c/logboek/**");
await wait(600);
await page.keyboard.type("Demo gedeeld: vandaag de trein genomen zonder paniek.", { delay: 4 });
await wait(900);
await page.click("text=Neem mee naar de sessie");
await wait(400);
ok("label Op de agenda", await page.isVisible("text=/Op de agenda voor/"));

// 4. Niet-gedeelde notitie, ook meegenomen (enkel als geheugensteun)
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
await page.click("text=Schrijf iets");
await page.waitForURL("**/c/logboek/**");
await wait(600);
await page.keyboard.type(SECRET, { delay: 4 });
await page.click("role=switch[name=/Delen met/]");
await wait(900);
await page.click("text=Neem mee naar de sessie");
await wait(300);
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
ok("beide entries in het logboek", (await text()).includes("Demo gedeeld") && (await text()).includes("GEHEIMZIN"));
ok("opdracht-antwoord staat in het logboek", (await text()).includes("Demo antwoord"));

// 5. Sessies: vraag op Voor volgende keer, reactie op de laatste sessie
await page.goto(B + "/c/sessies", { waitUntil: "networkidle" });
await page.fill("input[placeholder^='Typ een vraag']", "Demo vraag voor de sessie");
await page.keyboard.press("Enter");
await wait(300);
ok("vraag op Voor volgende keer", await page.isVisible("text=Demo vraag voor de sessie"));
await page.locator("a[href^='/c/sessies/']").first().click();
await page.waitForURL("**/c/sessies/**");
await wait(600);
await page.locator(".ProseMirror").last().click();
await page.keyboard.press("Control+End");
await page.keyboard.press("Enter");
await page.keyboard.type("Demo reactie op de sessie.", { delay: 4 });
await wait(900);

// Nooit privénotities van de psycholoog aan cliëntkant
let leak = false;
for (const p of ["/c/vandaag", "/c/logboek", "/c/sessies", "/c/opdrachten", "/c/betalingen", "/c/privacy", "/c/profiel", "/c/herinneringen"]) {
  await page.goto(B + p, { waitUntil: "networkidle" });
  await wait(250);
  if ((await text()).includes(PRIVATE_NOTE)) leak = true;
}
await page.goto(B + "/c/sessies", { waitUntil: "networkidle" });
const sessionLinks = await page.$$eval("a[href^='/c/sessies/']", (as) => as.map((a) => a.getAttribute("href")));
for (const href of sessionLinks) {
  await page.goto(B + href, { waitUntil: "networkidle" });
  await wait(250);
  if ((await text()).includes(PRIVATE_NOTE) || (await text()).includes("Sessienotities")) leak = true;
}
ok("sessienotities nergens aan cliëntkant", !leak);

// ------------------------------------------------------------------ Psycholoog

await page.goto(B + "/p/vandaag", { waitUntil: "networkidle" });
await wait(400);
const vandaag = await text();
ok("Vandaag toont de gedeelde notitie", vandaag.includes("Demo gedeeld"));
ok("Vandaag toont het opdracht-antwoord", vandaag.includes("Demo antwoord"));
ok("Vandaag toont de check-in", vandaag.includes("Demo check-in"));
ok("Vandaag toont de reactie", vandaag.includes("Demo reactie"));
ok("Vandaag toont niets privés", !vandaag.includes("GEHEIMZIN"));

await page.goto(B + "/p/clienten/c1", { waitUntil: "networkidle" });
await wait(400);
const overzicht = await text();
ok("dossier: Voor volgende keer met vraag en entry", overzicht.includes("Demo vraag") && overzicht.includes("Demo gedeeld"));
ok("dossier: privé-entry staat niet op de agenda", !overzicht.includes("GEHEIMZIN"));

await page.goto(B + "/p/clienten/c1?tab=logboek", { waitUntil: "networkidle" });
await wait(400);
const logboek = await text();
ok("dossier-logboek toont gedeelde entries", logboek.includes("Demo gedeeld") && logboek.includes("Demo antwoord"));
ok("dossier-logboek toont geen privé-entry", !logboek.includes("GEHEIMZIN"));
ok("geen 'enkel voor mij' bij de psycholoog", !logboek.includes("Enkel voor mij"));

let psyLeak = false;
for (const p of ["/p/clienten", "/p/clienten/c1?tab=sessies", "/p/clienten/c1?tab=opdrachten", "/p/agenda", "/p/facturatie"]) {
  await page.goto(B + p, { waitUntil: "networkidle" });
  await wait(250);
  if ((await text()).includes("GEHEIMZIN")) psyLeak = true;
}
ok("privé-entry nergens bij de psycholoog", !psyLeak);

await page.goto(B + "/p/clienten/c1?tab=sessies", { waitUntil: "networkidle" });
await page.locator("a[href*='/sessies/']").first().click();
await page.waitForURL("**/sessies/**");
await wait(500);
ok("sessiepagina toont de reactie", (await text()).includes("Demo reactie"));
ok("sessiepagina toont privénotities voor de psycholoog", await page.isVisible("text=Enkel voor jou. Nooit zichtbaar voor je cliënt."));

// Geen chat
const html = await page.content();
ok("geen chat-interface", !/typt\.\.\.|gelezen om|chatbericht/i.test(html));

ok("geen fouten in de console", errors.length === 0);
if (errors.length) console.log(errors.slice(0, 5));
await browser.close();
console.log(failures ? `${failures} mislukt` : "Alles geslaagd");
process.exit(failures ? 1 : 0);
