export type LayerId = 'temperature' | 'wind' | 'solar' | 'radar_3d';

export type LayerType = 'heatmap' | 'vectors' | 'grid' | '3d-model' | 'points';

export interface ColorStop {
  value: number;
  color: string;
  label?: string;
}

export interface LayerConfig {
  id: LayerId;
  name: string;
  description: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  unit: string;
  colorScale: ColorStop[];
  minValue: number;
  maxValue: number;
  iconName: string;
}

export interface WeatherStation {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  elevation: number; // in meters
  region: string;
}

export interface WeatherSnapshot {
  temperature: number; // °C
  windSpeed: number; // m/s
  windDirection: number; // 0-360 degrees
  solarRadiation: number; // W/m²
  humidity: number; // %
  pressure: number; // hPa
}

export interface StationTimeSeriesPoint extends WeatherSnapshot {
  timestamp: number;
  label: string;
  iso: string;
}

export interface TimePoint {
  index: number;
  timestamp: number;
  iso: string;
  label: string;
  fullLabel: string;
}

export interface AggregatedMetrics {
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  avgWindSpeed: number;
  maxWindSpeed: number;
  avgSolarRadiation: number;
  peakSolarRadiation: number;
}
