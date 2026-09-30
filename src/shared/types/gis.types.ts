export type LayerId = 'temperature' | 'wind' | 'solar' | 'radar_3d';

export type LayerVisualizationType = 'heatmap' | 'vector' | 'fill' | '3d-extrusion';

export interface ColorStop {
  value: number;
  color: string;
  label?: string;
}

export interface LayerConfig {
  id: LayerId;
  name: string;
  type: LayerVisualizationType;
  unit: string;
  visible: boolean;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  colorScale?: ColorStop[];
  description: string;
  iconName: string;
}

export interface WeatherStation {
  id: string;
  name: string;
  coordinates: [number, number];
  elevation: number;
  region: string;
}

export interface TimePoint {
  index: number;
  timestamp: number;
  iso: string;
  label: string;
}

export interface WeatherSnapshot {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  solarRadiation: number;
  humidity: number;
  pressure: number;
}

export interface StationTimeSeriesPoint extends WeatherSnapshot {
  timestamp: number;
  iso: string;
  label: string;
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
