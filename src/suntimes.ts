import { DateTime } from "luxon";
import { Location } from "./locations";
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

  initSunTimes() {
    this.loadDates();
    this.createSuntimeData([]);
  }

  registerChangeCallback(callback: ((sunTimeData: SunTimeData) => void)): void {
    this.callbacks.push(callback);
    callback(this.suntimeData);
  }

  locationsChanged(locations: Location[]) {
    this.createSuntimeData(locations);
    this.callbacks.forEach((callback: ((sunTimeData: SunTimeData) => void)) => {
      callback(this.suntimeData);
    });
  }

  private loadDates() {
    const startDate: DateTime = SunTimes.firstMondayInJanuary(DateTime.now().year);
    const endDate: DateTime = SunTimes.firstSundayInApril(DateTime.now().year);
    const today: DateTime = SunTimes.getToday();
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

  private createSuntimeData(locations: Location[]) {
    const series: SunTimeDataSeries[] = [];
    locations.forEach((location: Location) => {
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
    if (!this.dataCache.has(location.id)) {
      const suntimes: SunTime[] = [];
      this.dates.forEach((date) => {
        const localDate: DateTime = DateTime.fromObject({ year: date.year, month: date.month, day: date.day, hour: date.hour }, { zone: location.zone });
        const suntime: SunTime = SunTime.fromTimestampAndLocation(localDate.toUnixInteger(), localDate.zone, location.latitude, location.longitude, location.elevation);
        suntimes.push(suntime);
      });
      this.dataCache.set(location.id, suntimes);
    }
    return this.dataCache.get(location.id);
  }

  private static getToday(): DateTime {
    return DateTime.now().set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
  }

  private static firstMondayInJanuary(year: number): DateTime {
    const noonFirstOfJanuary: DateTime = DateTime.now().set({ year: year, month: 1, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
    for (var i: number = 1; i <= 7; i++) {
      const candidate: DateTime = noonFirstOfJanuary.set({ day: i });
      if (candidate.weekday == 1) {
        return candidate;
      }
    }
    throw new Error("Cannot find a Monday in January");
  }

  private static firstSundayInApril(year: number): DateTime {
    const noonFirstOfApril: DateTime = DateTime.now().set({ year: year, month: 4, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
    for (var i: number = 1; i <= 7; i++) {
      const candidate: DateTime = noonFirstOfApril.set({ day: i });
      if (candidate.weekday == 7) {
        return candidate;
      }
    }
    throw new Error("Cannot find a Sunday in April");
  }

}
