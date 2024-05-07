export interface ChartOptions {
  flipYAxis: boolean;
}

function isChartOptions(obj: unknown): obj is ChartOptions {
  return (obj as ChartOptions)?.flipYAxis !== undefined
    && typeof (obj as ChartOptions).flipYAxis === "boolean";
}

export const defaultChartOptions: ChartOptions = { flipYAxis: false };


export class ChartOptionsSerializer {
  stringify: (value: unknown) => string = (value: unknown) => this.serializeUnknown(value);
  parse: (value: string) => ChartOptions = (value: string) => this.deserialize(value);


  private serializeUnknown(value: unknown): string {
    if (isChartOptions(value))
      return this.serialize(value);
    throw new Error("Cannot serialize " + value + " into ChartOptions");
  }

  private serialize(chartOptions: ChartOptions): string {
    return chartOptions.flipYAxis ? "true" : "false";
  }

  private deserialize(value: string): ChartOptions {
    if (value === "true") {
      return { flipYAxis: true };
    } else {
      return { flipYAxis: false };
    }
  }
}
