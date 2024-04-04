import { DateTime } from "luxon";
import { Location } from "./locations";
import { QuarterInfo } from "./quarters";
import { SunTime } from "./suntime";

export interface SunTimeDataSeries {
  location: Location,
  sunTimes: SunTime[]
}

export interface SunTimeData {
  indexOfToday: number,
  daysSinceFirstDate: number[],
  dates: DateTime[],
  data: SunTimeDataSeries[]
}

export class SunTimes {

  private callbacks: ((sunTimeData: SunTimeData) => void)[] = [];
  private dates: DateTime[] = [];
  private indexOfToday: number = -1;
  private daysSinceFirstDate: number[] = [];
  private dataCache: Map<String, SunTime[]> = new Map<String, SunTime[]>();
  private suntimeData: SunTimeData;
  private quarter: QuarterInfo;
  private locations: Location[];

  initSunTimes() {
    this.loadDates();
    this.createSuntimeData();
  }

  registerChangeCallback(callback: ((sunTimeData: SunTimeData) => void)): void {
    this.callbacks.push(callback);
    callback(this.suntimeData);
  }

  locationsChanged(locations: Location[]) {
    this.locations = locations;
    this.createSuntimeData();
    this.callbacks.forEach((callback: ((sunTimeData: SunTimeData) => void)) => {
      callback(this.suntimeData);
    });
  }

  quarterChanged(quarter: QuarterInfo) {
    this.quarter = quarter;
    this.loadDates();
    this.createSuntimeData();
    this.callbacks.forEach((callback: ((sunTimeData: SunTimeData) => void)) => {
      callback(this.suntimeData);
    });
  }

  private loadDates() {
    if (this.quarter == null) {
      return;
    }
    const startDate: DateTime = this.quarter.firstDay;
    const endDate: DateTime = this.quarter.lastDay;
    const today: DateTime = this.quarter.today;
    this.dates = [];
    this.daysSinceFirstDate = [];
    this.indexOfToday = -1;
    for (var date: DateTime = startDate; date.toUnixInteger() <= endDate.toUnixInteger(); date = date.plus({ days: 1 })) {
      this.dates.push(date);
      if (date.hasSame(today, 'day')) {
        this.indexOfToday = this.dates.length - 1;
      }
    }
    for (var i: number = 0; i < this.dates.length; i++) {
      this.daysSinceFirstDate.push(i);
    }
  }

  private createSuntimeData() {
    if (this.dates.length == 0 || this.locations == null) {
      return;
    }
    const series: SunTimeDataSeries[] = [];
    this.locations.forEach((location: Location) => {
      series.push({
        location: location,
        sunTimes: this.getSunTimes(location)
      });
    });
    this.suntimeData = {
      indexOfToday: this.indexOfToday,
      daysSinceFirstDate: this.daysSinceFirstDate,
      dates: this.dates,
      data: series
    }
  }

  private getSunTimes(location: Location): SunTime[] {
    const cacheId: string = location.id + "_" + this.quarter;
    if (!this.dataCache.has(cacheId)) {
      const suntimes: SunTime[] = [];
      this.dates.forEach((date) => {
        const localDate: DateTime = DateTime.fromObject({ year: date.year, month: date.month, day: date.day, hour: date.hour }, { zone: location.zone });
        const suntime: SunTime = SunTime.fromTimestampAndLocation(localDate.toUnixInteger(), localDate.zone, location.latitude, location.longitude, location.elevation);
        suntimes.push(suntime);
      });
      this.dataCache.set(cacheId, suntimes);
    }
    return this.dataCache.get(cacheId);
  }


}
