// Demoflow uit sectie 10 van het plan, van cliënt tot psycholoog.
// Gebruik: npm run dev, daarna npm run test:demo
// BASE_URL en CHROME_PATH kan je overschrijven.
import { chromium } from "playwright-core";
const B = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
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

await page.goto(B + "/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
// Login als cliënt
await page.click("button[type=submit]");
await page.waitForURL("**/c/home");
await wait(500);

// 1. Gedeelde logboekentry via stemming op home
await page.click("role=radio[name=/Rustig/]");
await page.waitForURL("**/c/logboek/**");
await wait(600);
await page.keyboard.type("Demo gedeeld: vandaag de trein genomen zonder paniek.", { delay: 5 });
await wait(900);
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
ok("gedeelde entry in lijst", await page.isVisible("text=Demo gedeeld"));

// 2. Niet-gedeelde entry
await page.click("text=Nieuwe entry");
await page.waitForURL("**/c/logboek/**");
await wait(600);
await page.keyboard.type("GEHEIMZIN enkel voor mij.", { delay: 5 });
await page.click("role=switch");
await wait(900);
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
ok("privé entry in lijst met slot", await page.isVisible("text=GEHEIMZIN"));

// 2b. Lege entry verdwijnt
await page.click("text=Nieuwe entry");
await page.waitForURL("**/c/logboek/**");
await wait(500);
await page.goto(B + "/c/logboek", { waitUntil: "networkidle" });
await wait(300);
const count = await page.locator("a[href^='/c/logboek/']").count();
ok(`lege entry opgeruimd (${count} entries)`, count === 9);

// 3. Opdracht afvinken: meditatie
await page.goto(B + "/c/opdrachten", { waitUntil: "networkidle" });
await page.click("text=Start, 10 min");
await wait(400);
await page.click("text=Ik deed het al");
await wait(500);
ok("meditatie afgevinkt", (await page.locator("role=checkbox[name='Meditatie 10 minuten']").getAttribute("aria-checked")) === "true");

// 4. Tafel: taak toevoegen
await page.goto(B + "/c/tafel/tp1", { waitUntil: "networkidle" });
await wait(500);
await page.click("button:has-text('Taak')");
await wait(200);
await page.keyboard.type("DEMOTAFEL vraag over de examenweek", { delay: 5 });
await wait(900);
// 4b. Lege nieuwe pagina verdwijnt bij verlaten
const before = await page.locator("aside a[href^='/c/tafel/']").count();
await page.click("text=Nieuwe pagina");
await wait(700);
await page.click("aside a[href='/c/tafel/tp3']");
await wait(700);
const after = await page.locator("aside a[href^='/c/tafel/']").count();
ok(`lege Tafel-pagina opgeruimd (${before} -> ${after})`, before === after);

await page.goto(B + "/c/home", { waitUntil: "networkidle" });

// 5. Rolwissel naar psycholoog
await page.click("role=radio[name='Psycholoog']");
await page.waitForURL("**/p/vandaag");
await wait(700);
const vandaag = await page.textContent("main");
ok("Vandaag toont gedeelde entry", vandaag.includes("Demo gedeeld"));
ok("Vandaag toont Tafel-wijziging", vandaag.includes("DEMOTAFEL") || vandaag.includes("Vragen voor volgende keer"));
ok("Vandaag toont afgevinkte meditatie", vandaag.includes("Meditatie 10 minuten gedaan"));
ok("Vandaag toont GEEN privé entry", !vandaag.includes("GEHEIMZIN"));

await page.goto(B + "/p/clienten/c1?tab=tijdlijn", { waitUntil: "networkidle" });
await wait(500);
const tl = await page.textContent("main");
ok("Tijdlijn toont entry + tafel + opdracht", tl.includes("Demo gedeeld") && tl.includes("DEMOTAFEL") && tl.includes("Meditatie 10 minuten gedaan"));
ok("Tijdlijn toont GEEN privé entry", !tl.includes("GEHEIMZIN"));

await page.goto(B + "/p/clienten/c1?tab=logboek", { waitUntil: "networkidle" });
await wait(400);
ok("Logboek-tab zonder privé entry", !(await page.textContent("main")).includes("GEHEIMZIN"));

// 6. Tafel bij psycholoog: nieuw-markering
await page.goto(B + "/p/clienten/c1/tafel/tp1", { waitUntil: "networkidle" });
await wait(500);
ok("psycholoog ziet nieuw-markering", await page.isVisible("text=/nieuwe? blok/"));
ok("nieuw blok gemarkeerd", (await page.locator(".hk-new").count()) > 0);

// 7. Sessienotities nooit in cliëntomgeving
await page.goto(B + "/c/home", { waitUntil: "networkidle" });
let leak = false;
for (const p of ["/c/home", "/c/tafel", "/c/logboek", "/c/opdrachten", "/c/afspraken", "/c/betalingen", "/c/profiel"]) {
  await page.goto(B + p, { waitUntil: "networkidle" });
  await wait(300);
  const t = await page.textContent("body");
  if (t.includes("Opvallend rustiger") || t.includes("Aandachtspunt")) leak = true;
}
ok("geen sessienotities in cliëntomgeving", !leak);

// 8. Geen chat
const html = await page.content();
ok("geen chat-elementen", !/typt\.\.\.|gelezen|chat/i.test(html));

if (errors.length) console.log("ERRORS:\n" + [...new Set(errors)].join("\n"));
if (failures) process.exitCode = 1;
await browser.close();
