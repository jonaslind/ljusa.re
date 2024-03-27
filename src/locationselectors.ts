import { Locale } from "./locale";
import { getLocationIdForName, Location, locations } from "./locations";

export class LocationSelectors {

  private callbacks: ((locations: Location[]) => void)[] = [];

  private selectedLocationIds: string[] = [];
  private selectedLocations: Location[] = [];

  private locale: Locale;

  localeChanged(locale: Locale) {
    if (document.getElementById('locationSelector') == null) {
      return;
    }
    this.locale = locale;
    this.updateLocationSelector();
  }

  initLocationSelectors() {
    if (document.getElementById('locationSelector') == null) {
      return;
    }
    this.loadSelectedLocations();
  }

  registerChangeCallback(callback: ((locations: Location[]) => void)): void {
    this.callbacks.push(callback);
    callback(this.selectedLocations);
  }

  private locationsChanged() {
    this.selectedLocations = [];
    this.selectedLocationIds.forEach((selectedLocationId: string) => {
      this.selectedLocations.push(locations.get(selectedLocationId));
    })
    this.callbacks.forEach((callback: ((locations: Location[]) => void)) => {
      callback(this.selectedLocations);
    });
  }

  private updateLocationSelector() {
    if (this.locale == null) {
      return;
    }
    const chosenLocationsContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("chosenLocations");
    const locationDataList: HTMLDataListElement = <HTMLDataListElement> document.getElementById("locationDataList");

    const options: HTMLOptionElement[] = [];
    locations.forEach((value: Location, key: string) => {
      if (this.selectedLocationIds.includes(key)) {
        return;
      }
      const option: HTMLOptionElement = <HTMLOptionElement> document.createElement("option");
      option.value = value.names.get(this.locale.language);
      options.push(option);
    });
    locationDataList.replaceChildren(...options);

    const chosenLocations: HTMLSpanElement[] = [];
    for (var i: number = 0; i < this.selectedLocationIds.length; i++) {
      const selectedLocation: string = this.selectedLocationIds[i];

      const chosenLocation: HTMLSpanElement = <HTMLSpanElement> document.createElement("span");
      chosenLocation.className = "chosenLocation accentColor" + (i % 8);
      chosenLocation.appendChild(document.createTextNode(locations.get(selectedLocation).names.get(this.locale.language)));
      const removeLocationIcon: HTMLElement = document.createElement("i");
      removeLocationIcon.className = "removeLocation";
      removeLocationIcon.dataset.value = selectedLocation;
      removeLocationIcon.addEventListener("click", (event: Event) => {
        this.removeLocationClicked(<HTMLElement> event.target);
      });
      chosenLocation.appendChild(removeLocationIcon);
      chosenLocations.push(chosenLocation);
    }
    chosenLocationsContainer.replaceChildren(...chosenLocations);

    this.locationsChanged();
  }


  private loadSelectedLocations() {
    var selectedLocationsString: string = localStorage.getItem("selectedLocationsString");
    if (selectedLocationsString != null) {
      const selectedLocationsArray: string[] = JSON.parse(selectedLocationsString);
      selectedLocationsArray.forEach((selectedLocation) => {
        if (locations.has(selectedLocation)) {
          this.selectedLocationIds.push(selectedLocation);
        }
      });
    } else {
      this.selectedLocationIds.push("stockholm_sweden");
    }
    const locationSelector: HTMLInputElement = <HTMLInputElement> document.getElementById("locationSelector");
    locationSelector.addEventListener("change", (event: Event) => {
      this.locationSelectorChanged(<HTMLInputElement> event.target);
    });
    this.updateLocationSelector();
  }

  private locationSelectorChanged(locationSelector: HTMLInputElement) {
    const currentValue: string = locationSelector.value;
    const currentLocationId: string = getLocationIdForName(currentValue);
    if (currentLocationId == null) {
      return;
    }
    this.selectedLocationIds.push(currentLocationId);
    localStorage.setItem("selectedLocationsString", JSON.stringify(this.selectedLocationIds));
    locationSelector.value = "";
    this.updateLocationSelector();
  }

  private removeLocationClicked(removeLocationIcon: HTMLElement) {
    this.selectedLocationIds.splice(this.selectedLocationIds.indexOf(removeLocationIcon.dataset.value), 1);
    localStorage.setItem("selectedLocationsString", JSON.stringify(this.selectedLocationIds));
    this.updateLocationSelector();
  }

}
