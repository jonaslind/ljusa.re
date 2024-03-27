import { Locale, LocaleImpl } from "./locale";

export const english: Locale = new LocaleImpl("en", "en-gb", new Map([
  ["bodyTitle", () => "Brighter"],
  ["placesLabel", () => "Places"],
  ["locationSelector", () => "Add place"],
  ["startLink", () => "Start"],
  ["aboutAndLicenseLink", () => "About and License Information"],
  ["chartToday", () => "Today"],
  ["chartSunriseLabel", (location: string) => "Sunrise in " + location],
  ["chartSunsetLabel", (location: string) => "Sunset in " + location],
  ["aboutFirstParagraph", () => `
    This website displays the sunset and sunrise times of the selected places in each place's local timezone. The graph
    starts at the first Monday of the current year and ends at the first Sunday in April.
  `],
  ["aboutSecondParagraph", () => `
    Times are calculated using
    <a href="https://en.wikipedia.org/wiki/Sunrise_equation" class="externalLink">Wikipedia's sunrise equation</a>. All
    calculations are performed by your browser, there is no server-side logic. Your chosen theme (light or dark), your
    chosen language and your chosen places are stored locally in your browser using the
    <a href="https://www.w3schools.com/html/html5_webstorage.asp" class="externalLink">HTML Web Storage API</a> so that
    they are remembered next time you visit the site.
  `],
  ["licenseUsageParagraph",
    (repository: string, name: string, author: string, license: string, usage: string, type: string) =>
      "This website uses " + usage + " the" +
      " <a href=\"" + (repository.startsWith("git+") ? repository.substring(4) : repository) +
      "\" class=\"packageLink\">" +
      name + "</a> " + type +
      (author != undefined ? " by " + author : "") +
      ", licensed under the " + license + " license:"
  ]
]));
