import { english } from "./english";
import { Locale, Locales } from "./Locale";
import { swedish } from "./swedish";

export class LocalesImpl implements Locales {
  private locales: Map<string, Locale>;
  constructor() {
    this.locales = LocalesImpl.loadLocales();
  }

  private static loadLocales(): Map<string, Locale> {
    const locales: Map<string, Locale> = new Map<string, Locale>();
    locales.set(swedish.name, swedish);
    locales.set(english.name, english);
    return locales;
  }
  public getLocale(name: string): Locale {
    const locale: Locale | undefined = this.locales.get(name);
    if (locale === undefined) {
      throw new Error("Unsupported locale " + name);
    }
    return locale;
  }
  public default(): Locale {
    return swedish;
  }
}
