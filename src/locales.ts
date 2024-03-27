import { english } from "./english";
import { Locale } from "./locale";
import { swedish } from "./swedish";

export class Locales {

  private callbacks: ((locale: Locale) => void)[] = [];
  private activeLocale: string = null;
  private locales: Map<string, Locale> = new Map<string, Locale>();
  private allKeys = new Set<string>();

  initLocales(): void {
    this.locales.set(swedish.name, swedish);
    this.locales.set(english.name, english);
    this.locales.forEach((locale) => locale.keys.forEach((key) => this.allKeys.add(key)));
    this.activateFirstLocale();
  }

  registerChangeCallback(callback: ((locale: Locale) => void)): void {
    this.callbacks.push(callback);
    callback(this.locales.get(this.activeLocale));
  }

  private localeChanged(locale: Locale) {
    this.callbacks.forEach((callback: ((locale: Locale) => void)) => {
      callback(locale);
    });
  }

  private activateFirstLocale(): void {
    const preferredLocale = localStorage.getItem("locale");
    if (preferredLocale != null && this.locales.has(preferredLocale)) {
      this.activeLocale = preferredLocale;
    } else {
      this.activeLocale = "se";
    }
    this.activateLocale();
    const localeToggle: HTMLElement = document.getElementById("localeToggle");
    localeToggle.addEventListener("click", (event: Event) => { this.toggleLocale() });
  }

  private activateLocale(): void {
    const locale: Locale = this.locales.get(this.activeLocale);
    this.allKeys.forEach((key) => {
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll('[data-i18n-key="' + key + '"]');
      if (elements.length == 0) {
        return;
      }
      const message: string = locale.getMessage(key);
      if (message == undefined) {
        throw new Error("Message " + key + " missing in locale " + locale.name);
      }
      elements.forEach((element) => {
        if (element instanceof HTMLInputElement) {
          element.placeholder = message;
        } else {
          element.innerHTML = message;
        }
      });
    });
    localStorage.setItem("locale", this.activeLocale);
    this.localeChanged(locale);
  }

  private toggleLocale(): void {
    if (this.activeLocale == "se") {
      this.activeLocale = "en";
    } else {
      this.activeLocale = "se";
    }
    this.activateLocale();
  }

}
