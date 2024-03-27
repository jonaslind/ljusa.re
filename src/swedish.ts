import { Locale, LocaleImpl } from "./locale";

export const swedish: Locale = new LocaleImpl("se", "sv", new Map([
  ["bodyTitle", () => "Ljusare"],
  ["placesLabel", () => "Platser"],
  ["locationSelector", () => "Lägg till plats"],
  ["startLink", () => "Start"],
  ["aboutAndLicenseLink", () => "Om sidan samt licensinformation"],
  ["chartToday", () => "Idag"],
  ["chartSunriseLabel", (location: string) => "Soluppgång i " + location],
  ["chartSunsetLabel", (location: string) => "Solnedgång i " + location],
  ["aboutFirstParagraph", () => `
    Denna webbsida visar klockslag för soluppgång och solnedgång i valda platsers lokala tidszon. Grafen börjar den
    första måndagen i nuvarande år, och slutar den första söndagen i april.
  `],
  ["aboutSecondParagraph", () => `
    Klockslagen beräknas enligt
    <a href="https://en.wikipedia.org/wiki/Sunrise_equation" class="externalLink">Wikipedias soluppgångsekvation</a>.
    Alla beräkningar utförs i din webbläsare, det finns ingen logik på serversidan. Ditt val av tema (ljust eller
    mörkt), ditt val av språk samt de platser du valt lagras lokalt i din webbläsare med hjälp av
    <a href="https://www.w3schools.com/html/html5_webstorage.asp" class="externalLink">HTMLs Web Storage-gränssnitt</a>
    så att de kan visas vid ditt nästa besök på webbsidan.
  `],
  ["licenseUsageParagraph",
    (repository: string, name: string, author: string, license: string, usage: string, type: string) =>
      "Denna webbsida använder " + usage + " " + type +
      " <a href=\"" + (repository.startsWith("git+") ? repository.substring(4) : repository) +
      "\" class=\"packageLink\">" +
      name + "</a> " +
      (author != undefined ? " av " + author : "") +
      ", licensierad under licensen " + license + ":"
  ]
]));
