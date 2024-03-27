import { Licenses } from "./licenses";
import { Locale } from "./locale";
import { Locales } from "./locales";
import { Location } from "./locations";
import { LocationSelectors } from "./locationselectors";
import { ColorInfo, Styles } from "./styles";
import { SuntimeChart } from "./suntimechart";
import { SunTimeData, SunTimes } from "./suntimes";

window.onload = function() {
  const locales: Locales = new Locales();
  locales.initLocales();

  const styles: Styles = new Styles();
  styles.initStyles();

  const licenses: Licenses = new Licenses()
  licenses.initLicenses();

  const locationSelectors: LocationSelectors = new LocationSelectors();
  locationSelectors.initLocationSelectors();

  const sunTimes: SunTimes = new SunTimes();
  sunTimes.initSunTimes();

  const suntimeChart: SuntimeChart = new SuntimeChart();
  suntimeChart.initSuntimeChart();

  locales.registerChangeCallback((locale: Locale) => { suntimeChart.localeChanged(locale) });
  locales.registerChangeCallback((locale: Locale) => { locationSelectors.localeChanged(locale) });
  locales.registerChangeCallback((locale: Locale) => { licenses.localeChanged(locale) });

  sunTimes.registerChangeCallback((sunTimeData: SunTimeData) => { suntimeChart.dataChanged(sunTimeData) });

  locationSelectors.registerChangeCallback((locations: Location[]) => { sunTimes.locationsChanged(locations) });

  styles.registerChangeCallback((colorInfo: ColorInfo) => { suntimeChart.colorsChanged(colorInfo) });
}
