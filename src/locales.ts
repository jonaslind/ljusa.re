import { english } from "./english";
import { Locale } from "./locale";
import { swedish } from "./swedish";

export class Locales {

  private callbacks: ((locale: Locale) => void)[] = [];
  private activeLocale: Locale;
  private locales: Map<string, Locale>;
  private allKeys: Set<string>;

  public constructor() {
    this.locales = Locales.loadLocales();
    this.activeLocale = Locales.getFirstLocale(this.locales);
    this.allKeys = Locales.getAllKeys(this.locales);
  }

  initLocales(): void {
    this.activateFirstLocale();
  }

  private static getAllKeys(locales: Map<string, Locale>): Set<string> {
    return new Set<string>(Array.from(locales.values()).flatMap((locale) => locale.keys));
  }

  private static loadLocales(): Map<string, Locale> {
    const locales: Map<string, Locale> = new Map<string, Locale>();
    locales.set(swedish.name, swedish);
    locales.set(english.name, english);
    return locales;
  }

  private static getFirstLocale(locales: Map<string, Locale>): Locale {
    var preferredLocale: string | null = localStorage.getItem("locale");
    if (preferredLocale === null) {
      preferredLocale = "se";
    }
    return Locales.getLocale(locales, preferredLocale);
  }

  registerChangeCallback(callback: ((locale: Locale) => void)): void {
    this.callbacks.push(callback);
    callback(this.activeLocale);
  }

  private localeChanged() {
    this.callbacks.forEach((callback: ((locale: Locale) => void)) => {
      callback(this.activeLocale);
    });
  }

  private activateFirstLocale(): void {
    this.activateLocale();
    const localeToggle: HTMLElement | null = document.getElementById("localeToggle");
    if (localeToggle === null) {
      throw new Error("No localeToggle found");
    }
    localeToggle.addEventListener("click", (_event: Event) => { this.toggleLocale() });
  }

  private activateLocale(): void {
    this.allKeys.forEach((key) => {
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll('[data-i18n-key="' + key + '"]');
      if (elements.length == 0) {
        return;
      }
      const message: string = this.activeLocale.getMessage(key);
      elements.forEach((element) => {
        if (element instanceof HTMLInputElement) {
          element.placeholder = message;
        } else {
          element.innerHTML = message;
        }
      });
    });
    localStorage.setItem("locale", this.activeLocale.name);
    this.localeChanged();
  }

  private toggleLocale(): void {
    if (this.activeLocale.name == "se") {
      this.activeLocale = Locales.getLocale(this.locales, "en");
    } else {
      this.activeLocale = Locales.getLocale(this.locales, "se");
    }
    this.activateLocale();
  }

  private static getLocale(locales: Map<string, Locale>, localeName: string): Locale {
    const locale: Locale | undefined = locales.get(localeName);
    if (locale === undefined) {
      throw new Error("Unsupported locale " + localeName);
    }
    return locale;
  }

}
