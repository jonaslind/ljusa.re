import { CategoryScale, Chart, ChartDataset, ChartTypeRegistry, Color, LinearScale, LineController, LineElement, PointElement, ScriptableScaleContext, Tooltip, TooltipItem, TooltipLabelStyle } from "chart.js";
import { DateTime } from "luxon";
import { ChartOptions } from "./chartcontrols";
import { Locale } from "./locale";
import { Location } from "./locations";
import { ColorInfo } from "./styles";
import { secondsOfDayToString, SunTime } from "./suntime";
import { SunTimeData, SunTimeDataSeries } from "./suntimes";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

export class SuntimeChart {

  private static SECONDS_IN_HOUR: number = 60 * 60;

  private static SECONDS_IN_HALF_HOUR: number = 30 * 60;

  private colorInfo: ColorInfo | null = null;

  private locale: Locale | null = null;

  private chartOptions: ChartOptions | null = null;

  private sunTimeData: SunTimeData | null = null;

  private chart: Chart | null = null;

  initSuntimeChart() {
    // Do nothing at the moment
  }

  localeChanged(locale: Locale) {
    this.locale = locale;
    this.updateSuntimes();
  }

  colorsChanged(colorInfo: ColorInfo) {
    this.colorInfo = colorInfo;
    this.updateSuntimes();
  }

  chartOptionsChanged(chartOptions: ChartOptions) {
    this.chartOptions = chartOptions;
    this.updateSuntimes();
  }

  dataChanged(sunTimeData: SunTimeData) {
    this.sunTimeData = sunTimeData;
    this.updateSuntimes();
  }

