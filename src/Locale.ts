import { encode } from "he";

export interface Locale {
  readonly discriminator: 'Locale-Interface';
  readonly name: string;
  readonly language: string;
  readonly keys: string[];
  getMessage(key: string, ...args: (string | undefined)[]): string;
  getMessageForHtml(key: string, ...args: (string | undefined)[]): string;
}

function instanceOfLocale(object: any): object is Locale {
  return object.discriminator === 'Locale-Interface';
}

export interface Locales {
  default: () => Locale;
  getLocale: (name: string) => Locale;
}

export class LocaleSerializer {
  private locales: Locales;
  stringify: (value: unknown) => string = (value: unknown) => this.serializeUnknown(value);
  parse: (value: string) => Locale = (value: string) => this.deserialize(value);

  constructor(locales: Locales) {
    this.locales = locales;
  }

  private serializeUnknown(value: unknown): string {
    if (instanceOfLocale(value))
      return this.serialize(value);
    throw new Error("Cannot serialize " + value + " into Locale");
  }

  private serialize(locale: Locale): string {
    return locale.name;
  }

  private deserialize(name: string): Locale {
    return this.locales.getLocale(name);
  }
}

export class LocaleImpl implements Locale {
  readonly discriminator: 'Locale-Interface' = 'Locale-Interface';
  private _name: string;
  private _language: string;
  private _messages: Map<string, (...args: (string | undefined)[]) => string>;
  private _keys: string[];

  constructor(name: string, language: string, messages: Map<string, (...args: (string | undefined)[]) => string>) {
    this._name = name;
    this._language = language;
    this._messages = messages;
    this._keys = Array.from(this._messages.keys());
  }

  public get name(): string {
    return this._name;
  }

  public get language(): string {
    return this._language;
  }

  public get keys(): string[] {
    return this._keys;
  }

  public getMessage(key: string, ...args: (string | undefined)[]): string {
    const message: ((...args2: (string | undefined)[]) => string) | undefined = this._messages.get(key);
    if (message === undefined) {
      throw new Error("Missing message " + key + " in language " + this.language);
    }
    return message(...args);
  }

  public getMessageForHtml(key: string, ...args: (string | undefined)[]): string {
    const encodedArgs: (string | undefined)[] = args.map((rawArg) => {
      if (rawArg === undefined) {
        return undefined;
      }
      return encode(rawArg);
    });
    return this.getMessage(key, ...encodedArgs);
  }
}
