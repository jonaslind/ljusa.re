import React, { Dispatch, SetStateAction } from "react";
import { Locale } from "../Locale";
import { Location, LocationArray, Locations } from "../Location";

export interface LocationSelectorProps {
  locale: Locale;
  selectedLocations: LocationArray;
  locations: Locations;
  setSelectedLocations: Dispatch<SetStateAction<LocationArray>>;
}

export function LocationSelector({ locale, selectedLocations, locations, setSelectedLocations }: LocationSelectorProps): JSX.Element {

  const removeLocationClicked: ((locationId: string) => void) = function(locationId: string): void {
    const newSelectedLocations: LocationArray = new LocationArray(
      ...selectedLocations.filter((location: Location) => location.id != locationId)
    );
    setSelectedLocations(newSelectedLocations);
  }

  const locationSelectorFocused: ((locationSelector: HTMLInputElement) => void) = function(locationSelector: HTMLInputElement): void {
    locationSelector.placeholder = "";
  }
  const locationSelectorBlurred: ((locationSelector: HTMLInputElement) => void) = function(locationSelector: HTMLInputElement): void {
    locationSelector.placeholder = locale.getMessage("locationSelector");
  }
  const locationSelectorChanged: ((locationSelector: HTMLInputElement) => void) = function(locationSelector: HTMLInputElement): void {
    const currentValue: string = locationSelector.value;
    const currentLocation: Location | null = locations.getLocationForName(currentValue);
    if (currentLocation == null) {
      return;
    }
    if (selectedLocations.includes(currentLocation)) {
      return;
    }
    const newSelectedLocations: LocationArray = new LocationArray(...selectedLocations, currentLocation);
    locationSelector.value = "";
    //  locationSelector.placeholder = locale.getMessage("locationSelector");
    setSelectedLocations(newSelectedLocations);
  }

  const selectedLocationSpans: JSX.Element[] = [];
  for (var i: number = 0; i < selectedLocations.length; i++) {
    const selectedLocation: Location = selectedLocations[i];
    const className: string = "chosenLocation accentColor" + (i % 8);

    selectedLocationSpans.push(
      <span className={className} key={selectedLocation.id}>{selectedLocation.getName(locale.language)}
        <i className="removeLocation" onClick={() => removeLocationClicked(selectedLocation.id)}></i>
      </span>
    );
  }

  const unselectedLocationOptions: JSX.Element[] = locations.getAllUnselected(selectedLocations).map(location =>
    <option value={location.getName(locale.language)} key={location.id} />
  );

  return (
    <div>
      <label>{locale.getMessage("placesLabel")}</label>
      <div className="chosenLocations" id="chosenLocations">
        {selectedLocationSpans}
      </div>

      <datalist id="locationDataList">
        {unselectedLocationOptions}
      </datalist>
      <div className="locationSelectorContainer">
        <i className="searchIcon">🔍</i>
        <input type="text" name="locationSelector" id="locationSelector" className="locationSelector"
          list="locationDataList" placeholder={locale.getMessage("locationSelector")}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            locationSelectorChanged(event.target);
          }}
          onFocus={(event: React.ChangeEvent<HTMLInputElement>) => {
            locationSelectorFocused(event.target);
          }}
          onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
            locationSelectorBlurred(event.target);
          }}
        />
      </div>
    </div>
  );
}
