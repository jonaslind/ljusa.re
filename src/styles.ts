export interface ColorInfo {
  normalForegroundColor: string;
  normalBackgroundColor: string;
  highlightForegroundColor: string;
  highlightBackgroundColor: string;
  lineColorLight: string;
  lineColorHeavy: string;
  accentColors: string[];
}

export class Styles {

  private callbacks: ((colorInfo: ColorInfo) => void)[] = [];

  private colorInfo: ColorInfo = null;

  initStyles(): void {
    this.activateStyle();
  }

  registerChangeCallback(callback: ((colorInfo: ColorInfo) => void)): void {
    this.callbacks.push(callback);
    callback(this.colorInfo);
  }

  private colorsChanged(colorInfo: ColorInfo) {
    this.colorInfo = colorInfo;
    this.callbacks.forEach((callback: ((colorInfo: ColorInfo) => void)) => {
      callback(colorInfo);
    });
  }

  private updateColors() {
    var normalForegroundColor: string = null;
    var normalBackgroundColor: string = null;
    var highlightForegroundColor: string = null;
    var highlightBackgroundColor: string = null;
    var lineColorLight: string = null;
    var lineColorHeavy: string = null;
    var accentColors: string[] = null;
    [normalForegroundColor, normalBackgroundColor] = Styles.getColorInfo("normalColors");
    [highlightForegroundColor, highlightBackgroundColor] = Styles.getColorInfo("highlightColors");
    [lineColorHeavy, lineColorLight] = Styles.getColorInfo("lineColors");
    accentColors = []
    for (var i: number = 0; i < 8; i++) {
      accentColors.push(Styles.getColorInfo("accentColor" + i)[0]);
    }
    this.colorsChanged({
      normalForegroundColor: normalForegroundColor,
      normalBackgroundColor: normalBackgroundColor,
      highlightForegroundColor: highlightForegroundColor,
      highlightBackgroundColor: highlightBackgroundColor,
      lineColorLight: lineColorLight,
      lineColorHeavy: lineColorHeavy,
      accentColors: accentColors
    });
  }

  private activateAndDeactivateStyle(styleToActivate: CSSStyleSheet, styleToDeactivate: CSSStyleSheet) {
    styleToActivate.disabled = false;
    styleToDeactivate.disabled = true;
    this.updateColors();
  }

  private activateLightStyle() {
    localStorage.setItem("lightOrDarkStyle", "light");
    this.activateAndDeactivateStyle(Styles.getStyle("light"), Styles.getStyle("dark"));

  }

  private activateDarkStyle() {
    localStorage.setItem("lightOrDarkStyle", "dark");
    this.activateAndDeactivateStyle(Styles.getStyle("dark"), Styles.getStyle("light"));
  }

  private toggleStyle() {
    if (Styles.getStyle("dark").disabled) {
      this.activateDarkStyle();
    } else {
      this.activateLightStyle();
    }
  }

  private activateStyle() {
    const preferredStyle = localStorage.getItem("lightOrDarkStyle");
    if (preferredStyle != null) {
      if (preferredStyle == "light") {
        this.activateLightStyle();
      } else {
        this.activateDarkStyle();
      }
    } else {
      this.activateLightStyle();
    }
    const lightOrDarkStyleToggle: HTMLElement = document.getElementById("lightOrDarkStyleToggle");
    lightOrDarkStyleToggle.addEventListener("click", (event: Event) => { this.toggleStyle() });
  }

  private static getColorInfo(className: string): string[] {
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

  private static getStyle(name: string): CSSStyleSheet | null {
    for (var i: number = 0; i < document.styleSheets.length; i++) {
      const styleSheet: CSSStyleSheet = <CSSStyleSheet> document.styleSheets[i];
      if (styleSheet.href.endsWith(name + ".css")) {
        return styleSheet;
      }
    }
    return null;
  }

}
