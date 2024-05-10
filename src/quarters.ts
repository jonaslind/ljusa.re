import { DateTime } from "luxon";
import { Locale } from "./locale";

export interface QuarterInfo {
  firstDay: DateTime;
  lastDay: DateTime;
  today: DateTime;
}

class QuarterInfoImpl implements QuarterInfo {

  year: string;
  quarter: string;
  firstDay: DateTime;
  firstDayInQuarter: DateTime;
  lastDay: DateTime;
  today: DateTime;

  constructor(year: string, quarter: string, firstDay: DateTime, firstDayInQuarter: DateTime, lastDay: DateTime, today: DateTime) {
    this.year = year;
    this.quarter = quarter;
    this.firstDay = firstDay;
    this.firstDayInQuarter = firstDayInQuarter;
    this.lastDay = lastDay;
    this.today = today;
  }

  previous(): QuarterInfoImpl {
    const newFirstDayInQuarter: DateTime = this.firstDayInQuarter.minus({ months: 3 });
    return QuarterInfoImpl.fromYearAndQuarter(newFirstDayInQuarter.year, newFirstDayInQuarter.quarter);
  }
  next(): QuarterInfoImpl {
    const newFirstDayInQuarter: DateTime = this.firstDayInQuarter.plus({ months: 3 });
    return QuarterInfoImpl.fromYearAndQuarter(newFirstDayInQuarter.year, newFirstDayInQuarter.quarter);
  }

  toString(): string {
    return this.year + "-" + this.quarter;
  }

  static fromString(str: string): QuarterInfoImpl {
    const parts: string[] = str.split('-');
    if (parts.length != 2) {
      console.log("Bad quarter representation " + str);
      return QuarterInfoImpl.current();
    }
    const year: number = Number(parts[0]);
    const quarter: number = Number(parts[1]);
    if (isNaN(year) || isNaN(quarter)) {
      console.log("Bad quarter representation " + str);
      return QuarterInfoImpl.current();
    }
    return QuarterInfoImpl.fromYearAndQuarter(year, quarter);
  }

  static current(): QuarterInfoImpl {
    const today: DateTime = QuarterInfoImpl.getToday();
    return QuarterInfoImpl.fromYearAndQuarter(today.year, today.quarter);
  }

  static fromYearAndQuarter(year: number, quarter: number): QuarterInfoImpl {
    if (quarter < 0 || 4 < quarter) {
      console.log("Bad quarter " + quarter);
      return QuarterInfoImpl.current();
    }
    return new QuarterInfoImpl(
      year.toString(),
      quarter.toString(),
      QuarterInfoImpl.firstMondayBeforeOrAtStartOfQuarter(year, quarter),
      QuarterInfoImpl.firstDayOfQuarter(year, quarter),
      QuarterInfoImpl.firstMondayInNextQuarter(year, quarter),
      QuarterInfoImpl.getToday());
  }

  private static getToday(): DateTime {
    return DateTime.now().set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
  }

  private static firstDayOfQuarter(year: number, quarter: number): DateTime {
    const month = (quarter * 3) - 2;
    return DateTime.now()
      .set({ year: year, month: month, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
  }

  private static firstMondayBeforeOrAtStartOfQuarter(year: number, quarter: number): DateTime {
    const month = (quarter * 3) - 2;
    const noonFirstOfMonth: DateTime = DateTime.now()
      .set({ year: year, month: month, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });
    for (var i: number = 0; i < 7; i++) {
      const candidate: DateTime = noonFirstOfMonth.minus({ days: i });
      if (candidate.weekday == 1) {
        return candidate;
      }
    }
    throw new Error("Cannot find a Monday at or before " + noonFirstOfMonth.monthLong);
  }

  private static firstMondayInNextQuarter(year: number, quarter: number): DateTime {
    if (quarter < 0 || 4 < quarter) {
      console.log("Bad quarter " + quarter);
      return QuarterInfoImpl.firstMondayInNextQuarter(year, 1);
    }
    const month = (quarter * 3) - 2;
    const noonFirstOfNextQuarter: DateTime = DateTime.now()
      .set({ year: year, month: month, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 })
      .plus({ months: 3 });
    for (var i: number = 1; i <= 7; i++) {
      const candidate: DateTime = noonFirstOfNextQuarter.set({ day: i });
      if (candidate.weekday == 1) {
        return candidate;
      }
    }
    throw new Error("Cannot find a Monday in " + noonFirstOfNextQuarter.monthLong);
  }

}

export class Quarters {

  private callbacks: ((quarter: QuarterInfo) => void)[] = [];

  private locale: Locale | null = null;
  private quarter: QuarterInfoImpl | null = null;

  initQuarters(): void {
    if (document.getElementById('quarterTitle') == null) {
      return;
    }
    this.loadQuarter();
  }

  registerChangeCallback(callback: ((quarter: QuarterInfo) => void)): void {
    this.callbacks.push(callback);
    if (this.quarter !== null) {
      callback(this.quarter);
    }
  }

  localeChanged(locale: Locale): void {
    this.locale = locale;
    this.updateQuarter();
  }

  prevQuarter(): void {
    this.quarter = this.quarter!.previous();
    window.location.hash = this.quarter.toString();
    this.updateQuarter();
  }

  nextQuarter(): void {
    this.quarter = this.quarter!.next();
    window.location.hash = this.quarter.toString();
    this.updateQuarter();
  }

  private refreshQuarter(): void {
    if (window.location.hash) {
      this.quarter = QuarterInfoImpl.fromString(window.location.hash.substring(1));
      window.location.hash = this.quarter.toString();
    } else {
      this.quarter = QuarterInfoImpl.current();
    }
    this.updateQuarter();
  }

  private updateQuarter(): void {
    if (this.locale == null || this.quarter == null) {
      return;
    }
    const quarterTitle: HTMLElement | null = document.getElementById("quarterTitle");
    if (quarterTitle === null) {
      throw new Error("Missing element quarterTitle");
    }
    quarterTitle.innerText = this.locale.getMessage("quarterTitle", this.quarter.year, this.quarter.quarter);

    this.callbacks.forEach((callback: ((quarter: QuarterInfo) => void)) => {
      callback(this.quarter!);
    });
  }

  private loadQuarter(): void {
    this.refreshQuarter();
    const prevQuarterLink: HTMLElement | null = document.getElementById("prevQuarterLink");
    const nextQuarterLink: HTMLElement | null = document.getElementById("nextQuarterLink");
    if (prevQuarterLink === null || nextQuarterLink === null) {
      throw new Error("Missing elements prevQuarterLink and/or nextQuarterLink");
    }
    prevQuarterLink.addEventListener("click", (event: Event) => { this.prevQuarter() });
    nextQuarterLink.addEventListener("click", (event: Event) => { this.nextQuarter() });
    window.addEventListener("hashchange", () => { this.refreshQuarter() });
  }

}
