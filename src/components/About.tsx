import React, { useEffect, useState } from "react";
import { LicenseInfo, Licenses } from "../LicenseInfo";
import { Locale } from "../Locale";

export interface StartProps {
  locale: Locale;
}

export function About({ locale }: StartProps): JSX.Element {
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);

  useEffect(() => {
    Licenses.fetchLicenses().then((loadedLicenses: LicenseInfo[]) => setLicenses(loadedLicenses));
  }, []);

  const licenseElements: JSX.Element[] = [];
  licenses.forEach((license: LicenseInfo) => {
    licenseElements.push(
      <>
        <p dangerouslySetInnerHTML={{
          __html: locale.getMessage(
            "licenseUsageParagraph",
            license.repository,
            license.name,
            license.author,
            license.license,
            license.getUsage(locale.name),
            license.getType(locale.name)
          )
        }}></p>
        <p className="licenseParagraph">{license.licenseText}</p>
      </>
    );
  });

  return (
    <>
      <p dangerouslySetInnerHTML={{ __html: locale.getMessage("aboutFirstParagraph") }}>
      </p>

      <p dangerouslySetInnerHTML={{ __html: locale.getMessage("aboutSecondParagraph") }}>
      </p>

      <p dangerouslySetInnerHTML={{ __html: locale.getMessage("aboutThirdParagraph") }}>
      </p>

      <div id="licenses">
        {licenseElements}
      </div>
    </>
  );
}
