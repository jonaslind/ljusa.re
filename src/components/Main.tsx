import React, { Dispatch, SetStateAction } from "react";
import useLocalStorageState, { LocalStorageState } from 'use-local-storage-state';
import { ChartOptions, ChartOptionsSerializer, defaultChartOptions } from "../ChartOptions";
import { Locale } from "../Locale";
import { LocationArray, LocationArraySerializer, Locations } from "../Location";
import { QuarterInfo, QuarterInfoSerializer, Quarters } from "../Quarter";
import { Style } from "../Style";
import useLocationHashState from "../useLocationHashState";
import { ChartControls } from "./ChartControls";
import { LocationSelector } from "./LocationSelector";
import { QuarterSelector } from "./QuarterSelector";
import { SunTimeChart } from "./SunTimeChart";

export interface StartProps {
  locale: Locale;
  style: Style;
}

export function Main({ locale, style }: StartProps): JSX.Element {

  const locations: Locations = new Locations();
  const [selectedLocations, setSelectedLocations]: LocalStorageState<LocationArray> = useLocalStorageState<LocationArray>(
    "selectedLocationsString",
    {
      defaultValue: locations.default(), serializer: new LocationArraySerializer(locations)
    }
  );

  const quarters: Quarters = new Quarters();
  const [quarter, setQuarter]: [QuarterInfo, Dispatch<SetStateAction<QuarterInfo>>] = useLocationHashState<QuarterInfo>(
    {
      defaultValue: quarters.default(),
      serializer: new QuarterInfoSerializer()
    }
  );

  const [chartOptions, setChartOptions]: LocalStorageState<ChartOptions> = useLocalStorageState<ChartOptions>(
    "preferredFlipYAxis",
    {
      defaultValue: defaultChartOptions, serializer: new ChartOptionsSerializer()
    }
  );

  return (
    <>
      <LocationSelector locale={locale} selectedLocations={selectedLocations} locations={locations}
        setSelectedLocations={setSelectedLocations} />

      <QuarterSelector locale={locale} quarter={quarter} quarters={quarters} setQuarter={setQuarter} />

      <SunTimeChart quarter={quarter} locations={selectedLocations} locale={locale} colorInfo={style.colorInfo}
        chartOptions={chartOptions} />

      <ChartControls chartOptions={chartOptions} setChartOptions={setChartOptions} />
    </>
  );
}
