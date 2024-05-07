import { DateTime } from "luxon";
import { Location, Locations } from "../src/Location";
import { SunTime, secondsOfDayNoRolloverToString, secondsOfDayToString } from "../src/SunTime";

const stockholm: Location = new Locations().getLocationForId("stockholm_sweden")!;
const montreal: Location = new Locations().getLocationForId("montreal_canada")!;
const ilulissat: Location = new Locations().getLocationForId("ilulissat_greenland")!;
const baku: Location = new Locations().getLocationForId("baku_azerbaijan")!;
const mcmurdo: Location = new Locations().getLocationForId("mcmurdo_station_antarctica")!;

new Locations().getAll().forEach((location) => {
  const dates: DateTime[] = [
    DateTime.fromObject({ year: 2024, month: 1, day: 1, hour: 12 }, { zone: location.zone }),
    DateTime.fromObject({ year: 2024, month: 4, day: 1, hour: 12 }, { zone: location.zone }),
    DateTime.fromObject({ year: 2024, month: 7, day: 1, hour: 12 }, { zone: location.zone }),
    DateTime.fromObject({ year: 2024, month: 10, day: 1, hour: 12 }, { zone: location.zone })
  ];
  dates.forEach((date) => {
    describe("Validate that all locations calculate sunrise and sunset without error", () => {
      test("Validate " + location.getName("en-gb") + " (" + location.latitude + ", " + location.longitude + ", " + location.elevation + ") on " + date.toISODate(), () => {
        const suntime: SunTime = SunTime.fromTimestampAndLocation(date.toUnixInteger(), date.zone, location.latitude, location.longitude, location.elevation);
        if(suntime.polarNight){
          expect(() => {suntime.sunrise}).toThrow();
          expect(() => {suntime.sunset}).toThrow();
        } else {
          expect(suntime.sunriseAsString()).toEqual(expect.anything());
          expect(suntime.sunsetAsString()).toEqual(expect.anything());
        }
      });
    });
  });
});

describe("testing 2024-01-16 in Stockholm", () => {
  test("2024-01-16 in Stockholm", () => {
    const location: Location = stockholm;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 1, day: 16, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(false);
    expect(suntime.sunriseAsString()).toBe("08:29:42");
    expect(suntime.sunsetAsString()).toBe("15:26:54");
  });
});

describe("testing 2024-01-15 in Montreal", () => {
  test("2024-01-15 in Montreal", () => {
    const location: Location = montreal;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 1, day: 15, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(false);
    expect(suntime.sunriseAsString()).toBe("07:28:15");
    expect(suntime.sunsetAsString()).toBe("16:41:47");
  });
});

describe("testing 2024-01-13 in Ilulissat", () => {
  test("2024-01-13 in Ilulissat", () => {
    const location: Location = ilulissat;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 1, day: 13, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(false);
    expect(suntime.sunriseAsString()).toBe("12:50:49");
    expect(suntime.sunsetAsString()).toBe("14:17:49");
  });
});

describe("testing 2024-01-01 in Ilulissat", () => {
  test("2024-01-01 in Ilulissat", () => {
    const location: Location = ilulissat;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 1, day: 1, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(true)
    expect(() => {suntime.sunrise}).toThrow();
    expect(() => {suntime.sunset}).toThrow();
  });
});

describe("testing 2024-03-02 in Baku", () => {
  test("2024-03-02 in Baku", () => {
    const location: Location = baku;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 3, day: 2, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(false);
    expect(suntime.sunriseAsString()).toBe("07:14:51");
    expect(suntime.sunsetAsString()).toBe("18:33:11");
  });
});

describe("testing 2024-02-21 in McMurdo", () => {
  test("2024-02-21 in McMurdo", () => {
    const location: Location = mcmurdo;
    const timestamp: number = DateTime.fromObject({ year: 2024, month: 2, day: 21, hour: 12 }, { zone: location.zone }).toUnixInteger();
    const suntime: SunTime = SunTime.fromTimestampAndLocation(timestamp, location.zone, location.latitude, location.longitude, location.elevation);
    expect(suntime.polarNight).toBe(false);
    expect(suntime.sunriseAsString()).toBe("03:05:55");
    expect(suntime.sunsetAsString()).toBe("25:11:11");
    expect(secondsOfDayToString(suntime.sunset)).toBe("01:11");
    expect(secondsOfDayNoRolloverToString(suntime.sunset)).toBe("25:11");
  });
});
