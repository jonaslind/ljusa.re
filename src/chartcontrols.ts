export interface ChartOptions {
  flipYAxis: boolean;
}

export class ChartControls {

  private callbacks: ((chartOptions: ChartOptions) => void)[] = [];
  private currentOptions: ChartOptions = ChartControls.loadOptions();

  initOptions(): void {
    const yAxisDirectionToggle: HTMLElement | null = document.getElementById("yAxisDirectionToggle");
    if (yAxisDirectionToggle == null) {
      return;
    }
    yAxisDirectionToggle.addEventListener("click", (event: Event) => { this.toggleYAxisDirection() });
  }

  registerChangeCallback(callback: ((chartOptions: ChartOptions) => void)): void {
    this.callbacks.push(callback);
    callback(this.currentOptions);
  }

  private optionsChanged(): void {
    this.callbacks.forEach((callback: ((chartOptions: ChartOptions) => void)) => {
      callback(this.currentOptions);
    });
  }

  private static loadOptions(): ChartOptions {
    const preferredFlipYAxis = localStorage.getItem("preferredFlipYAxis");
    if (preferredFlipYAxis != null && preferredFlipYAxis == "true") {
      return { flipYAxis: true };
    }
    return { flipYAxis: false };
  }

  private toggleYAxisDirection(): void {
    this.currentOptions = { flipYAxis: !this.currentOptions.flipYAxis };
    localStorage.setItem("preferredFlipYAxis", this.currentOptions.flipYAxis ? "true" : "false");
    this.optionsChanged();
  }

}
