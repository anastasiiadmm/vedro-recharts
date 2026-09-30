import {
  LayerConfig,
  LayerId,
  TimePoint,
  WeatherStation,
  StationTimeSeriesPoint,
  AggregatedMetrics,
} from '@/types/gis.types';

export interface MapViewState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  is3D: boolean;
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export interface AppState {
  // GIS Layers Configuration & Visibility
  layers: Record<LayerId, LayerConfig>;
  activeLayerIds: LayerId[];

  // Time & Timeline
  timePoints: TimePoint[];
  currentTimeIndex: number;
  hoveredTimeIndex: number | null;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  isLooping: boolean;

  // Selected Station & Spatial Filter
  selectedStationId: string | null;
  stations: WeatherStation[];
  stationTimeSeries: Record<string, StationTimeSeriesPoint[]>;
  regionTimeSeries: StationTimeSeriesPoint[];

  // GeoJSON Layer Data by LayerId & TimeIndex
  currentGeoJsonData: Record<LayerId, GeoJSON.FeatureCollection | null>;
  currentMetrics: AggregatedMetrics;

  // Asynchronous Loading & Request Management
  isLoadingData: boolean;
  loadingLayers: Record<LayerId, boolean>;
  requestId: number; // For race condition cancellation
  networkDelayMs: number; // Simulating network latency (0ms, 150ms, 400ms)

  // Map & UI State
  mapViewState: MapViewState;
  activeChartMetric: 'all' | 'temperature' | 'wind' | 'solar';
  isSidebarOpen: boolean;
  isAnalyticsOpen: boolean;
}
