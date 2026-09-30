import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, Popup, StyleSpecification } from 'maplibre-gl';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '@/store/appStore';
import { GisLayerRenderer } from '@/components/Map/layers/gisLayerManager';
import { CanvasWindParticleEngine } from '@/components/Map/layers/CanvasWindParticleLayer';
import { generateWindBarbSvg } from '@/services/spatialMath';
import '@/components/Map/MapContainer.scss';

const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-dark-base': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
    },
    'esri-dark-reference': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'esri-dark-base-layer',
      type: 'raster',
      source: 'esri-dark-base',
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'esri-dark-reference-layer',
      type: 'raster',
      source: 'esri-dark-reference',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MapContainer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const windParticleEngineRef = useRef<CanvasWindParticleEngine | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);

  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const {
    stations,
    selectedStationId,
    mapViewState,
    currentTimeIndex,
    stationTimeSeries,
    currentGeoJsonData,
    activeLayerIds,
    layers,
  } = useAppSelector((state) => ({
    stations: state.stations,
    selectedStationId: state.selectedStationId,
    mapViewState: state.mapViewState,
    currentTimeIndex: state.currentTimeIndex,
    stationTimeSeries: state.stationTimeSeries,
    currentGeoJsonData: state.currentGeoJsonData,
    activeLayerIds: state.activeLayerIds,
    layers: state.layers,
  }));

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAP_STYLE,
      center: mapViewState.center,
      zoom: mapViewState.zoom,
      pitch: mapViewState.pitch,
      bearing: mapViewState.bearing,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left');

    map.on('load', () => {
      GisLayerRenderer.initializeSources(map);
      GisLayerRenderer.initializeLayers(map);
      GisLayerRenderer.updateMapState(map, store.get());

      windParticleEngineRef.current = new CanvasWindParticleEngine(map);
      const windGeoJson = store.get().currentGeoJsonData.wind;
      if (windGeoJson && windGeoJson.features) {
        windParticleEngineRef.current.setWindData(windGeoJson.features);
      }
      if (store.get().activeLayerIds.includes('wind')) {
        windParticleEngineRef.current.start();
      }
    });

    map.on('mousemove', 'solar-fill', (e: any) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'maplibre-custom-popup',
          });
        }
        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div style="font-size: 11px; font-family: Inter, sans-serif;">
              <strong style="color: #fbbf24;">☀️ Solar Irradiance</strong>
              <div style="font-family: JetBrains Mono; font-size: 13px; font-weight: bold; margin-top: 2px;">
                ${props.irradiance} W/m²
              </div>
            </div>
          `
          )
          .addTo(map);
      }
    });

    map.on('mouseleave', 'solar-fill', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });

    map.on('mousemove', 'wind-points-bg', (e: any) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const barb = generateWindBarbSvg(props.speed, props.direction, 36);

        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'maplibre-custom-popup',
          });
        }
        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div style="font-size: 11px; font-family: Inter, sans-serif; display: flex; align-items: center; gap: 10px;">
              <svg width="36" height="36" viewBox="0 0 36 36" style="transform: rotate(${barb.rotation}deg);">
                <path d="${barb.svgPath}" stroke="${barb.color}" stroke-width="2" fill="${barb.color}" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div>
                <strong style="color: #38bdf8;">💨 Wind Flow (WMO Barb)</strong>
                <div style="font-family: JetBrains Mono; font-size: 13px; font-weight: bold; margin-top: 2px;">
                  ${props.speed} m/s (${barb.knots} kts) @ ${props.direction}°
                </div>
              </div>
            </div>
          `
          )
          .addTo(map);
      }
    });

    map.on('mouseleave', 'wind-points-bg', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      AppStoreActions.updateMapViewState(dispatch, {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    mapRef.current = map;

    return () => {
      if (windParticleEngineRef.current) {
        windParticleEngineRef.current.destroy();
        windParticleEngineRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    GisLayerRenderer.updateMapState(map, store.get());

    if (windParticleEngineRef.current) {
      if (currentGeoJsonData.wind && currentGeoJsonData.wind.features) {
        windParticleEngineRef.current.setWindData(currentGeoJsonData.wind.features);
      }
      if (activeLayerIds.includes('wind')) {
        windParticleEngineRef.current.setOpacity(layers.wind.opacity);
        windParticleEngineRef.current.start();
      } else {
        windParticleEngineRef.current.stop();
      }
    }
  }, [currentGeoJsonData, activeLayerIds, layers, currentTimeIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: mapViewState.center,
      zoom: mapViewState.zoom,
      pitch: mapViewState.pitch,
      bearing: mapViewState.bearing,
      duration: 1200,
    });
  }, [selectedStationId, mapViewState.is3D]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((station) => {
      const isSelected = station.id === selectedStationId;
      const snap = stationTimeSeries[station.id]?.[currentTimeIndex];
      const tempVal = snap
        ? `${snap.temperature > 0 ? '+' : ''}${snap.temperature.toFixed(1)}°`
        : '--°';

      const el = document.createElement('div');
      el.className = 'station-marker-container';

      el.innerHTML = `
        <div class="station-marker-inner ${isSelected ? 'selected' : ''}">
          <div class="station-marker-dot ${isSelected ? 'selected' : ''}"></div>
          <span class="station-marker-temp">
            ${tempVal}
          </span>
          <span class="station-marker-name ${isSelected ? 'selected' : ''}">
            ${station.name.split(' ')[0]}
          </span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        AppStoreActions.selectStation(dispatch, isSelected ? null : station.id, store);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(station.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [stations, selectedStationId, currentTimeIndex, stationTimeSeries, dispatch, store]);

  return <div ref={mapContainerRef} className="map-viewport" />;
};
