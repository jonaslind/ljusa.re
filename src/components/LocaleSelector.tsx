import React, { Dispatch, SetStateAction } from "react";
import { Locale, Locales } from "../Locale";

export interface LocaleProps {
  locale: Locale;
  locales: Locales;
  setLocale: Dispatch<SetStateAction<Locale>>;
}

export function LocaleSelector({ locale, locales, setLocale }: LocaleProps): JSX.Element {

  const toggleLocale: (() => void) = function(): void {
    if (locale.name == "se") {
      setLocale(locales.getLocale("en"));
    } else {
      setLocale(locales.getLocale("se"));
    }
  }

  return (
    <i id="localeToggle" onClick={toggleLocale}>🇸🇪 🇬🇧</i>
  );
}
