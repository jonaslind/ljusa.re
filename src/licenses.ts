import { Locale } from "./locale";

class LicenseInfo {
  name: string;
  version: string;
  author: string;
  repository: string;
  source: string;
  license: string;
  licenseText: string;
  private _usages: Map<string, string>;
  private _types: Map<string, string>;

  constructor(name: string, version: string, author: string, repository: string, source: string, license: string, licenseText: string, usages: Map<string, string>, types: Map<string, string>) {
    this.name = name;
    this.version = version;
    this.author = author;
    this.repository = repository;
    this.source = source;
    this.license = license;
    this.licenseText = licenseText;
    this._usages = usages;
    this._types = types;
  }

  public getUsage(localeName: string): string {
    const usage: string | undefined = this._usages.get(localeName);
    if (usage === undefined) {
      throw new Error("Missing usage in " + this.name + " for locale " + localeName);
    }
    return usage;
  }
  public getType(localeName: string): string {
    const type: string | undefined = this._types.get(localeName);
    if (type === undefined) {
      throw new Error("Missing type in " + this.name + " for locale " + localeName);
    }
    return type;
  }
}

export class Licenses {

  private locale: Locale | null = null;
  private licenseInfos: LicenseInfo[] | null = null;

  initLicenses(): void {
    if (document.getElementById('licenses') == null) {
      return;
    }
    this.loadLicenses();
  }

  localeChanged(locale: Locale): void {
    this.locale = locale;
    this.updateLicenses();
  }

  private updateLicenses(): void {
    if (this.locale === null || this.licenseInfos === null) {
      return;
    }
    const children: HTMLParagraphElement[] = [];
    this.licenseInfos!.forEach((licenseInfo: LicenseInfo) => {
      const usageParagraph: HTMLParagraphElement = <HTMLParagraphElement> document.createElement("p");
      usageParagraph.innerHTML = this.locale!.getMessage(
        "licenseUsageParagraph",
        licenseInfo.repository,
        licenseInfo.name,
        licenseInfo.author,
        licenseInfo.license,
        licenseInfo.getUsage(this.locale!.name),
        licenseInfo.getType(this.locale!.name)
      );
      children.push(usageParagraph);
      const licenseParagraph: HTMLParagraphElement = <HTMLParagraphElement> document.createElement("p");
      licenseParagraph.className = "licenseParagraph";
      licenseParagraph.innerText = licenseInfo.licenseText;
      children.push(licenseParagraph);
    });
    const licensesDiv: HTMLDivElement = <HTMLDivElement> document.getElementById('licenses');
    licensesDiv.replaceChildren(...children);
  }

  private loadLicenses(): void {
    fetch("oss-licenses.json")
      .then((response) => response.json())
      .then((licenseInfos: any[]) => {
        this.licenseInfos = licenseInfos.map((licenseInfo) => new LicenseInfo(
          licenseInfo.name,
          licenseInfo.version,
          licenseInfo.author,
          licenseInfo.repository,
          licenseInfo.source,
          licenseInfo.license,
          licenseInfo.licenseText,
          new Map(Object.entries(licenseInfo.usage)),
          new Map(Object.entries(licenseInfo.type))
        ));
        this.updateLicenses();
      });
  }
}
