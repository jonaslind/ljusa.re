import { DateTime } from "luxon";
import { Location } from "./Location";
import { QuarterInfo } from "./Quarter";
import { SunTime } from "./SunTime";

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

interface DateInfo {
  dates: DateTime[],
  daysSinceFirstDate: number[],
  indexOfToday: number
}

export class SunTimeDataHelper {

  private static dateInfoCache: Map<string, DateInfo> = new Map<string, DateInfo>();
  private static sunTimesCache: Map<string, SunTime[]> = new Map<string, SunTime[]>();

  public static getSunTimeData(quarter: QuarterInfo, locations: Location[]): SunTimeData {
    const dateInfo: DateInfo = SunTimeDataHelper.getDates(quarter);
    const series: SunTimeDataSeries[] = [];
    locations.forEach((location: Location) => {
      series.push({
        location: location,
        sunTimes: SunTimeDataHelper.getSunTimes(quarter, dateInfo.dates, location)
      });
    });
    return {
      indexOfToday: dateInfo.indexOfToday,
      daysSinceFirstDate: dateInfo.daysSinceFirstDate,
      dates: dateInfo.dates,
      data: series
    }
  }

  private static getDates(quarter: QuarterInfo): DateInfo {
    const cacheId: string = quarter.toString();
    if (!SunTimeDataHelper.dateInfoCache.has(cacheId)) {
      SunTimeDataHelper.dateInfoCache.set(cacheId, SunTimeDataHelper.calculateDates(quarter));
    }
    return SunTimeDataHelper.dateInfoCache.get(cacheId)!;
  }

  private static calculateDates(quarter: QuarterInfo): DateInfo {
    const startDate: DateTime = quarter.firstDay;
    const endDate: DateTime = quarter.lastDay;
    const today: DateTime = quarter.today;
    const dates: DateTime[] = [];
    const daysSinceFirstDate: number[] = [];
    var indexOfToday: number = -1;
    for (var date: DateTime = startDate; date.toUnixInteger() <= endDate.toUnixInteger(); date = date.plus({ days: 1 })) {
      dates.push(date);
      if (date.hasSame(today, 'day')) {
        indexOfToday = dates.length - 1;
      }
    }
    for (var i: number = 0; i < dates.length; i++) {
      daysSinceFirstDate.push(i);
    }
    return { dates, daysSinceFirstDate, indexOfToday };
  }

  private static getSunTimes(quarter: QuarterInfo, dates: DateTime[], location: Location): SunTime[] {
    const cacheId: string = location.id + "_" + quarter.toString();
    if (!SunTimeDataHelper.sunTimesCache.has(cacheId)) {
      SunTimeDataHelper.sunTimesCache.set(cacheId, SunTimeDataHelper.calculateSunTimes(dates, location));
    }
    return SunTimeDataHelper.sunTimesCache.get(cacheId)!;
  }

  private static calculateSunTimes(dates: DateTime[], location: Location): SunTime[] {
    const suntimes: SunTime[] = [];
    dates.forEach((date) => {
      const localDate: DateTime = DateTime.fromObject({ year: date.year, month: date.month, day: date.day, hour: date.hour }, { zone: location.zone });
      const suntime: SunTime = SunTime.fromTimestampAndLocation(localDate.toUnixInteger(), localDate.zone, location.latitude, location.longitude, location.elevation);
      suntimes.push(suntime);
    });
    return suntimes;
  }

}
