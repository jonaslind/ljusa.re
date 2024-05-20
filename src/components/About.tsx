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
          __html: locale.getMessageForHtml(
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
      <p dangerouslySetInnerHTML={{ __html: locale.getMessageForHtml("aboutFirstParagraph") }}>
      </p>

      <p dangerouslySetInnerHTML={{ __html: locale.getMessageForHtml("aboutSecondParagraph") }}>
      </p>

      <p dangerouslySetInnerHTML={{ __html: locale.getMessageForHtml("aboutThirdParagraph") }}>
      </p>

      <div id="licenses">
        {licenseElements}
      </div>
    </>
  );
}
