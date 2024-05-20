import { Locale, LocaleImpl } from "./Locale";

export const swedish: Locale = new LocaleImpl("se", "sv", new Map([
  ["bodyTitle", () => "ljusa.re"],
  ["quarterTitle", (year: (string | undefined), quarter: (string | undefined)) => "Kvartal " + quarter + " " + year],
  ["placesLabel", () => "Platser"],
  ["locationSelector", () => "Lägg till plats"],
  ["startLink", () => "Start"],
  ["aboutAndLicenseLink", () => "Om sidan samt licensinformation"],
  ["chartToday", () => "Idag"],
  ["chartSunriseLabel", (location: (string | undefined)) => "Soluppgång i " + location],
  ["chartSunsetLabel", (location: (string | undefined)) => "Solnedgång i " + location],
  ["aboutFirstParagraph", () => `
    Denna webbsida visar klockslag för soluppgång och solnedgång i valda platsers lokala tidszon.
  `],
  ["aboutSecondParagraph", () => `
    Klockslagen beräknas enligt
    <a href="https://en.wikipedia.org/wiki/Sunrise_equation" class="externalLink">Wikipedias soluppgångsekvation</a>.
    Alla beräkningar utförs i din webbläsare, det finns ingen logik på serversidan. Ditt val av tema (ljust eller
    mörkt), ditt val av språk, ditt val av riktning på y-axeln samt de platser du valt lagras lokalt i din webbläsare
    med hjälp av
    <a href="https://www.w3schools.com/html/html5_webstorage.asp" class="externalLink">HTMLs Web Storage-gränssnitt</a>
    så att de kan visas vid ditt nästa besök på webbsidan.
  `],
  ["aboutThirdParagraph", () => `
    Källkoden för denna webbsida finns tillgänglig på
    <a href="https://github.com/jonaslind/ljusa.re" class="externalLink">github.com/jonaslind/ljusa.re</a>.
  `],
  ["licenseUsageParagraph",
    (repository: (string | undefined), name: (string | undefined), author: (string | undefined), license: (string | undefined),
      usage: (string | undefined), type: (string | undefined)) =>
      "Denna webbsida använder " + usage + " " + type + " " +
      "<a href=\"" + repository + "\" class=\"packageLink\">" +
      name +
      "</a>" +
      (author !== undefined ? " av " + author : "") +
      ", licensierad under licensen " + license + ":"
  ]
]));
