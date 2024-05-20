export class LicenseInfo {
  name: string;
  author: string | undefined;
  repository: string;
  license: string;
  licenseText: string;
  private _usages: Map<string, string>;
  private _types: Map<string, string>;

  constructor(name: string, author: string, repository: string, license: string, licenseText: string, usages: Map<string, string>, types: Map<string, string>) {
    this.name = name;
    this.author = author;
    this.repository = repository;
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

  public static async fetchLicenses(): Promise<LicenseInfo[]> {
    const response = await fetch("oss-licenses.json");
    const licenseInfos: any[] = await response.json();
    return licenseInfos.map((licenseInfo) => new LicenseInfo(
      licenseInfo.name,
      licenseInfo.author,
      licenseInfo.location,
      licenseInfo.license,
      licenseInfo.licenseText,
      new Map(Object.entries(licenseInfo.usage)),
      new Map(Object.entries(licenseInfo.type))
    ));
  }
}
