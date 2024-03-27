export interface Locale {
  readonly name: string;
  readonly language: string;
  readonly keys: string[];
  getMessage(key: string, ...args: string[]): string;
}

export class LocaleImpl implements Locale {
  private _name: string;
  private _language: string;
  private _messages: Map<string, (...args: string[]) => string>;
  private _keys: string[];

  constructor(name: string, language: string, messages: Map<string, (...args: string[]) => string>) {
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

  public getMessage(key: string, ...args: string[]): string {
    return this._messages.get(key)(...args);
  }
}
