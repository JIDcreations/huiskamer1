// Loopt elke route af op 375, 768 en 1440px en controleert:
// geen horizontale scroll, elke knop en link heeft een naam, elk beeld een alt.
// Gebruik: npm run build && npm start, daarna npm run test:layout
// SHOTS=<map> bewaart ook een screenshot per route en breedte.
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const B = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS;
const chrome =
  process.env.CHROME_PATH ??
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/opt/pw-browsers/chromium", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

// Eén keer aanmelden en de onboarding doorlopen, zodat alle cliëntroutes open staan.
await page.goto(B + "/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.click("button[type=submit]");
await page.waitForURL("**/c/welkom");
await page.click("text=Volgende");
await page.waitForTimeout(350);
await page.click("text=Volgende");
await page.waitForTimeout(350);
await page.click("text=Aan de slag");
await page.waitForURL("**/c/vandaag");

const firstLink = async (from, prefix) => {
  await page.goto(B + from, { waitUntil: "networkidle" });
  return page.evaluate((p) => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).find((h) => h.startsWith(p) && h !== p), prefix);
};

const routes = [
  "/",
  "/c/welkom",
  "/c/vandaag",
  "/c/logboek",
  await firstLink("/c/logboek", "/c/logboek/"),
  "/c/sessies",
  await firstLink("/c/sessies", "/c/sessies/"),
  "/c/opdrachten",
  "/c/betalingen",
  "/c/herinneringen",
  "/c/privacy",
  "/c/profiel",
  "/p/vandaag",
  "/p/agenda",
  "/p/clienten",
  "/p/clienten/c1",
  "/p/clienten/c1?tab=logboek",
  "/p/clienten/c1?tab=sessies",
  "/p/clienten/c1?tab=opdrachten",
  "/p/clienten/c1?tab=betalingen",
  await firstLink("/p/clienten/c1?tab=sessies", "/p/clienten/c1/sessies/"),
  "/p/opdrachten",
  "/p/facturatie",
  "/p/instellingen",
].filter(Boolean);

let failures = 0;
for (const width of [375, 768, 1440]) {
  await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
  for (const route of routes) {
    await page.goto(B + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const doc = document.scrollingElement;
      const overflow = doc.scrollWidth - window.innerWidth;
      const wide = overflow > 0
        ? [...document.querySelectorAll("body *")]
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed")
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`)
        : [];
      const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
      const name = (el) =>
        (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title") || el.textContent || "").trim();
      const unnamed = [...document.querySelectorAll("button, a[href], [role=button], [role=tab], [role=radio], input, textarea, select")]
        .filter(visible)
        .filter((el) => {
          if (el.matches("input, textarea, select")) {
            if (el.type === "hidden") return false;
            return !(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("placeholder") || (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest("label"));
          }
          return !name(el) && !el.querySelector("img[alt]:not([alt=''])");
        })
        .slice(0, 5)
        .map((el) => el.outerHTML.slice(0, 120));
      const noAlt = [...document.querySelectorAll("img:not([alt])")].length;
      return { overflow, wide, unnamed, noAlt };
    });
    const problems = [];
    if (r.overflow > 0) problems.push(`horizontale scroll (${r.overflow}px): ${r.wide.join(", ")}`);
    if (r.unnamed.length) problems.push(`zonder naam: ${r.unnamed.join(" | ")}`);
    if (r.noAlt) problems.push(`${r.noAlt} beeld(en) zonder alt`);
    if (problems.length) failures += 1;
    console.log(problems.length ? "FAIL" : "PASS", width, route, problems.join("; "));
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${width}${route.replace(/[/?=]/g, "_")}.png`, fullPage: true });
  }
}

await browser.close();
console.log(failures ? `${failures} probleem/problemen` : "Alles geslaagd");
process.exit(failures ? 1 : 0);
