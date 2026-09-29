import maplibregl, { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { AppState } from '../../../types/store.types';

export class GisLayerRenderer {
  /**
   * Initializes MapLibre data sources for GIS layers
   */
  public static initializeSources(map: MapLibreMap) {
    // Temperature Source
    if (!map.getSource('temp-source')) {
      map.addSource('temp-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Wind Vectors Source
    if (!map.getSource('wind-source')) {
      map.addSource('wind-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Solar Insolation Grid Source
    if (!map.getSource('solar-source')) {
      map.addSource('solar-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // 3D Facility & Radar Tower Source
    if (!map.getSource('facility-3d-source')) {
      map.addSource('facility-3d-source', {
        type: 'geojson',
        data: this.get3DFacilityGeoJson(),
      });
    }
  }

  /**
   * Adds all visual GIS layer representations to the MapLibre map
   */
  public static initializeLayers(map: MapLibreMap) {
    // 1. Solar Insolation Grid Layer (Bottom)
    if (!map.getLayer('solar-fill')) {
      map.addLayer({
        id: 'solar-fill',
        type: 'fill',
        source: 'solar-source',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'irradiance'],
            0, '#1e1b4b',
            200, '#3b82f6',
            450, '#ffb703',
            750, '#fb8500',
            1000, '#e63946',
          ],
          'fill-opacity': 0.65,
          'fill-outline-color': 'rgba(255, 255, 255, 0.15)',
        },
      });
    }

    // 2. Temperature Heatmap Layer
    if (!map.getLayer('temp-heat')) {
      map.addLayer({
        id: 'temp-heat',
        type: 'heatmap',
        source: 'temp-source',
        maxzoom: 13,
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 1.8],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(49, 54, 149, 0)',
            0.15, 'rgba(69, 117, 180, 0.4)',
            0.35, '#74add1',
            0.55, '#fee090',
            0.75, '#fdae61',
            1.0, '#d73027',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 30, 9, 70],
          'heatmap-opacity': 0.75,
        },
      });
    }

    // 3. Wind Vector Directional Arrows & Circles
    if (!map.getLayer('wind-points-bg')) {
      map.addLayer({
        id: 'wind-points-bg',
        type: 'circle',
        source: 'wind-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'speed'], 0, 5, 20, 14],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'speed'],
            0, '#a8dadc',
            5, '#457b9d',
            12, '#1d3557',
            18, '#e63946',
            25, '#780000',
          ],
          'circle-opacity': 0.75,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // 4. 3D Meteorological Radar & Facility Extrusions
    if (!map.getLayer('facility-3d-extrusion')) {
      map.addLayer({
        id: 'facility-3d-extrusion',
        type: 'fill-extrusion',
        source: 'facility-3d-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.95,
        },
      });
    }
  }

  /**
   * Updates GeoJSON source data and layer opacities based on current Vedro state
   */
  public static updateMapState(map: MapLibreMap, state: AppState) {
    if (!map.isStyleLoaded()) return;

    const { layers, activeLayerIds, currentGeoJsonData } = state;

    // 1. Update Temperature Layer
    const tempSource = map.getSource('temp-source') as maplibregl.GeoJSONSource;
    if (tempSource && currentGeoJsonData.temperature) {
      tempSource.setData(currentGeoJsonData.temperature as any);
    }
    if (map.getLayer('temp-heat')) {
      const isVisible = activeLayerIds.includes('temperature');
      map.setLayoutProperty('temp-heat', 'visibility', isVisible ? 'visible' : 'none');
      if (isVisible) {
        map.setPaintProperty('temp-heat', 'heatmap-opacity', layers.temperature.opacity);
      }
    }

    // 2. Update Wind Layer
    const windSource = map.getSource('wind-source') as maplibregl.GeoJSONSource;
    if (windSource && currentGeoJsonData.wind) {
      windSource.setData(currentGeoJsonData.wind as any);
    }
    if (map.getLayer('wind-points-bg')) {
      const isVisible = activeLayerIds.includes('wind');
      map.setLayoutProperty('wind-points-bg', 'visibility', isVisible ? 'visible' : 'none');
      if (isVisible) {
        map.setPaintProperty('wind-points-bg', 'circle-opacity', layers.wind.opacity);
      }
    }

    // 3. Update Solar Layer
    const solarSource = map.getSource('solar-source') as maplibregl.GeoJSONSource;
    if (solarSource && currentGeoJsonData.solar) {
      solarSource.setData(currentGeoJsonData.solar as any);
    }
    if (map.getLayer('solar-fill')) {
      const isVisible = activeLayerIds.includes('solar');
      map.setLayoutProperty('solar-fill', 'visibility', isVisible ? 'visible' : 'none');
      if (isVisible) {
        map.setPaintProperty('solar-fill', 'fill-opacity', layers.solar.opacity);
      }
    }

    // 4. Update 3D Facility Layer
    if (map.getLayer('facility-3d-extrusion')) {
      const isVisible = activeLayerIds.includes('radar_3d');
      map.setLayoutProperty('facility-3d-extrusion', 'visibility', isVisible ? 'visible' : 'none');
      if (isVisible) {
        map.setPaintProperty('facility-3d-extrusion', 'fill-extrusion-opacity', layers.radar_3d.opacity);
      }
    }
  }

  /**
   * Generates 3D Building Extrusions for the High-Altitude Observatory on Mount Zugspitze
   */
  private static get3DFacilityGeoJson(): GeoJSON.FeatureCollection {
    const lng = 10.985;
    const lat = 47.421;
    const d = 0.003;

    return {
      type: 'FeatureCollection',
      features: [
        // Main Weather Observatory Base Building
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - d, lat - d],
              [lng + d, lat - d],
              [lng + d, lat + d],
              [lng - d, lat + d],
              [lng - d, lat - d],
            ]],
          },
          properties: {
            name: 'Environmental Research Station Schneefernerhaus',
            height: 120,
            base_height: 0,
            color: '#38bdf8',
          },
        },
        // Doppler Radar Central Cylindrical Tower
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - d * 0.4, lat - d * 0.4],
              [lng + d * 0.4, lat - d * 0.4],
              [lng + d * 0.4, lat + d * 0.4],
              [lng - d * 0.4, lat + d * 0.4],
              [lng - d * 0.4, lat - d * 0.4],
            ]],
          },
          properties: {
            name: 'Doppler Radar Tower Shaft',
            height: 280,
            base_height: 120,
            color: '#06b6d4',
          },
        },
        // Radar Geodesic Radome Dome on Top
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - d * 0.6, lat - d * 0.6],
              [lng + d * 0.6, lat - d * 0.6],
              [lng + d * 0.6, lat + d * 0.6],
              [lng - d * 0.6, lat + d * 0.6],
              [lng - d * 0.6, lat - d * 0.6],
            ]],
          },
          properties: {
            name: 'Spherical Meteorological Radome',
            height: 350,
            base_height: 280,
            color: '#f43f5e',
          },
        },
      ],
    };
  }
}
