import { LayerId } from '@/shared/types/gis.types';
import {
  generateTemperatureGeoJson,
  generateWindGeoJson,
  generateSolarGeoJson,
} from '@/shared/api/mockDataGenerator';

class GisDataService {
  private cache: Map<string, GeoJSON.FeatureCollection> = new Map();
  private networkDelayMs: number = 150;
  private activeAbortControllers: Map<string, AbortController> = new Map();

  public setNetworkDelay(delayMs: number): void {
    this.networkDelayMs = delayMs;
  }

  public async fetchLayerData(
    layerId: LayerId,
    timeIndex: number,
    signal?: AbortSignal
  ): Promise<GeoJSON.FeatureCollection> {
    const cacheKey = `${layerId}_${timeIndex}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const prevController = this.activeAbortControllers.get(layerId);
    if (prevController) {
      prevController.abort();
    }

    const currentController = new AbortController();
    this.activeAbortControllers.set(layerId, currentController);

    const effectiveSignal = signal || currentController.signal;

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

    this.cache.set(cacheKey, result);
    this.activeAbortControllers.delete(layerId);

    return result;
  }
}

export const gisDataService = new GisDataService();
