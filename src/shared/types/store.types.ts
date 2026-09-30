import {
  LayerConfig,
  LayerId,
  TimePoint,
  WeatherStation,
  StationTimeSeriesPoint,
  AggregatedMetrics,
} from '@/shared/types/gis.types';

export interface MapViewState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  is3D: boolean;
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export interface AppState {
  layers: Record<LayerId, LayerConfig>;
  activeLayerIds: LayerId[];

  timePoints: TimePoint[];
  currentTimeIndex: number;
  hoveredTimeIndex: number | null;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  isLooping: boolean;

  selectedStationId: string | null;
  stations: WeatherStation[];
  stationTimeSeries: Record<string, StationTimeSeriesPoint[]>;
  regionTimeSeries: StationTimeSeriesPoint[];

  currentGeoJsonData: Record<LayerId, GeoJSON.FeatureCollection | null>;
  currentMetrics: AggregatedMetrics;

  isLoadingData: boolean;
  loadingLayers: Record<LayerId, boolean>;
  requestId: number;
  networkDelayMs: number;

  mapViewState: MapViewState;
  activeChartMetric: 'all' | 'temperature' | 'wind' | 'solar';
  isSidebarOpen: boolean;
  isAnalyticsOpen: boolean;
}
