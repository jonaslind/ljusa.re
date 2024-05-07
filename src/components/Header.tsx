import React from "react";
import { Locale } from "../Locale";

export interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps): JSX.Element {

  return (
    <h1><a href="/" id="linkToStart">{locale.getMessage("bodyTitle")}</a></h1>
  );
}
