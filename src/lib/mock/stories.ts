import type { AppointmentMode, Mood, Rhythm, TaskKind } from "@/lib/types";

/**
 * Het verloop per cliënt over de voorbije drie weken. De seed zet dit om naar echte data rond vandaag.
 * Dagen zijn relatief: -2 is eergisteren. Sessies lopen van oud naar nieuw en eindigen bij de laatste voorbije sessie.
 */

type Author = "psy" | "client";

export type TaskStory = {
  id: string;
  templateId?: string;
  title?: string;
  description?: string;
  kind?: TaskKind;
  rhythm: Exclude<Rhythm, { kind: "eenmalig" }> | { kind: "eenmalig" };
  /** Eenmalig: deadline relatief aan vandaag. */
  dueOffset?: number;
  /** Eenmalig: de dag waarop het gedaan werd. Leeg = nog niet gedaan. */
  doneOffset?: number;
  /** Vandaag al gedaan, om dit uur. */
  doneToday?: string;
  /** Uur waarop de cliënt dit meestal doet. */
  time?: string;
  answers?: string[];
  privateRate?: number;
  /** Index van de sessie waaruit de opdracht komt. */
  from?: number;
  createdDaysAgo?: number;
  archived?: boolean;
  minutes?: number;
  scaleLabel?: string;
};

export type Story = {
  schedule: {
    /** Dag van de week relatief aan vandaag (0 = vandaag). */
    offset: number;
    time: string;
    mode: AppointmentMode;
    biweekly?: boolean;
    weeks?: number[];
    noShow?: number[];
    cancelled?: number[];
    intakeFirst?: boolean;
  };
  sessions: {
    summary: string[];
    reactions?: { by: Author; afterHours: number; lines: string[] }[];
    private?: string[];
  }[];
  tasks: TaskStory[];
  notes: { id: string; day: number; time: string; title?: string; text: string[]; mood?: Mood; tags?: string[]; shared?: boolean; note?: string }[];
  agenda: { by: Author; day: number; text?: string; journalId?: string }[];
  /** Stemming aan het begin en nu. */
  mood: [number, number];
  /** Schuift schaalwaarden op of af. */
  trend?: number;
  /** Kans dat een herhalende opdracht op een dag gedaan wordt. */
  diligence: number;
  checkinRate: number;
  checkinTime: string;
  /** Vandaag al ingecheckt, om dit uur. */
  checkinToday?: string;
  checkinTexts: string[];
  writeTime: string;
};

