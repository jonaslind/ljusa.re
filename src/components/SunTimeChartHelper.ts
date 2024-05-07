import { CategoryScale, Chart, ChartData, ChartDataset, ChartOptions as ChartJSOptions, ChartTypeRegistry, Color, LinearScale, LineController, LineElement, PointElement, ScriptableScaleContext, Tooltip, TooltipItem, TooltipLabelStyle } from "chart.js";
import { DateTime } from "luxon";
import { ChartOptions } from "../ChartOptions";
import { Locale } from "../Locale";
import { Location } from "../Location";
import { ColorInfo } from "../Style";
import { secondsOfDayToString, SunTime } from "../SunTime";
import { SunTimeData, SunTimeDataSeries } from "../SunTimeData";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

export class SunTimeChartHelper {

  private static SECONDS_IN_HOUR: number = 60 * 60;

  private static SECONDS_IN_HALF_HOUR: number = 30 * 60;

  private static xAxisLabel(locale: Locale, sunTimeData: SunTimeData, value: string | number): string {
    if (typeof value === "string") {
      throw new Error("Unexpected x axis value " + value);
    }
    if (value == sunTimeData.indexOfToday) {
      return locale.getMessage("chartToday");
    }
    if (value % 7 != 0) {
      return "";
    }
    const date: DateTime = sunTimeData.dates[0].plus({ days: value });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: locale.language });
  }

  private static xAxisLineColor(colorInfo: ColorInfo, sunTimeData: SunTimeData, context: ScriptableScaleContext): Color {
    if (context.tick.value == sunTimeData.indexOfToday) {
      // Looks better when the Today line doesn't stand out as much
      return colorInfo.lineColorLight;
    }
    return colorInfo.lineColorLight;
  }

  private static xAxisLineWidth(sunTimeData: SunTimeData, context: ScriptableScaleContext): number {
    if (context.tick.value == sunTimeData.indexOfToday) {
      return 1;
    }
    if (context.tick.value % 7 != 0) {
      return 0;
    }
    return 1;
  }

  private static yAxisLabel(value: string | number): string {
    if (typeof value === "string") {
      throw new Error("Unexpected y axis value " + value);
    }
    if (value % (SunTimeChartHelper.SECONDS_IN_HOUR) != 0) {
      return "";
    }
    return secondsOfDayToString(BigInt(value));
  }

  private static yAxisLineColor(colorInfo: ColorInfo, context: ScriptableScaleContext): Color {
    if (context.tick.value % (SunTimeChartHelper.SECONDS_IN_HOUR) != 0) {
      return colorInfo.lineColorLight;
    }
    return colorInfo.lineColorHeavy;
  }

  private static tooltipTitle(locale: Locale, sunTimeData: SunTimeData, context: TooltipItem<keyof ChartTypeRegistry>[]): string {
    const date: DateTime = sunTimeData.dates[0].plus({ days: context[0].dataIndex });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: locale.language });
  }

  private static tooltipLabel(context: TooltipItem<keyof ChartTypeRegistry>): string {
    return context.dataset.label + ": " + secondsOfDayToString(BigInt(<number> context.raw));
  }

  private static labelColor(colorInfo: ColorInfo, context: TooltipItem<keyof ChartTypeRegistry>): TooltipLabelStyle {
    return {
      borderColor: colorInfo.highlightBackgroundColor,
      backgroundColor: colorInfo.accentColors[Math.floor(context.datasetIndex / 2) % 8]
    };
  }

  public static getChartDataAndOptions(colorInfo: ColorInfo, locale: Locale, chartOptions: ChartOptions, sunTimeData: SunTimeData): [ChartData<"line">, ChartJSOptions<"line">] {

    // high value so that we're sure to encounter a smaller one
    var minValue: number = 24 * SunTimeChartHelper.SECONDS_IN_HOUR;
    // low value so that we're sure to encounter a higher one
    var maxValue: number = 0;
    const datasets: ChartDataset<"line">[] = [];
    for (var i: number = 0; i < sunTimeData.data.length; i++) {
      const sunTimeDataSeries: SunTimeDataSeries = sunTimeData.data[i];
      const location: Location = sunTimeDataSeries.location;
      const suntimes: SunTime[] = sunTimeDataSeries.sunTimes;
      const sunriseData: (number | null)[] = [];
      const sunsetData: (number | null)[] = [];

      for (var j: number = 0; j < sunTimeData.dates.length; j++) {
        const suntime: SunTime = suntimes[j];
        if (!suntime.polarNight) {
          const sunriseValue: number = Number(suntime.sunrise);
          const sunsetValue: number = Number(suntime.sunset);
          sunriseData.push(sunriseValue);
          sunsetData.push(sunsetValue);
          minValue = Math.min(minValue, sunriseValue);
          maxValue = Math.max(maxValue, sunsetValue);
        } else {
          sunriseData.push(null);
          sunsetData.push(null);
        }
      }

      datasets.push({
        label: locale.getMessage("chartSunriseLabel", location.getName(locale.language)),
        data: sunriseData,
        borderColor: colorInfo.accentColors[i % 8],
        backgroundColor: colorInfo.accentColors[i % 8],
        pointStyle: false
      });
      datasets.push({
        label: locale.getMessage("chartSunsetLabel", location.getName(locale.language)),
        data: sunsetData,
        borderColor: colorInfo.accentColors[i % 8],
        backgroundColor: colorInfo.accentColors[i % 8],
        pointStyle: false
      });
    }
    // round down to nearest whole hour
    minValue = Math.floor(minValue / SunTimeChartHelper.SECONDS_IN_HOUR) * SunTimeChartHelper.SECONDS_IN_HOUR;
    // round up to nearest whole hour
    maxValue = Math.ceil(maxValue / SunTimeChartHelper.SECONDS_IN_HOUR) * SunTimeChartHelper.SECONDS_IN_HOUR;

    const data: ChartData<"line"> = {
      labels: sunTimeData.daysSinceFirstDate,
      datasets: datasets
    };

    const options: ChartJSOptions<"line"> = {
      backgroundColor: colorInfo.normalBackgroundColor,
      borderColor: colorInfo.lineColorLight,
      color: colorInfo.normalForegroundColor,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          reverse: chartOptions.flipYAxis,
          suggestedMin: minValue,
          suggestedMax: maxValue,
          ticks: {
            callback: (value: string | number) => { return SunTimeChartHelper.yAxisLabel(value); },
            stepSize: SunTimeChartHelper.SECONDS_IN_HALF_HOUR,
            color: colorInfo.normalForegroundColor
          },
          grid: {
            color: (context: ScriptableScaleContext) => { return SunTimeChartHelper.yAxisLineColor(colorInfo, context); },
          }
        },
        x: {
          type: "linear",
          ticks: {
            callback: (value: string | number) => { return SunTimeChartHelper.xAxisLabel(locale, sunTimeData, value); },
            stepSize: 1,
            major: {
              enabled: true
            },
            autoSkip: false,
            color: colorInfo.normalForegroundColor
          },
          grid: {
            z: -2,
            color: (context: ScriptableScaleContext) => { return SunTimeChartHelper.xAxisLineColor(colorInfo, sunTimeData, context); },
            lineWidth: (context: ScriptableScaleContext) => { return SunTimeChartHelper.xAxisLineWidth(sunTimeData, context); }
          }
        }
      },
      animation: false,
      animations: {
        colors: false,
        x: false
      },
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      interaction: {
        mode: "nearest",

        intersect: false
      },
      plugins: {
        tooltip: {
          backgroundColor: colorInfo.highlightBackgroundColor,
          titleColor: colorInfo.highlightForegroundColor,
          bodyColor: colorInfo.highlightForegroundColor,
          borderColor: colorInfo.highlightBackgroundColor,
          multiKeyBackground: colorInfo.highlightBackgroundColor,
          displayColors: true,
          callbacks: {
            label: (context: TooltipItem<keyof ChartTypeRegistry>) => { return SunTimeChartHelper.tooltipLabel(context); },
            title: (context: TooltipItem<keyof ChartTypeRegistry>[]) => { return SunTimeChartHelper.tooltipTitle(locale, sunTimeData, context); },
            labelColor: (context: TooltipItem<keyof ChartTypeRegistry>) => { return SunTimeChartHelper.labelColor(colorInfo, context); }
          }
        }
      }
    };

    return [data, options];

  }


}