  private xAxisLabel(value: string | number): string {
    if (typeof value === "string") {
      throw new Error("Unexpected x axis value " + value);
    }
    if (value == this.sunTimeData!.indexOfToday) {
      return this.locale!.getMessage("chartToday");
    }
    if (value % 7 != 0) {
      return "";
    }
    const date: DateTime = this.sunTimeData!.dates[0].plus({ days: value });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: this.locale!.language });
  }

  private xAxisLineColor(context: ScriptableScaleContext): Color {
    if (context.tick.value == this.sunTimeData!.indexOfToday) {
      // Looks better when the Today line doesn't stand out as much
      return this.colorInfo!.lineColorLight;
    }
    return this.colorInfo!.lineColorLight;
  }

  private xAxisLineWidth(context: ScriptableScaleContext): number {
    if (context.tick.value == this.sunTimeData!.indexOfToday) {
      return 1;
    }
    if (context.tick.value % 7 != 0) {
      return 0;
    }
    return 1;
  }

  private yAxisLabel(value: string | number): string {
    if (typeof value === "string") {
      throw new Error("Unexpected y axis value " + value);
    }
    if (value % (SuntimeChart.SECONDS_IN_HOUR) != 0) {
      return "";
    }
    return secondsOfDayToString(BigInt(value));
  }

  private yAxisLineColor(context: ScriptableScaleContext): Color {
    if (context.tick.value % (SuntimeChart.SECONDS_IN_HOUR) != 0) {
      return this.colorInfo!.lineColorLight;
    }
    return this.colorInfo!.lineColorHeavy;
  }

  private tooltipTitle(context: TooltipItem<keyof ChartTypeRegistry>[]): string {
    const date: DateTime = this.sunTimeData!.dates[0].plus({ days: context[0].dataIndex });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: this.locale!.language });
  }

  private tooltipLabel(context: TooltipItem<keyof ChartTypeRegistry>): string {
    return context.dataset.label + ": " + secondsOfDayToString(BigInt(<number> context.raw));
  }

  private labelColor(context: TooltipItem<keyof ChartTypeRegistry>): TooltipLabelStyle {
    return {
      borderColor: this.colorInfo!.highlightBackgroundColor,
      backgroundColor: this.colorInfo!.accentColors[Math.floor(context.datasetIndex / 2) % 8]
    };
  }

  private updateSuntimes(): void {
    if (this.colorInfo === null || this.locale === null || this.chartOptions === null || this.sunTimeData === null || this.sunTimeData.data.length == 0) {
      if (this.chart != null) {
        this.chart.destroy();
      }
      return;
    }
    // high value so that we're sure to encounter a smaller one
    var minValue: number = 24 * SuntimeChart.SECONDS_IN_HOUR;
    // low value so that we're sure to encounter a higher one
    var maxValue: number = 0;
    const datasets: ChartDataset[] = [];
    for (var i: number = 0; i < this.sunTimeData.data.length; i++) {
      const sunTimeDataSeries: SunTimeDataSeries = this.sunTimeData.data[i];
      const location: Location = sunTimeDataSeries.location;
      const suntimes: SunTime[] = sunTimeDataSeries.sunTimes;
      const sunriseData: (number | null)[] = [];
      const sunsetData: (number | null)[] = [];

      for (var j: number = 0; j < this.sunTimeData.dates.length; j++) {
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
        label: this.locale.getMessage("chartSunriseLabel", location.getName(this.locale.language)),
        data: sunriseData,
        borderColor: this.colorInfo.accentColors[i % 8],
        backgroundColor: this.colorInfo.accentColors[i % 8],
        pointStyle: false
      });
      datasets.push({
        label: this.locale.getMessage("chartSunsetLabel", location.getName(this.locale.language)),
        data: sunsetData,
        borderColor: this.colorInfo.accentColors[i % 8],
        backgroundColor: this.colorInfo.accentColors[i % 8],
        pointStyle: false
      });
    }
    // round down to nearest whole hour
    minValue = Math.floor(minValue / SuntimeChart.SECONDS_IN_HOUR) * SuntimeChart.SECONDS_IN_HOUR;
    // round up to nearest whole hour
    maxValue = Math.ceil(maxValue / SuntimeChart.SECONDS_IN_HOUR) * SuntimeChart.SECONDS_IN_HOUR;

    const chartCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('chartCanvas');

    if (this.chart != null) {
      this.chart.destroy();
    }

    Chart.defaults.backgroundColor = this.colorInfo.normalBackgroundColor;
    Chart.defaults.borderColor = this.colorInfo.lineColorLight;
    Chart.defaults.color = this.colorInfo.normalForegroundColor;
    Chart.defaults.plugins.tooltip.backgroundColor = this.colorInfo.highlightBackgroundColor;
    Chart.defaults.plugins.tooltip.titleColor = this.colorInfo.highlightForegroundColor;
    Chart.defaults.plugins.tooltip.bodyColor = this.colorInfo.highlightForegroundColor;
    Chart.defaults.plugins.tooltip.borderColor = this.colorInfo.highlightBackgroundColor;
    Chart.defaults.plugins.tooltip.multiKeyBackground = this.colorInfo.highlightBackgroundColor;

    this.chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: this.sunTimeData.daysSinceFirstDate,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            reverse: this.chartOptions.flipYAxis,
            suggestedMin: minValue,
            suggestedMax: maxValue,
            ticks: {
              callback: (value: string | number) => { return this.yAxisLabel(value); },
              stepSize: SuntimeChart.SECONDS_IN_HALF_HOUR
            },
            grid: {
              color: (context: ScriptableScaleContext) => { return this.yAxisLineColor(context); },
            }
          },
          x: {
            type: "linear",
            ticks: {
              callback: (value: string | number) => { return this.xAxisLabel(value); },
              stepSize: 1,
              major: {
                enabled: true
              },
              autoSkip: false
            },
            grid: {
              z: -2,
              color: (context: ScriptableScaleContext) => { return this.xAxisLineColor(context); },
              lineWidth: (context: ScriptableScaleContext) => { return this.xAxisLineWidth(context); }
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
            displayColors: true,
            callbacks: {
              label: (context: TooltipItem<keyof ChartTypeRegistry>) => { return this.tooltipLabel(context); },
              title: (context: TooltipItem<keyof ChartTypeRegistry>[]) => { return this.tooltipTitle(context); },
              labelColor: (context: TooltipItem<keyof ChartTypeRegistry>) => { return this.labelColor(context); }
            }
          }
        }
      }
    });
  }

}
