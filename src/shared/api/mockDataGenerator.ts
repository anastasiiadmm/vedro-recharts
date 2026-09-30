import { INITIAL_STATIONS, INITIAL_TIME_POINTS } from '@/shared/constants/mockData';
import {
  AggregatedMetrics,
  StationTimeSeriesPoint,
  WeatherStation,
} from '@/shared/types/gis.types';

const BOUNDS = {
  minLng: 8.4,
  maxLng: 13.6,
  minLat: 46.2,
  maxLat: 48.6,
};

function getDiurnalFactor(hour: number): number {
  return Math.sin(((hour - 9) / 24) * 2 * Math.PI);
}

function getSolarFactor(hour: number): number {
  if (hour < 6 || hour > 19) return 0;
  const angle = ((hour - 6) / 13) * Math.PI;
  return Math.max(0, Math.sin(angle));
}

export function generateStationTimeSeries(station: WeatherStation): StationTimeSeriesPoint[] {
  const elevationFactor = (station.elevation / 1000) * 6.5;
  const baseTemp = 18 - elevationFactor;
  const baseWind = 4 + (station.elevation / 800) * 4;

  return INITIAL_TIME_POINTS.map((tp) => {
    const hour = tp.index;
    const diurnal = getDiurnalFactor(hour);
    const solarFactor = getSolarFactor(hour);

    const tempNoise = Math.sin(station.coordinates[0] * 3 + hour) * 1.5;
    const temp = Math.round((baseTemp + diurnal * 7.5 + tempNoise) * 10) / 10;

    const windDir = Math.round(
      (45 + diurnal * 120 + ((station.coordinates[1] * 10) % 360) + 360) % 360
    );
    const windSpeed = Math.max(
      0.5,
      Math.round((baseWind + diurnal * 4.5 + Math.cos(hour * 0.8) * 2) * 10) / 10
    );

    const cloudFactor = 0.85 + Math.sin(station.coordinates[0] * 2 + hour) * 0.15;
    const solar = Math.round(solarFactor * 920 * cloudFactor);

    const humidity = Math.min(95, Math.max(25, Math.round(75 - diurnal * 30 + Math.sin(hour) * 5)));
    const pressure = Math.round(1013 - station.elevation / 8.5);

    return {
      timestamp: tp.timestamp,
      iso: tp.iso,
      label: tp.label,
      temperature: temp,
      windSpeed,
      windDirection: windDir,
      solarRadiation: solar,
      humidity,
      pressure,
    };
  });
}

export function generateAllStationTimeSeries(): {
  stationsSeries: Record<string, StationTimeSeriesPoint[]>;
  regionalSeries: StationTimeSeriesPoint[];
} {
  const stationsSeries: Record<string, StationTimeSeriesPoint[]> = {};

  INITIAL_STATIONS.forEach((station) => {
    stationsSeries[station.id] = generateStationTimeSeries(station);
  });

  const regionalSeries: StationTimeSeriesPoint[] = INITIAL_TIME_POINTS.map((tp, idx) => {
    let sumTemp = 0;
    let sumWind = 0;
    let sumSolar = 0;
    let sumHumidity = 0;
    let sumPressure = 0;

    INITIAL_STATIONS.forEach((st) => {
      const snap = stationsSeries[st.id][idx];
      sumTemp += snap.temperature;
      sumWind += snap.windSpeed;
      sumSolar += snap.solarRadiation;
      sumHumidity += snap.humidity;
      sumPressure += snap.pressure;
    });

    const count = INITIAL_STATIONS.length;
    return {
      timestamp: tp.timestamp,
      iso: tp.iso,
      label: tp.label,
      temperature: Math.round((sumTemp / count) * 10) / 10,
      windSpeed: Math.round((sumWind / count) * 10) / 10,
      windDirection: 210,
      solarRadiation: Math.round(sumSolar / count),
      humidity: Math.round(sumHumidity / count),
      pressure: Math.round(sumPressure / count),
    };
  });

  return { stationsSeries, regionalSeries };
}

