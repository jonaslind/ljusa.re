import { Locale } from "./locale";

interface LicenceInfo {
  name: string;
  version: string;
  author: string;
  repository: string;
  source: string;
  license: string;
  licenseText: string;
  usage: Map<string, string>;
  type: Map<string, string>;
}

export class Licenses {

  private locale: Locale;
  private licenseInfos: LicenceInfo[];

  initLicenses() {
    if (document.getElementById('licenses') == null) {
      return;
    }
    this.loadLicenses();
  }

  localeChanged(locale: Locale) {
    this.locale = locale;
    this.updateLicenses();
  }

  private updateLicenses() {
    if (this.locale == null || this.licenseInfos == null) {
      return;
    }
    const children: HTMLParagraphElement[] = [];
    this.licenseInfos.forEach((licenseInfo: LicenceInfo) => {
      const usageParagraph: HTMLParagraphElement = <HTMLParagraphElement> document.createElement("p");
      usageParagraph.innerHTML = this.locale.getMessage(
        "licenseUsageParagraph",
        licenseInfo.repository,
        licenseInfo.name,
        licenseInfo.author,
        licenseInfo.license,
        licenseInfo.usage.get(this.locale.name),
        licenseInfo.type.get(this.locale.name)
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

  private loadLicenses() {
    fetch("oss-licenses.json")
      .then((response) => response.json())
      .then((licenseInfos: any[]) => {
        this.licenseInfos = licenseInfos.map((licenseInfo) => <LicenceInfo> {
          name: licenseInfo.name,
          version: licenseInfo.version,
          author: licenseInfo.author,
          repository: licenseInfo.repository,
          source: licenseInfo.source,
          license: licenseInfo.license,
          licenseText: licenseInfo.licenseText,
          usage: new Map(Object.entries(licenseInfo.usage)),
          type: new Map(Object.entries(licenseInfo.type))
        });
        this.updateLicenses();
      });
  }
}
