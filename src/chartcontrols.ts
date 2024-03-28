export interface ChartOptions {
  flipYAxis: boolean;
}

export class ChartControls {

  private callbacks: ((chartOptions: ChartOptions) => void)[] = [];
  private currentOptions: ChartOptions = null;

  initOptions(): void {
    if (document.getElementById('yAxisDirectionToggle') == null) {
      return;
    }
    this.activateFirstOptions();
  }

  registerChangeCallback(callback: ((chartOptions: ChartOptions) => void)): void {
    this.callbacks.push(callback);
    callback(this.currentOptions);
  }

  private optionsChanged() {
    this.callbacks.forEach((callback: ((chartOptions: ChartOptions) => void)) => {
      callback(this.currentOptions);
    });
  }

  private activateFirstOptions(): void {
    const preferredFlipYAxis = localStorage.getItem("preferredFlipYAxis");
    if (preferredFlipYAxis != null && preferredFlipYAxis == "true") {
      this.currentOptions = { flipYAxis: true };
    } else {
      this.currentOptions = { flipYAxis: false };
    }
    const yAxisDirectionToggle: HTMLElement = document.getElementById("yAxisDirectionToggle");
    yAxisDirectionToggle.addEventListener("click", (event: Event) => { this.toggleYAxisDirection() });
  }

  private toggleYAxisDirection(): void {
    this.currentOptions = { flipYAxis: !this.currentOptions.flipYAxis };
    localStorage.setItem("preferredFlipYAxis", this.currentOptions.flipYAxis ? "true" : "false");
    this.optionsChanged();
  }

}