export function generateTemperatureGeoJson(hour: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const diurnal = getDiurnalFactor(hour);

  const lngSteps = 18;
  const latSteps = 14;
  const lngDelta = (BOUNDS.maxLng - BOUNDS.minLng) / lngSteps;
  const latDelta = (BOUNDS.maxLat - BOUNDS.minLat) / latSteps;

  for (let i = 0; i <= lngSteps; i++) {
    for (let j = 0; j <= latSteps; j++) {
      const lng = BOUNDS.minLng + i * lngDelta;
      const lat = BOUNDS.minLat + j * latDelta;

      const distFromAlps = Math.abs(lat - 47.2);
      const estElevation = Math.max(300, 2400 - distFromAlps * 1800);
      const lapseRate = (estElevation / 1000) * 6.0;

      const baseTemp = 19 - lapseRate;
      const wave = Math.sin(lng * 0.8 + hour * 0.2) * 2.2;
      const temp = Math.round((baseTemp + diurnal * 7.0 + wave) * 10) / 10;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          temperature: temp,
          elevation: Math.round(estElevation),
          intensity: Math.max(0, Math.min(1, (temp + 5) / 40)),
        },
      });
    }
  }

  INITIAL_STATIONS.forEach((st) => {
    const elevationFactor = (st.elevation / 1000) * 6.5;
    const temp =
      Math.round(
        (18 - elevationFactor + diurnal * 7.5 + Math.sin(st.coordinates[0] * 2) * 1.5) * 10
      ) / 10;
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: st.coordinates,
      },
      properties: {
        isStation: true,
        stationId: st.id,
        name: st.name,
        elevation: st.elevation,
        temperature: temp,
        intensity: Math.max(0, Math.min(1, (temp + 5) / 40)),
      },
    });
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function generateWindGeoJson(hour: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const diurnal = getDiurnalFactor(hour);

  const lngSteps = 12;
  const latSteps = 9;
  const lngDelta = (BOUNDS.maxLng - BOUNDS.minLng) / lngSteps;
  const latDelta = (BOUNDS.maxLat - BOUNDS.minLat) / latSteps;

  for (let i = 0; i < lngSteps; i++) {
    for (let j = 0; j < latSteps; j++) {
      const lng = BOUNDS.minLng + (i + 0.5) * lngDelta;
      const lat = BOUNDS.minLat + (j + 0.5) * latDelta;

      const baseSpeed = 5 + Math.sin(lng * 1.5 + lat * 1.2) * 3;
      const speed = Math.max(
        1,
        Math.round((baseSpeed + diurnal * 4 + Math.sin(hour * 0.4 + i) * 2.5) * 10) / 10
      );

      const direction = Math.round(
        (180 + Math.atan2(lat - 47.4, lng - 11.0) * (180 / Math.PI) + diurnal * 45 + 360) % 360
      );

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          speed,
          direction,
          level: speed < 5 ? 1 : speed < 12 ? 2 : speed < 18 ? 3 : 4,
          u: -speed * Math.sin((direction * Math.PI) / 180),
          v: -speed * Math.cos((direction * Math.PI) / 180),
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function generateSolarGeoJson(hour: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const solarFactor = getSolarFactor(hour);

  const lngSteps = 10;
  const latSteps = 8;
  const lngDelta = (BOUNDS.maxLng - BOUNDS.minLng) / lngSteps;
  const latDelta = (BOUNDS.maxLat - BOUNDS.minLat) / latSteps;

  for (let i = 0; i < lngSteps; i++) {
    for (let j = 0; j < latSteps; j++) {
      const minX = BOUNDS.minLng + i * lngDelta;
      const maxX = minX + lngDelta;
      const minY = BOUNDS.minLat + j * latDelta;
      const maxY = minY + latDelta;

      const slopeFactor = 0.85 + Math.cos((minY - 46.5) * 4) * 0.15;
      const irradiance = Math.round(solarFactor * 960 * slopeFactor);

      const normalized = Math.min(1, irradiance / 1000);

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [minX, minY],
              [maxX, minY],
              [maxX, maxY],
              [minX, maxY],
              [minX, minY],
            ],
          ],
        },
        properties: {
          irradiance,
          solarFactor: Math.round(normalized * 100),
          label: `${irradiance} W/m²`,
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function computeAggregatedMetrics(
  regionalSeries: StationTimeSeriesPoint[],
  currentHour: number
): AggregatedMetrics {
  const currentSnap = regionalSeries[currentHour] || regionalSeries[0];
  const allTemps = regionalSeries.map((s) => s.temperature);
  const allWinds = regionalSeries.map((s) => s.windSpeed);
  const allSolar = regionalSeries.map((s) => s.solarRadiation);

  return {
    avgTemperature: currentSnap.temperature,
    minTemperature: Math.min(...allTemps),
    maxTemperature: Math.max(...allTemps),
    avgWindSpeed: currentSnap.windSpeed,
    maxWindSpeed: Math.max(...allWinds),
    avgSolarRadiation: currentSnap.solarRadiation,
    peakSolarRadiation: Math.max(...allSolar),
  };
}
