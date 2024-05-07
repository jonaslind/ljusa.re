import React from "react";
import { Locale } from "../Locale";

export interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps): JSX.Element {

  return (
    <p id="footer">
      <a href="/" className="internalLink">{locale.getMessage("startLink")}</a>
      &nbsp;|&nbsp;
      <a href="about.html" className="internalLink">{locale.getMessage("aboutAndLicenseLink")}</a>
    </p>
  );
}
