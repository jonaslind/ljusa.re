import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useLocalStorageState, { LocalStorageState } from 'use-local-storage-state';
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LocaleSelector } from "./components/LocaleSelector";
import { Main } from "./components/Main";
import { StyleSelector } from "./components/StyleSelector";
import { Locale, Locales, LocaleSerializer } from "./Locale";
import { LocalesImpl } from "./LocalesImpl";
import { Style, Styles, StyleSerializer } from "./Style";
import { StylesImpl } from "./StylesImpl";

export function Router(): JSX.Element {

  const locales: Locales = new LocalesImpl();
  const [locale, setLocale]: LocalStorageState<Locale> = useLocalStorageState<Locale>(
    "locale",
    {
      defaultValue: locales.default(), serializer: new LocaleSerializer(locales)
    }
  );

  const styles: Styles = new StylesImpl();
  const [style, setStyle]: LocalStorageState<Style> = useLocalStorageState<Style>(
    "lightOrDarkStyle",
    {
      defaultValue: styles.default(), serializer: new StyleSerializer(styles)
    }
  );
  styles.activateStyle(style.name);

  return (
    <div>
      <p className="topMenu">
        <LocaleSelector locale={locale} locales={locales} setLocale={setLocale} />
        &nbsp;|&nbsp;
        <StyleSelector style={style} styles={styles} setStyle={setStyle} />
      </p>
      <Header locale={locale} />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main locale={locale} style={style} />} />
          <Route path="/about.html" element={<About locale={locale} />} />
          <Route path="/about" element={<About locale={locale} />} />
        </Routes>
      </BrowserRouter>

      <Footer locale={locale} />
    </div>
  );
}
