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

  private colorInfo: ColorInfo;

  private locale: Locale;

  private chartOptions: ChartOptions;

  private sunTimeData: SunTimeData;

  private chart: Chart;

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

  private xAxisLabel(value: number): string {
    if (value == this.sunTimeData.indexOfToday) {
      return this.locale.getMessage("chartToday");
    }
    if (value % 7 != 0) {
      return "";
    }
    const date: DateTime = this.sunTimeData.dates[0].plus({ days: value });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: this.locale.language });
  }

  private xAxisLineColor(context: ScriptableScaleContext): Color {
    if (context.tick.value == this.sunTimeData.indexOfToday) {
      // Looks better when the Today line doesn't stand out as much
      return this.colorInfo.lineColorLight;
    }
    return this.colorInfo.lineColorLight;
  }

  private xAxisLineWidth(context: ScriptableScaleContext): number {
    if (context.tick.value == this.sunTimeData.indexOfToday) {
      return 1;
    }
    if (context.tick.value % 7 != 0) {
      return 0;
    }
    return 1;
  }

  private yAxisLabel(value: number): string {
    if (value % (60 * 60) != 0) {
      return "";
    }
    return secondsOfDayToString(BigInt(value));
  }

  private yAxisLineColor(context: ScriptableScaleContext): Color {
    if (context.tick.value % (60 * 60) != 0) {
      return this.colorInfo.lineColorLight;
    }
    return this.colorInfo.lineColorHeavy;
  }

  private tooltipTitle(context: TooltipItem<keyof ChartTypeRegistry>[]): string {
    const date: DateTime = this.sunTimeData.dates[0].plus({ days: context[0].dataIndex });
    return date.toLocaleString({
      month: "short",
      day: "numeric"
    }, { locale: this.locale.language });
  }

  private tooltipLabel(context: TooltipItem<keyof ChartTypeRegistry>): string {
    return context.dataset.label + ": " + secondsOfDayToString(BigInt(<number> context.raw));
  }

  private labelColor(context: TooltipItem<keyof ChartTypeRegistry>): TooltipLabelStyle {
    return {
      borderColor: this.colorInfo.highlightBackgroundColor,
      backgroundColor: this.colorInfo.accentColors[Math.floor(context.datasetIndex / 2) % 8]
    };
  }

  private updateSuntimes() {
    if (this.colorInfo == null || this.sunTimeData == null || this.chartOptions == null || this.sunTimeData.data.length == 0) {
      if (this.chart != null) {
        this.chart.destroy();
      }
      return;
    }
    const datasets: ChartDataset[] = [];
    for (var i: number = 0; i < this.sunTimeData.data.length; i++) {
      const sunTimeDataSeries: SunTimeDataSeries = this.sunTimeData.data[i];
      const location: Location = sunTimeDataSeries.location;
      const suntimes: SunTime[] = sunTimeDataSeries.sunTimes;
      const sunriseData: number[] = [];
      const sunsetData: number[] = [];

      for (var j: number = 0; j < this.sunTimeData.dates.length; j++) {
        const suntime: SunTime = suntimes[j];
        sunriseData.push(suntime.sunrise != null ? Number(suntime.sunrise) : null);
        sunsetData.push(suntime.sunset != null ? Number(suntime.sunset) : null);
      }

      datasets.push({
        label: this.locale.getMessage("chartSunriseLabel", location.names.get(this.locale.language)),
        data: sunriseData,
        borderColor: this.colorInfo.accentColors[i % 8],
        backgroundColor: this.colorInfo.accentColors[i % 8],
        pointStyle: false
      });
      datasets.push({
        label: this.locale.getMessage("chartSunsetLabel", location.names.get(this.locale.language)),
        data: sunsetData,
        borderColor: this.colorInfo.accentColors[i % 8],
        backgroundColor: this.colorInfo.accentColors[i % 8],
        pointStyle: false
      });
    }

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
            ticks: {
              callback: (value: number) => { return this.yAxisLabel(value); },
              stepSize: 30 * 60
            },
            grid: {
              color: (context: ScriptableScaleContext) => { return this.yAxisLineColor(context); },
            }
          },
          x: {
            type: "linear",
            ticks: {
              callback: (value: number) => { return this.xAxisLabel(value); },
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
