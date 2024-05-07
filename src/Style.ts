export interface ColorInfo {
  normalForegroundColor: string;
  normalBackgroundColor: string;
  highlightForegroundColor: string;
  highlightBackgroundColor: string;
  lineColorLight: string;
  lineColorHeavy: string;
  accentColors: string[];
}

export interface Style {
  readonly discriminator: 'Style-Interface';
  readonly name: string;
  readonly colorInfo: ColorInfo;
}


function instanceOfStyle(object: any): object is Style {
  return object.discriminator === 'Style-Interface';
}

export interface Styles {
  default: () => Style;
  getStyle: (name: string) => Style;
  activateStyle: (name: string) => void;
}

export class StyleSerializer {
  private styles: Styles;
  stringify: (value: unknown) => string = (value: unknown) => this.serializeUnknown(value);
  parse: (value: string) => Style = (value: string) => this.deserialize(value);

  constructor(styles: Styles) {
    this.styles = styles;
  }

  private serializeUnknown(value: unknown): string {
    if (instanceOfStyle(value))
      return this.serialize(value);
    throw new Error("Cannot serialize " + value + " into Style");
  }

  private serialize(style: Style): string {
    return style.name;
  }

  private deserialize(name: string): Style {
    return this.styles.getStyle(name);
  }
}
