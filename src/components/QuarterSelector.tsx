import React, { Dispatch, SetStateAction } from "react";
import { Locale } from "../Locale";
import { QuarterInfo, Quarters } from "../Quarter";

export interface QuarterSelectorProps {
  locale: Locale;
  quarter: QuarterInfo;
  quarters: Quarters;
  setQuarter: Dispatch<SetStateAction<QuarterInfo>>;
}

export function QuarterSelector({ locale, quarter, quarters, setQuarter }: QuarterSelectorProps): JSX.Element {
  const prevClicked: (() => void) = function(): void {
    setQuarter(quarter.previous());
  }
  const nextClicked: (() => void) = function(): void {
    setQuarter(quarter.next());
  }
  return (
    <h2>
      <i id="prevQuarterLink" onClick={prevClicked}>◂</i>
      &nbsp;<i id="quarterTitle">{locale.getMessage("quarterTitle", quarter.year, quarter.quarter)}</i>&nbsp;
      <i id="nextQuarterLink" onClick={nextClicked}>▸</i>
    </h2>
  );
}
