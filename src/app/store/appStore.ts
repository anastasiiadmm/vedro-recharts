import { createVedro } from 'vedro';
import { AppState, MapViewState, PlaybackSpeed } from '@/shared/types/store.types';
import { LayerId } from '@/shared/types/gis.types';
import {
  DEFAULT_MAP_VIEW,
  INITIAL_LAYERS_CONFIG,
  INITIAL_STATIONS,
  INITIAL_TIME_POINTS,
} from '@/shared/constants/mockData';
import {
  computeAggregatedMetrics,
  generateAllStationTimeSeries,
} from '@/shared/api/mockDataGenerator';
import { gisDataService } from '@/shared/api/gisDataService';

const initialSeries = generateAllStationTimeSeries();
const INITIAL_HOUR = 12;

const initialAppState: AppState = {
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
  Provider: AppStoreProvider,
  useStore: useAppStoreInstance,
  useSelector: useAppSelector,
  useDispatch: useAppDispatch,
} = createVedro<AppState>(initialAppState);

export class AppStoreActions {
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

  static setLayerOpacity(
    dispatch: ReturnType<typeof useAppDispatch>,
    layerId: LayerId,
    opacity: number
  ) {
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

  static async setTimeIndex(
    dispatch: ReturnType<typeof useAppDispatch>,
    store: ReturnType<typeof useAppStoreInstance>,
    timeIndex: number
  ) {
    const currentState = store.get();
    if (timeIndex < 0 || timeIndex >= currentState.timePoints.length) return;

    const newRequestId = currentState.requestId + 1;
    const activeLayers = currentState.activeLayerIds;

    dispatch({
      currentTimeIndex: timeIndex,
      requestId: newRequestId,
      isLoadingData: true,
      currentMetrics: computeAggregatedMetrics(currentState.regionTimeSeries, timeIndex),
    });

    try {
      const fetchPromises = activeLayers.map(async (layerId) => {
        const geoJson = await gisDataService.fetchLayerData(layerId, timeIndex);
        return { layerId, geoJson };
      });

      const results = await Promise.all(fetchPromises);

      const latestState = store.get();
      if (latestState.requestId !== newRequestId) {
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

  static togglePlayback(dispatch: ReturnType<typeof useAppDispatch>) {
    dispatch((state) => ({ isPlaying: !state.isPlaying }));
  }

  static setPlaybackSpeed(dispatch: ReturnType<typeof useAppDispatch>, speed: PlaybackSpeed) {
    dispatch({ playbackSpeed: speed });
  }

  static setNetworkDelay(dispatch: ReturnType<typeof useAppDispatch>, delayMs: number) {
    gisDataService.setNetworkDelay(delayMs);
    dispatch({ networkDelayMs: delayMs });
  }

  static updateMapViewState(
    dispatch: ReturnType<typeof useAppDispatch>,
    viewState: Partial<MapViewState>
  ) {
    dispatch((state) => ({
      mapViewState: {
        ...state.mapViewState,
        ...viewState,
      },
    }));
  }

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
