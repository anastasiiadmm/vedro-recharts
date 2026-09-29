import { createVedro } from 'vedro';
import { AppState, MapViewState, PlaybackSpeed } from '../types/store.types';
import { LayerId } from '../types/gis.types';
import {
  DEFAULT_MAP_VIEW,
  INITIAL_LAYERS_CONFIG,
  INITIAL_STATIONS,
  INITIAL_TIME_POINTS,
} from '../constants/mockData';
import {
  computeAggregatedMetrics,
  generateAllStationTimeSeries,
} from '../services/mockDataGenerator';
import { gisDataService } from '../services/gisDataService';

const initialSeries = generateAllStationTimeSeries();
const INITIAL_HOUR = 12; // Start at noon for peak visualization dynamics

export const initialAppState: AppState = {
  layers: INITIAL_LAYERS_CONFIG,
  activeLayerIds: ['temperature', 'wind', 'solar', 'radar_3d'],

  timePoints: INITIAL_TIME_POINTS,
  currentTimeIndex: INITIAL_HOUR,
  hoveredTimeIndex: null,
  isPlaying: false,
  playbackSpeed: 1,
  isLooping: true,

  selectedStationId: null,
  stations: INITIAL_STATIONS,
  stationTimeSeries: initialSeries.stationsSeries,
  regionTimeSeries: initialSeries.regionalSeries,

  currentGeoJsonData: {
    temperature: null,
    wind: null,
    solar: null,
    radar_3d: null,
  },
  currentMetrics: computeAggregatedMetrics(initialSeries.regionalSeries, INITIAL_HOUR),

  isLoadingData: false,
  loadingLayers: {
    temperature: false,
    wind: false,
    solar: false,
    radar_3d: false,
  },
  requestId: 0,
  networkDelayMs: 150,

  mapViewState: DEFAULT_MAP_VIEW,
  activeChartMetric: 'all',
  isSidebarOpen: true,
  isAnalyticsOpen: true,
};

export const {
  Context: AppStoreContext,
  Provider: AppStoreProvider,
  useStore: useAppStoreInstance,
  useSelector: useAppSelector,
  useDispatch: useAppDispatch,
} = createVedro<AppState>(initialAppState);

/**
 * High-level Action Creators & State Modifiers for Vedro
 */
export class AppStoreActions {
  /**
   * Toggles visibility of a specific GIS layer
   */
  static toggleLayer(dispatch: ReturnType<typeof useAppDispatch>, layerId: LayerId) {
    dispatch((state) => {
      const isCurrentlyActive = state.activeLayerIds.includes(layerId);
      const updatedActive = isCurrentlyActive
        ? state.activeLayerIds.filter((id) => id !== layerId)
        : [...state.activeLayerIds, layerId];

      const updatedLayers = {
        ...state.layers,
        [layerId]: {
          ...state.layers[layerId],
          visible: !isCurrentlyActive,
        },
      };

      return {
        activeLayerIds: updatedActive,
        layers: updatedLayers,
      };
    });
  }

  /**
   * Sets opacity for a GIS layer
   */
  static setLayerOpacity(dispatch: ReturnType<typeof useAppDispatch>, layerId: LayerId, opacity: number) {
    dispatch((state) => ({
      layers: {
        ...state.layers,
        [layerId]: {
          ...state.layers[layerId],
          opacity: Math.max(0, Math.min(1, opacity)),
        },
      },
    }));
  }

  /**
   * Changes current time index with race-condition safe data fetching
   */
  static async setTimeIndex(
    dispatch: ReturnType<typeof useAppDispatch>,
    store: ReturnType<typeof useAppStoreInstance>,
    timeIndex: number
  ) {
    const currentState = store.get();
    if (timeIndex < 0 || timeIndex >= currentState.timePoints.length) return;

    const newRequestId = currentState.requestId + 1;
    const activeLayers = currentState.activeLayerIds;

    // Immediately update UI timeline position and track request sequence
    dispatch({
      currentTimeIndex: timeIndex,
      requestId: newRequestId,
      isLoadingData: true,
      currentMetrics: computeAggregatedMetrics(currentState.regionTimeSeries, timeIndex),
    });

    try {
      // Fetch layer data concurrently for all active layers
      const fetchPromises = activeLayers.map(async (layerId) => {
        const geoJson = await gisDataService.fetchLayerData(layerId, timeIndex);
        return { layerId, geoJson };
      });

      const results = await Promise.all(fetchPromises);

      // Race condition check: Ensure this response belongs to the latest requested timestamp
      const latestState = store.get();
      if (latestState.requestId !== newRequestId) {
        // Out-of-order response discarded!
        return;
      }

      const updatedGeoJsonMap = { ...latestState.currentGeoJsonData };
      results.forEach(({ layerId, geoJson }) => {
        updatedGeoJsonMap[layerId] = geoJson;
      });

      dispatch({
        currentGeoJsonData: updatedGeoJsonMap,
        isLoadingData: false,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching layer data:', err);
      }
      const latestState = store.get();
      if (latestState.requestId === newRequestId) {
        dispatch({ isLoadingData: false });
      }
    }
  }

  /**
   * Station selection for detailed time series drill-down
   */
  static selectStation(
    dispatch: ReturnType<typeof useAppDispatch>,
    stationId: string | null,
    store?: ReturnType<typeof useAppStoreInstance>
  ) {
    dispatch((state) => {
      let nextViewState = state.mapViewState;
      if (stationId && store) {
        const station = state.stations.find((s) => s.id === stationId);
        if (station) {
          nextViewState = {
            ...state.mapViewState,
            center: station.coordinates,
            zoom: Math.max(state.mapViewState.zoom, 9.5),
          };
        }
      }

      return {
        selectedStationId: stationId,
        mapViewState: nextViewState,
      };
    });
  }

  /**
   * Toggles playback animation
   */
  static togglePlayback(dispatch: ReturnType<typeof useAppDispatch>) {
    dispatch((state) => ({ isPlaying: !state.isPlaying }));
  }

  /**
   * Sets playback speed
   */
  static setPlaybackSpeed(dispatch: ReturnType<typeof useAppDispatch>, speed: PlaybackSpeed) {
    dispatch({ playbackSpeed: speed });
  }

  /**
   * Sets simulated network delay
   */
  static setNetworkDelay(dispatch: ReturnType<typeof useAppDispatch>, delayMs: number) {
    gisDataService.setNetworkDelay(delayMs);
    dispatch({ networkDelayMs: delayMs });
  }

  /**
   * Updates map view position / 3D state
   */
  static updateMapViewState(dispatch: ReturnType<typeof useAppDispatch>, viewState: Partial<MapViewState>) {
    dispatch((state) => ({
      mapViewState: {
        ...state.mapViewState,
        ...viewState,
      },
    }));
  }

  /**
   * Toggles 3D terrain/pitch mode
   */
  static toggle3DMode(dispatch: ReturnType<typeof useAppDispatch>, is3D: boolean) {
    dispatch((state) => ({
      mapViewState: {
        ...state.mapViewState,
        pitch: is3D ? 55 : 0,
        bearing: is3D ? -20 : 0,
        is3D,
      },
    }));
  }
}
