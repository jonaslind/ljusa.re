import { ChartData, ChartOptions as ChartJSOptions } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "../ChartOptions";
import { Locale } from "../Locale";
import { LocationArray } from "../Location";
import { QuarterInfo } from "../Quarter";
import { ColorInfo } from "../Style";
import { SunTimeData, SunTimeDataHelper } from "../SunTimeData";
import { SunTimeChartHelper } from "./SunTimeChartHelper";

export interface SunTimeChartProps {
  quarter: QuarterInfo;
  locations: LocationArray;
  locale: Locale;
  colorInfo: ColorInfo;
  chartOptions: ChartOptions;
}

export function SunTimeChart({ quarter, locations, locale, colorInfo, chartOptions }: SunTimeChartProps): JSX.Element {
  const sunTimeData: SunTimeData = SunTimeDataHelper.getSunTimeData(quarter, locations);

  var chartElement: JSX.Element = <> </>;
  if (sunTimeData.data.length != 0) {
    const [data, options]: [ChartData<"line">, ChartJSOptions<"line">] = SunTimeChartHelper.getChartDataAndOptions(
      colorInfo, locale, chartOptions, sunTimeData);
    chartElement = <Line options={options} data={data} />;
  }

  return (
    <div className="chart-container-outer">
      <div className="chart-container">
        {chartElement}
      </div>
    </div>
  );
}
