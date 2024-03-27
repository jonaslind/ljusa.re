import { DateTime, Zone } from "luxon";

function julianToEpoch(j: number): number {
  return (j - 2440587.5) * 86400;
}

function epochToJulian(ts: number): number {
  return ts / 86400.0 + 2440587.5;
}

function secondsOfDay(ts: number, tz: Zone): bigint {
  const hours: bigint = BigInt(DateTime.fromSeconds(ts).setZone(tz).toFormat("H"));
  const minutes: bigint = BigInt(DateTime.fromSeconds(ts).setZone(tz).toFormat("m"));
  const seconds: bigint = BigInt(DateTime.fromSeconds(ts).setZone(tz).toFormat("s"));
  return hours * BigInt(60) * BigInt(60) + minutes * BigInt(60) + seconds;
}

export function secondsOfDayToString(secondsOfDay: bigint): string {
  var hours: bigint = BigInt(Math.floor(Number(secondsOfDay) / (60 * 60)));
  const minutes: bigint = BigInt(Math.floor(Number(secondsOfDay - hours * BigInt(60) * BigInt(60)) / (60)));
  if (BigInt(24) < hours) {
    hours = hours - BigInt(24);
  }
  return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
}

export function secondsOfDayNoRolloverToString(secondsOfDay: bigint): string {
  const hours: bigint = BigInt(Math.floor(Number(secondsOfDay) / (60 * 60)));
  const minutes: bigint = BigInt(Math.floor(Number(secondsOfDay - hours * BigInt(60) * BigInt(60)) / (60)));
  return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
}

export function secondsOfDayToStringWithSeconds(secondsOfDay: bigint): string {
  const hours: bigint = BigInt(Math.floor(Number(secondsOfDay) / (60 * 60)));
  const minutes: bigint = BigInt(Math.floor(Number(secondsOfDay - hours * BigInt(60) * BigInt(60)) / (60)));
  const seconds: bigint = secondsOfDay - (hours * BigInt(60) * BigInt(60)) - (minutes * BigInt(60));
  return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export class SunTime {
  // seconds since 00:00
  sunrise: bigint;
  // seconds since 00:00
  sunset: bigint;

  private constructor(sunrise: bigint, sunset: bigint) {
    this.sunrise = sunrise;
    this.sunset = sunset;
  }

  sunriseAsString() {
    return secondsOfDayToStringWithSeconds(this.sunrise);
  }

  sunsetAsString() {
    return secondsOfDayToStringWithSeconds(this.sunset);
  }

  static polarNight(): SunTime {
    return new SunTime(null, null);
  }

  static fromTimestamps(sunriseTimestamp: number, sunsetTimestamp: number, zone: Zone): SunTime {
    var sunsetAfterMidnight = false;
    if (
      DateTime.fromSeconds(sunriseTimestamp).setZone(zone).startOf("day") <
      DateTime.fromSeconds(sunsetTimestamp).setZone(zone).startOf("day")
    ) {
      sunsetAfterMidnight = true;
    }
    if (!sunsetAfterMidnight) {
      return new SunTime(secondsOfDay(sunriseTimestamp, zone), secondsOfDay(sunsetTimestamp, zone));
    } else {
      return new SunTime(secondsOfDay(sunriseTimestamp, zone), secondsOfDay(sunsetTimestamp, zone) + BigInt(24 * 60 * 60));
    }
  }

  static fromTimestampAndLocation(timestamp: number, zone: Zone, latDegrees: number, lonDegrees: number, elevationMeters: number): SunTime {

    // https://en.wikipedia.org/wiki/Sunrise_equation

    const julianDate: number = epochToJulian(timestamp);
    const julianDay: number = Math.ceil(julianDate - (2451545.0 + 0.0009) + 69.184 / 86400.0);

    const meanSolarTime: number = julianDay + 0.0009 - lonDegrees / 360.0;

    const solarMeanAnomalyDegrees: number = (357.5291 + 0.98560028 * meanSolarTime) % 360;
    const solarMeanAnomalyRadians: number = solarMeanAnomalyDegrees * (Math.PI / 180);

    const equationOfTheCenterDegrees: number = 1.9148 * Math.sin(solarMeanAnomalyRadians) + 0.02 * Math.sin(2 * solarMeanAnomalyRadians) + 0.0003 * Math.sin(3 * solarMeanAnomalyRadians);

    const eclipticLongitudeDegrees: number = (solarMeanAnomalyDegrees + equationOfTheCenterDegrees + 180.0 + 102.9372) % 360;
    const eclipticLongitudeRadians: number = eclipticLongitudeDegrees * (Math.PI / 180);

    const julianSolarTransit: number = 2451545.0 + meanSolarTime + 0.0053 * Math.sin(solarMeanAnomalyRadians) - 0.0069 * Math.sin(2 * eclipticLongitudeRadians);

    const sinDeclinationOfTheSun: number = Math.sin(eclipticLongitudeRadians) * Math.sin(23.4397 * (Math.PI / 180));
    const cosDeclinationofTheSun: number = Math.cos(Math.asin(sinDeclinationOfTheSun));

    var elevationCorrection: number;
    if (elevationMeters < 0) {
      elevationCorrection = + 2.076 * Math.sqrt(Math.abs(elevationMeters)) / 60.0;
    } else {
      elevationCorrection = - 2.076 * Math.sqrt(elevationMeters) / 60.0;
    }
    const cosHourAngle: number = (Math.sin(((-0.833 + elevationCorrection)) * (Math.PI / 180)) - Math.sin(latDegrees * (Math.PI / 180)) * sinDeclinationOfTheSun) / (Math.cos(latDegrees * (Math.PI / 180)) * cosDeclinationofTheSun);

    if (cosHourAngle < -1 || 1 < cosHourAngle) {
      return SunTime.polarNight();
    }

    const hourAngleRadians: number = Math.acos(cosHourAngle);
    const hourAngleDegrees: number = hourAngleRadians * (180 / Math.PI);

    const julianSunrise: number = julianSolarTransit - hourAngleDegrees / 360;
    const julianSunset: number = julianSolarTransit + hourAngleDegrees / 360;

    return SunTime.fromTimestamps(julianToEpoch(julianSunrise), julianToEpoch(julianSunset), zone);
  }

}