export const stories: Record<string, Story> = {
  // ------------------------------------------------------------------ Lotte: piekeren en slaap
  c1: {
    schedule: { offset: 2, time: "14:00", mode: "fysiek" },
    sessions: [
      {
        summary: [
          "We keken naar de drukte op het werk en het gevoel altijd bereikbaar te moeten zijn. Na je shift blijven de berichten van collega's binnenkomen, en je lijf staat dan nog aan.",
          "Je slaapt gemiddeld vijf uur. Het piekeren begint meestal rond 22u, als het stil wordt in huis.",
          "> Eerst kijken, dan pas veranderen.",
          "Daarom hou je voorlopig enkel bij hoe je slaapt. Niets aan veranderen, gewoon kijken.",
        ],
        reactions: [{ by: "client", afterHours: 6, lines: ["Dank je. Het voelde goed om het eens allemaal te zeggen."] }],
        private: [
          "Veel spanning, praat snel. Slaapt vijf uur per nacht, piekert vooral 's avonds.",
          "Plan: psycho-educatie rond piekeren, slaaplogboek als eerste stap. Werkcontext (zorg, avondshiften) meenemen.",
        ],
      },
      {
        summary: [
          "Het slaaplogboek toont een patroon: na een late shift slaap je slechter, ook als je moe bent.",
          "We spraken over wat je 's avonds kan doen in plaats van in bed te liggen malen. Je merkte zelf dat <strong>even naar buiten gaan</strong> soms helpt.",
          "Het piekeren krijgt een vaste plek, zodat het niet de hele avond meeneemt.",
        ],
        reactions: [
          { by: "client", afterHours: 50, lines: ["Ik heb het piekermoment één keer geprobeerd. Raar om te piekeren op commando, maar het werkte een beetje."] },
          { by: "psy", afterHours: 67, lines: ["Dat is precies de bedoeling. Het mag raar voelen in het begin."] },
        ],
        private: [
          "Meer ruimte in het verhaal dan vorige keer. Piekeren vooral rond 22u. Slaap licht verbeterd.",
          "Werkdruk en bereikbaarheid na de shift komen steeds terug. Mogelijk thema: grenzen.",
        ],
      },
      {
        summary: [
          "Je vertelde over de avonden, als het huis stil wordt en de gedachten luider. De telefoon in de slaapkamer maakt het moeilijker om los te laten.",
          "Het wandelen lukt goed. Twee of drie keer per week is haalbaar, elke dag niet, en dat is oké.",
          "> Ik hoef niet alles vandaag op te lossen.",
          "Volgende keer willen we het hebben over grenzen stellen op het werk, met een concrete situatie.",
        ],
        reactions: [
          { by: "client", afterHours: 52, lines: ["Woensdag lukte het wandelen niet, het regende. Wel <em>tien minuten</em> op het balkon gezeten. Telt dat ook?"] },
          { by: "psy", afterHours: 68, lines: ["Dat telt zeker. Buiten zijn en even niets moeten: daar gaat het om."] },
          { by: "client", afterHours: 100, lines: ["De telefoon ligt sinds zondag in de keuken. Eerste nacht was raar, nu went het."] },
        ],
        private: [
          "Opvallend rustiger. Vertelt zelf over een moment waarop ze nee zei tegen een collega.",
          "Aandachtspunt: relatie met moeder, ze houdt het nog af. Niet forceren.",
          "Volgende keer: grenzen op het werk, concrete situatie met collega's.",
        ],
      },
    ],
    tasks: [
      { id: "k1", templateId: "tt4", rhythm: { kind: "dagelijks" }, from: 0, time: "07:40", doneToday: "07:40" },
      { id: "k2", templateId: "tt6", rhythm: { kind: "perWeek", times: 3 }, from: 1, time: "19:30" },
      {
        id: "k3",
        templateId: "tt7",
        description: "Een vast moment van 15 minuten, om 19u. Daarbuiten mag het piekeren wachten.",
        rhythm: { kind: "dagen", days: [1, 3, 5] },
        from: 1,
        time: "19:20",
      },
      {
        id: "k4",
        templateId: "tt3",
        rhythm: { kind: "dagen", days: [1, 3, 5] },
        from: 1,
        time: "22:10",
        answers: [
          "De zon op het balkon. Een collega die koffie bracht. Mijn kat.",
          "Warme soep. Een lieve sms van mijn zus. Op tijd thuis.",
          "Een goed gesprek met een patiënt. Nieuwe sokken. Stilte.",
          "Wandelen in de regen, en dat het oké was.",
          "Vroeg gedaan op het werk.\nEen boek dat ik niet kon wegleggen.",
        ],
      },
      {
        id: "k5",
        templateId: "tt5",
        rhythm: { kind: "dagelijks" },
        from: 2,
        time: "22:00",
        answers: ["Onrustig begonnen, rustiger geëindigd.", "", "Twee keer bijna in slaap gevallen.", "", "Mijn hoofd bleef bij het werk. Toch volgehouden."],
      },
      {
        id: "k6",
        templateId: "tt2",
        title: "Gedachtenschema: de zondagavond",
        description: "Neem een zondagavond van deze week. Wat dacht je, wat voelde je, wat deed je? En welke andere gedachte is ook mogelijk?",
        rhythm: { kind: "eenmalig" },
        dueOffset: 2,
        from: 2,
      },
      {
        id: "k7",
        title: "Wat geeft je energie?",
        description: "Maak een kort lijstje van dingen die je energie geven, hoe klein ook.",
        kind: "tekst",
        rhythm: { kind: "eenmalig" },
        dueOffset: -6,
        from: 1,
      },
      {
        id: "k8",
        title: "Telefoon buiten de slaapkamer",
        description: "Leg je telefoon 's avonds in de keuken of de living. Een gewone wekker helpt.",
        kind: "afvinken",
        rhythm: { kind: "eenmalig" },
        dueOffset: -1,
        doneOffset: -3,
        from: 2,
      },
    ],
    notes: [
      { id: "n-c1-1", day: -12, time: "21:40", title: "Zondagavond", text: ["Zondagavond, en dat bekende gevoel in mijn buik. Morgen weer vroege shift.", "Ik lag tot half twee wakker."], mood: 2, tags: ["slaap", "werk"] },
      { id: "n-c1-2", day: -9, time: "18:20", text: ["Na het werk een half uur gewandeld langs de Leie. Niet veel gedacht. Dat was fijn."], mood: 3, tags: ["wandelen"], note: "Mooi dat je het merkt: niet veel denken is ook iets. Hou dat vast." },
      { id: "n-c1-3", day: -6, time: "22:05", title: "Mama", text: ["Ruzie met mama aan de telefoon. Dit wil ik voorlopig voor mezelf houden."], mood: 2, tags: ["familie"], shared: false },
      { id: "n-c1-4", day: -4, time: "08:10", text: ["Drie avonden op rij gewandeld. Sliep donderdag voor het eerst in weken door tot de wekker."], mood: 4, tags: ["wandelen", "slaap"] },
      { id: "n-c1-5", day: -2, time: "20:30", title: "Nee zeggen, bijna", text: ["Collega vroeg of ik zaterdag wilde overnemen. Ik zei dat ik erover zou nadenken in plaats van meteen ja.", "Klein, maar het voelde groot."], mood: 3, tags: ["werk"] },
      { id: "n-c1-6", day: -1, time: "22:40", text: ["Moe vandaag. Niet slecht, gewoon moe."], shared: false },
    ],
    agenda: [
      { by: "client", day: -6, journalId: "n-c1-3" },
      { by: "client", day: -3, text: "Hoe hou ik de wandelingen vol als het donkerder wordt?" },
      { by: "client", day: -2, journalId: "n-c1-5" },
      { by: "psy", day: -1, text: "Neem je slaaplogboek erbij, dan kijken we samen naar het patroon." },
    ],
    mood: [2, 4],
    diligence: 0.75,
    checkinRate: 0.8,
    checkinTime: "21:30",
    checkinTexts: ["Lange shift, maar oké.", "Beter geslapen.", "Hoofd vol vandaag.", "Rustige dag, even niets moeten.", "Veel aan het werk gedacht.", "Gewandeld, dat hielp."],
    writeTime: "21:00",
  },

  // ------------------------------------------------------------------ Arne: rouw
  c2: {
    schedule: { offset: 0, time: "09:30", mode: "fysiek", noShow: [-2] },
    sessions: [
      {
        summary: [
          "We stonden stil bij de eerste maanden na de begrafenis. Je vertelde over de garage van je vader, die je nog niet hebt leeggemaakt.",
          "Er is geen haast. Rouw heeft geen schema, ook al voelt het soms alsof de rest van de wereld dat wel verwacht.",
          "Af en toe schrijf je een herinnering op, hoe klein ook.",
        ],
        reactions: [
          { by: "client", afterHours: 30, lines: ["De garage heb ik nog niet aangeraakt. Wel de radio aangezet die daar staat."] },
          { by: "psy", afterHours: 48, lines: ["Dat is ook een begin, Arne."] },
        ],
        private: [
          "Rouw, vier maanden na het overlijden van zijn vader. Vermijdt de garage, werkt veel.",
          "Geen signalen van gecompliceerde rouw, wel sterke vermijding. Opvolgen.",
        ],
      },
      {
        summary: [
          "Je zus en jij gaan anders om met het verlies. Zij praat erover, jij gaat aan de slag. Allebei mag.",
          "We spraken over zijn verjaardag die eraan komt, en hoe je die dag wil doorbrengen.",
          "Als je wil, schrijf je een brief aan je vader. Je hoeft hem aan niemand te laten lezen.",
        ],
        reactions: [{ by: "client", afterHours: 100, lines: ["Zijn verjaardag viel beter mee dan gedacht. We zijn samen naar het kerkhof geweest."] }],
        private: ["Meer emotie toegelaten in de sessie, huilde voor het eerst.", "Brief voorgesteld. Aandacht voor slaap: wordt vroeg wakker."],
      },
    ],
    tasks: [
      {
        id: "k20",
        title: "Herinneringen noteren",
        description: "Schrijf een herinnering aan je vader op, hoe klein ook. Een geur, een zin, een gewoonte.",
        kind: "tekst",
        rhythm: { kind: "perWeek", times: 2 },
        from: 0,
        time: "22:00",
        answers: [
          "De geur van zaagsel in de garage.",
          "Hoe hij floot als hij iets aan het repareren was.",
          "Zondagochtend, koffie en de krant, altijd in dezelfde volgorde.",
          "Zijn handen. Altijd een pleister ergens.",
        ],
      },
      { id: "k21", title: "Brief aan papa", description: "Schrijf wat je hem nog had willen zeggen. Je hoeft hem aan niemand te laten lezen.", kind: "tekst", rhythm: { kind: "eenmalig" }, dueOffset: 4, from: 1, privateRate: 1 },
    ],
    notes: [
      { id: "n-c2-1", day: -3, time: "17:30", text: ["Zijn verjaardag vandaag. Naar het kerkhof geweest met mijn zus. Minder zwaar dan ik dacht."], mood: 3, tags: ["rouw"] },
      { id: "n-c2-2", day: -10, time: "23:10", text: ["Droomde van hem. We zaten in de auto en hij zei niets. Ik werd wakker en wist even niet waar ik was."], shared: false },
    ],
    agenda: [
      { by: "client", day: -3, journalId: "n-c2-1" },
      { by: "client", day: -2, text: "Mag ik zijn gereedschap weggeven, of is dat te vroeg?" },
    ],
    mood: [2, 3],
    diligence: 0.55,
    checkinRate: 0.5,
    checkinTime: "22:15",
    checkinToday: "07:45",
    checkinTexts: ["Stil in huis.", "Veel gewerkt, weinig gevoeld.", "Aan hem gedacht bij het ontbijt.", "Goede dag eigenlijk."],
    writeTime: "22:00",
  },

  // ------------------------------------------------------------------ Fien: faalangst
  c3: {
    schedule: { offset: 0, time: "11:00", mode: "online", cancelled: [-1] },
    sessions: [
      {
        summary: [
          "Je vertelde hoe je lijf reageert voor een examen: trillende handen, een leeg hoofd. We gaven die signalen een naam, zodat ze minder overweldigen.",
          "Faalangst zegt niets over wat je kan. Het zegt vooral hoeveel het voor je betekent.",
          "Elke dag een korte ademhalingsoefening, ook op dagen zonder examen.",
        ],
        reactions: [
          { by: "client", afterHours: 20, lines: ["Oké. Ik ga het proberen, ook al voelt ademhalen een beetje te simpel."] },
          { by: "psy", afterHours: 45, lines: ["Simpel mag. Het werkt vooral als je het oefent wanneer het nog niet nodig is."] },
        ],
        private: ["Tweedejaars, examens binnen drie weken. Sterke lichamelijke angstreacties, geen vermijding van de examens zelf.", "Verwachtingen van thuis nog niet uitgevraagd."],
      },
      {
        summary: [
          "De examenweek komt dichterbij. We maakten een haalbare dag: blokken van 50 minuten, dan 10 minuten pauze.",
          "Na 21u geen cursus meer. Dat voelt als spijbelen, maar je hoofd heeft ook rust nodig om te onthouden.",
        ],
        reactions: [{ by: "client", afterHours: 30, lines: ["Gisteren voor het eerst om 21u gestopt. Voelde als spijbelen, maar ik sliep wel beter."] }],
        private: ["Beter contact dan de eerste keer. Ademhaling doet ze, niet altijd.", "Examenrooster bekeken. Statistiek is het grootste obstakel."],
      },
    ],
    tasks: [
      { id: "k30", templateId: "tt1", rhythm: { kind: "dagelijks" }, from: 0, time: "08:00", answers: ["Rustiger daarna.", "", "Moeilijk om te blijven zitten.", "Deed het voor het examen, hielp echt."] },
      { id: "k31", title: "Om 21u stoppen met studeren", description: "Na 21u geen cursus meer. Doe iets dat niets met school te maken heeft.", kind: "afvinken", rhythm: { kind: "dagelijks" }, from: 1, time: "21:05" },
    ],
    notes: [
      { id: "n-c3-1", day: -1, time: "14:30", title: "Statistiek", text: ["Examen statistiek achter de rug. Handen trilden bij het begin, daarna ging het."], mood: 4, tags: ["examen"] },
      { id: "n-c3-2", day: -8, time: "23:30", text: ["Alles voelt te veel. Ik ga dit nooit halen."], mood: 1, shared: false },
    ],
    agenda: [{ by: "client", day: -1, text: "Hoe blijf ik rustig bij een mondeling examen?" }],
    mood: [2, 4],
    diligence: 0.65,
    checkinRate: 0.7,
    checkinTime: "22:30",
    checkinTexts: ["Veel gestudeerd.", "Hoofdpijn.", "Oefening gedaan voor het slapen.", "Examen gehad, blij dat het voorbij is."],
    writeTime: "21:30",
  },

  // ------------------------------------------------------------------ Jonas: re-integratie na burn-out
  c4: {
    schedule: { offset: 1, time: "10:00", mode: "fysiek", biweekly: true },
    sessions: [
      {
        summary: [
          "We bekeken hoe de opbouw van je werkuren loopt. De halve dagen gaan goed, de eerste volle dag was zwaar.",
          "Het piekeren over wat collega's denken neemt veel ruimte in. We gaven het een vast moment.",
          "- [x] Week 1 en 2: halve dagen",
          "- [ ] Week 3: drie volle dagen",
          "- [ ] Week 4: gesprek met je leidinggevende",
        ],
        reactions: [
          { by: "client", afterHours: 70, lines: ["Week 3 is begonnen. Maandag ging, dinsdag was ik om 15u op."] },
          { by: "psy", afterHours: 90, lines: ["Dat je het merkt en een pauze nam, is precies wat we zochten."] },
        ],
        private: ["Re-integratie loopt, energie wisselend. Schuldgevoel naar collega's.", "Risico op te snel willen gaan. Tempo bewaken."],
      },
    ],
    tasks: [
      { id: "k40", templateId: "tt7", rhythm: { kind: "dagelijks" }, from: 0, time: "18:00" },
      { id: "k41", title: "Gesprek met je leidinggevende voorbereiden", description: "Schrijf op wat je wil zeggen: wat lukt, wat nog niet, wat je nodig hebt.", kind: "tekst", rhythm: { kind: "eenmalig" }, dueOffset: 0, from: 0 },
    ],
    notes: [
      { id: "n-c4-1", day: -8, time: "17:45", text: ["Eerste volle werkdag. Om 15u moest ik even naar buiten."], mood: 3, tags: ["werk"], shared: false },
      { id: "n-c4-2", day: -3, time: "19:00", text: ["Gesprek met mijn dochter over waarom ik thuis was. Ze vond het niet erg. Ik wel, blijkbaar."], mood: 3 },
    ],
    agenda: [{ by: "psy", day: -1, text: "Hoe ging de eerste volle week?" }],
    mood: [2, 3],
    diligence: 0.7,
    checkinRate: 0.55,
    checkinTime: "20:45",
    checkinTexts: ["Moe maar tevreden.", "Veel mails.", "Vroeg naar bed.", "Goed gesprek met een collega."],
    writeTime: "20:30",
  },

  // ------------------------------------------------------------------ Elise: paniek op de trein
  c5: {
    schedule: { offset: 0, time: "15:30", mode: "fysiek" },
    sessions: [
      {
        summary: [
          "Een paniekaanval is heel onaangenaam, maar niet gevaarlijk. We bekeken wat er in je lijf gebeurt en waarom het vanzelf weer zakt.",
          "Je houdt bij wanneer het opkomt: waar, hoe sterk, wat hielp.",
        ],
        private: ["Paniekaanvallen, vermijdt de trein sinds drie maanden. Pendelt nu met de auto.", "Psycho-educatie gegeven, goed ontvangen."],
      },
      {
        summary: [
          "Je paniekdagboek laat zien dat het vaak begint bij wachten: aan de kassa, op het perron.",
          "We oefenden de 5-4-3-2-1: vijf dingen die je ziet, vier die je hoort, drie die je voelt, twee die je ruikt, één die je proeft.",
          "Als eerste stap: een korte treinrit, één halte.",
        ],
        reactions: [
          { by: "client", afterHours: 40, lines: ["Eén halte gedaan! Gent-Sint-Pieters naar Gent-Dampoort. Mijn hart ging tekeer, maar ik ben niet uitgestapt."] },
          { by: "psy", afterHours: 44, lines: ["Knap, Elise. En je bleef zitten tot het zakte, dat is het belangrijkste."] },
        ],
        private: ["Goede motivatie. Blootstelling in kleine stappen afgesproken."],
      },
      {
        summary: [
          "De korte ritten lukken. Het idee om alleen naar Brussel te gaan maakt je nog bang, en tegelijk wil je het.",
          "We maakten een plan voor die rit: aan het raam, oordopjes, en de oefening als het opkomt.",
        ],
        reactions: [{ by: "client", afterHours: 120, lines: ["Gedaan. Alleen naar Brussel. Halverwege even paniek, oefening gedaan, en ik ben aangekomen."] }],
        private: ["Grote stap sinds vorige keer. Zelfvertrouwen groeit.", "Volgende stap: spitsuur?"],
      },
    ],
    tasks: [
      {
        id: "k50",
        title: "Paniekdagboek",
        description: "Noteer na een paniekmoment: waar, hoe sterk (1 tot 10), wat hielp. Geen paniek? Schrijf dat ook.",
        kind: "tekst",
        rhythm: { kind: "dagelijks" },
        from: 0,
        time: "21:00",
        doneToday: "09:40",
        answers: [
          "Supermarkt, lange rij aan de kassa. Een 5. Even naar buiten gestapt.",
          "Trein, vertraging in Gent. Een 7. De 5-4-3-2-1 oefening hielp.",
          "Geen paniek vandaag, wel onrustig in de ochtend.",
          "Perron, veel volk. Een 4. Aan de rand gaan staan hielp.",
        ],
      },
      { id: "k51", title: "Eén halte met de trein", description: "Neem de trein voor één halte. Blijf zitten tot het zakt.", kind: "afvinken", rhythm: { kind: "eenmalig" }, dueOffset: -9, doneOffset: -12, from: 1 },
      { id: "k52", title: "Alleen naar Brussel", description: "Neem de trein naar Brussel, alleen. Aan het raam, oordopjes in, de oefening bij de hand.", kind: "afvinken", rhythm: { kind: "eenmalig" }, dueOffset: 0, doneOffset: -2, from: 2 },
    ],
    notes: [
      { id: "n-c5-1", day: -2, time: "18:10", title: "Trein naar Brussel", text: ["Vandaag de trein naar Brussel genomen, alleen. Halverwege even kort paniek, de oefening gedaan. Ik ben aangekomen."], mood: 4, tags: ["trein"] },
      { id: "n-c5-2", day: -15, time: "08:00", text: ["Weer de auto genomen. Ik schaam me een beetje."], mood: 2, shared: false },
    ],
    agenda: [
      { by: "client", day: -2, journalId: "n-c5-1" },
      { by: "client", day: -1, text: "Kunnen we het spitsuur als volgende stap nemen?" },
    ],
    mood: [2, 4],
    diligence: 0.8,
    checkinRate: 0.75,
    checkinTime: "21:00",
    checkinToday: "08:30",
    checkinTexts: ["Rustige dag.", "Even onrustig op het werk.", "Trein gehaald zonder gedoe.", "Moe, maar trots."],
    writeTime: "21:00",
  },

  // ------------------------------------------------------------------ Robbe: somberheid
  c6: {
    schedule: { offset: 3, time: "16:00", mode: "online", intakeFirst: true },
    sessions: [
      {
        summary: [
          "Kennismaking. Je vertelde over de voorbije maanden: weinig energie, weinig zin, de dagen lopen in elkaar over.",
          "We beginnen klein: een paar keer per week naar buiten.",
        ],
        private: [
          "Intake. Somber sinds de winter. Slaapt veel, sociaal teruggetrokken.",
          "Werkt thuis als programmeur. Structuur ontbreekt. Plan: activatie.",
        ],
      },
      {
        summary: [
          "Het wandelen lukt twee keer per week. Dat is meer dan ervoor, en dat telt.",
          "We zochten naar kleine dingen die vroeger deugd deden. Muziek, koken voor iemand.",
        ],
        reactions: [
          { by: "client", afterHours: 26, lines: ["Gisteren pasta gemaakt voor mijn huisgenoot. Hij vond het lekker."] },
          { by: "psy", afterHours: 42, lines: ["Mooi, Robbe. Schrijf het gerust op, ook als het klein lijkt."] },
        ],
        private: ["Iets meer affect. Eerste plezier-activiteiten. Stemming opvolgen."],
      },
    ],
    tasks: [
      { id: "k60", templateId: "tt6", rhythm: { kind: "dagen", days: [2, 4, 6] }, from: 0, time: "16:30" },
      {
        id: "k61",
        title: "Eén ding dat deugd deed",
        description: "Schrijf een ding op dat vandaag een beetje deugd deed. Klein is goed.",
        kind: "tekst",
        rhythm: { kind: "perWeek", times: 3 },
        from: 1,
        time: "22:30",
        answers: ["Pasta gemaakt voor mijn huisgenoot.", "Een oude plaat opgezet.", "Zon op mijn bureau.", "Mijn broer gebeld."],
      },
    ],
    notes: [{ id: "n-c6-1", day: -5, time: "20:00", text: ["Weinig zin in alles. Wel de afwas gedaan."], mood: 2 }],
    agenda: [{ by: "psy", day: -2, text: "We kijken samen naar je weekritme." }],
    mood: [2, 3],
    diligence: 0.5,
    checkinRate: 0.45,
    checkinTime: "23:00",
    checkinTexts: ["Lang geslapen.", "Beetje beter.", "Niet veel gedaan.", "Buiten geweest."],
    writeTime: "22:30",
  },

  // ------------------------------------------------------------------ Nora: gepauzeerd
  c7: {
    schedule: { offset: 4, time: "13:30", mode: "fysiek", weeks: [-3] },
    sessions: [
      {
        summary: [
          "We bespraken je vraag om even te pauzeren. Dat is een goede keuze als je nu ruimte nodig hebt.",
          "De deur staat open. Je mag altijd een nieuwe afspraak maken.",
        ],
        reactions: [{ by: "client", afterHours: 4, lines: ["Dank je voor het begrip. Ik laat van me horen."] }],
        private: ["Pauze op vraag van cliënte, relatie is gestabiliseerd. Afspraak: ze neemt zelf contact op."],
      },
    ],
    tasks: [],
    notes: [{ id: "n-c7-1", day: -19, time: "20:30", text: ["Goed gesprek gehad met Pieter. We gaan het samen proberen."], mood: 4 }],
    agenda: [],
    mood: [3, 3],
    diligence: 0.5,
    checkinRate: 0.4,
    checkinTime: "21:00",
    checkinTexts: ["Rustig.", "Goede dag."],
    writeTime: "21:00",
  },

  // ------------------------------------------------------------------ Tom: afgerond
  c8: {
    schedule: { offset: 1, time: "10:00", mode: "fysiek", weeks: [-3] },
    sessions: [
      {
        summary: [
          "Ons laatste gesprek. We keken terug naar waar je begon: alles moest perfect, en niets was ooit af.",
          "> Goed genoeg is ook goed.",
          "Je weet waar je me vindt als je het nodig hebt.",
        ],
        reactions: [{ by: "client", afterHours: 20, lines: ["Dank je, Sarah. Voor alles."] }],
        private: ["Afronding. Doelen behaald. Terugvalpreventie besproken."],
      },
    ],
    tasks: [],
    notes: [],
    agenda: [],
    mood: [3, 4],
    diligence: 0.5,
    checkinRate: 0,
    checkinTime: "21:00",
    checkinTexts: [],
    writeTime: "21:00",
  },
};
