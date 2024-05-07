import React, { Dispatch, SetStateAction } from "react";
import { ChartOptions } from "../ChartOptions";

export interface ChartControlProps {
  chartOptions: ChartOptions;
  setChartOptions: Dispatch<SetStateAction<ChartOptions>>;
}

export function ChartControls({ chartOptions, setChartOptions }: ChartControlProps): JSX.Element {

  const toggleYAxisDirection: (() => void) = function(): void {
    setChartOptions({ flipYAxis: !chartOptions.flipYAxis });
  }

  return (
    <p className="chartControls"><i id="yAxisDirectionToggle" onClick={toggleYAxisDirection}>⇅</i></p>
  );
}
