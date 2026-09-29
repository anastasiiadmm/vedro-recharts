import { LayerId } from '../types/gis.types';
import {
  generateTemperatureGeoJson,
  generateWindGeoJson,
  generateSolarGeoJson,
  generateAllStationTimeSeries,
} from './mockDataGenerator';

class GisDataService {
  private cache: Map<string, GeoJSON.FeatureCollection> = new Map();
  private timeSeriesData: ReturnType<typeof generateAllStationTimeSeries>;
  private networkDelayMs: number = 150; // Default simulated delay for async behavior
  private activeAbortControllers: Map<string, AbortController> = new Map();

  constructor() {
    // Initialize station time series on boot
    this.timeSeriesData = generateAllStationTimeSeries();
  }

  public setNetworkDelay(delayMs: number): void {
    this.networkDelayMs = delayMs;
  }

  public getNetworkDelay(): number {
    return this.networkDelayMs;
  }

  public getStationTimeSeries(stationId: string | null) {
    if (stationId && this.timeSeriesData.stationsSeries[stationId]) {
      return this.timeSeriesData.stationsSeries[stationId];
    }
    return this.timeSeriesData.regionalSeries;
  }

  public getAllStationsSeries() {
    return this.timeSeriesData;
  }

  /**
   * Fetches GeoJSON data for a specific layer and time slice.
   * Handles caching, simulated network delay, and AbortSignal for race conditions.
   */
  public async fetchLayerData(
    layerId: LayerId,
    timeIndex: number,
    signal?: AbortSignal
  ): Promise<GeoJSON.FeatureCollection> {
    const cacheKey = `${layerId}_${timeIndex}`;

    // Return from cache immediately if present
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Cancel any previous pending request for this layer
    const prevController = this.activeAbortControllers.get(layerId);
    if (prevController) {
      prevController.abort();
    }

    const currentController = new AbortController();
    this.activeAbortControllers.set(layerId, currentController);

    // Merge signals if external signal is provided
    const effectiveSignal = signal || currentController.signal;

    // Simulate async network latency with jitter
    if (this.networkDelayMs > 0) {
      const jitter = Math.random() * 50;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve();
        }, this.networkDelayMs + jitter);

        effectiveSignal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted by newer request', 'AbortError'));
        });
      });
    }

    if (effectiveSignal.aborted) {
      throw new DOMException('Aborted by newer request', 'AbortError');
    }

    let result: GeoJSON.FeatureCollection;
    switch (layerId) {
      case 'temperature':
        result = generateTemperatureGeoJson(timeIndex);
        break;
      case 'wind':
        result = generateWindGeoJson(timeIndex);
        break;
      case 'solar':
        result = generateSolarGeoJson(timeIndex);
        break;
      case 'radar_3d':
        // Radar layer coordinates are static with dynamic telemetry
        result = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [10.985, 47.421],
              },
              properties: {
                name: 'Zugspitze Doppler Radar',
                elevation: 2962,
                status: 'operational',
                timeIndex,
              },
            },
          ],
        };
        break;
      default:
        result = { type: 'FeatureCollection', features: [] };
    }

    // Cache the result
    this.cache.set(cacheKey, result);
    this.activeAbortControllers.delete(layerId);

    return result;
  }

  /**
   * Clears in-memory cache if needed
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const gisDataService = new GisDataService();
