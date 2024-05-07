import { ColorInfo, Style, Styles } from "./Style";

export class StylesImpl implements Styles {

  // The themes that can be chosen from are named style-<something>.css to differentiate them from generic stylesheets
  // used across themes
  private static STYLE_FILENAME_PATTERN: RegExp = /^style-([a-z0-9]+)\.css$/;

  private styles: Map<string, Style>;
  private defaultStyle: Style;
  private currentStyle: string | null;
  private cssStyleSheets: Map<string, CSSStyleSheet>;

  constructor() {
    this.currentStyle = null;
    this.styles = new Map<string, Style>();
    this.cssStyleSheets = StylesImpl.getCSSStyleSheets();
    const styleNames: string[] = Array.from(this.cssStyleSheets.keys());
    if (!styleNames.includes("light")) {
      throw new Error("Missing style light");
    }
    styleNames.forEach((styleName: string) => { this.styles.set(styleName, new StyleImpl(styleName, this)); });
    this.defaultStyle = this.styles.get("light")!;
  }

  public getStyle(name: string): Style {
    const style: Style | undefined = this.styles.get(name);
    if (style === undefined) {
      throw new Error("Unsupported style " + name);
    }
    return style;
  }

  private getCSSStyleSheet(name: string): CSSStyleSheet {
    const cssStyleSheet: CSSStyleSheet | undefined = this.cssStyleSheets.get(name);
    if (cssStyleSheet === undefined) {
      throw new Error("Unsupported style " + name);
    }
    return cssStyleSheet;
  }

  public default(): Style {
    return this.defaultStyle;
  }

  public activateStyle(name: string): void {
    if (name === this.currentStyle) {
      return;
    }
    const styleToActivate: CSSStyleSheet = this.getCSSStyleSheet(name);
    const stylesToDeactivate: CSSStyleSheet[] = Array.from(this.cssStyleSheets.values()).filter(
      (cssStyleSheet: CSSStyleSheet) => cssStyleSheet !== styleToActivate);
    styleToActivate.disabled = false;
    stylesToDeactivate.forEach((cssStyleSheet: CSSStyleSheet) => cssStyleSheet.disabled = true);
    this.currentStyle = name;
  }

  public getColorInfo(name: string): ColorInfo {
    if (name !== this.currentStyle) {
      throw new Error("Can only read ColorInfo for current style " + this.currentStyle + ", not " + name);
    }
    var normalForegroundColor: string;
    var normalBackgroundColor: string;
    var highlightForegroundColor: string;
    var highlightBackgroundColor: string;
    var lineColorLight: string;
    var lineColorHeavy: string;
    var accentColors: string[];
    [normalForegroundColor, normalBackgroundColor] = StylesImpl.getColors("normalColors");
    [highlightForegroundColor, highlightBackgroundColor] = StylesImpl.getColors("highlightColors");
    [lineColorHeavy, lineColorLight] = StylesImpl.getColors("lineColors");
    accentColors = []
    for (var i: number = 0; i < 8; i++) {
      accentColors.push(StylesImpl.getColors("accentColor" + i)[0]);
    }
    return {
      normalForegroundColor: normalForegroundColor,
      normalBackgroundColor: normalBackgroundColor,
      highlightForegroundColor: highlightForegroundColor,
      highlightBackgroundColor: highlightBackgroundColor,
      lineColorLight: lineColorLight,
      lineColorHeavy: lineColorHeavy,
      accentColors: accentColors
    };
  }

  private static getColors(className: string): string[] {
    const temporaryElement: HTMLDivElement = <HTMLDivElement> document.createElement("div");
    temporaryElement.className = className;
    temporaryElement.style.display = "none";
    document.body.append(temporaryElement);
    const computedStyle: CSSStyleDeclaration = window.getComputedStyle(temporaryElement);
    const foreground: string = computedStyle.color;
    const background: string = computedStyle.backgroundColor;
    temporaryElement.remove();
    return [foreground, background];
  }

  private static getCSSStyleSheets(): Map<string, CSSStyleSheet> {
    const cssStyleSheets: Map<string, CSSStyleSheet> = new Map<string, CSSStyleSheet>();
    for (var i: number = 0; i < document.styleSheets.length; i++) {
      const styleSheet: CSSStyleSheet = <CSSStyleSheet> document.styleSheets[i];
      const href: string | null = styleSheet.href;
      if (href === null) {
        throw new Error("StyleSheet " + styleSheet + " doesn't have any href");
      }
      const pathname: string = new URL(href).pathname;
      const filename: string = pathname.substring(pathname.lastIndexOf("/") + 1);
      const match: RegExpExecArray | null = StylesImpl.STYLE_FILENAME_PATTERN.exec(filename);
      if (match === null) {
        continue;
      }
      const name: string = match[1];
      cssStyleSheets.set(name, styleSheet);
    }
    return cssStyleSheets;
  }
}

class StyleImpl implements Style {
  readonly discriminator: 'Style-Interface' = 'Style-Interface';
  readonly name: string;
  private styles: StylesImpl;
  private colorInfoCache: ColorInfo | null;
  constructor(name: string, styles: StylesImpl) {
    this.name = name;
    this.styles = styles;
    this.colorInfoCache = null;
  }
  public get colorInfo(): ColorInfo {
    if (this.colorInfoCache === null) {
      this.colorInfoCache = this.styles.getColorInfo(this.name);
    }
    return this.colorInfoCache;
  }
}
