import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, Popup, StyleSpecification } from 'maplibre-gl';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '../../store/appStore';
import { GisLayerRenderer } from './layers/gisLayerManager';
import { CanvasWindParticleEngine } from './layers/CanvasWindParticleLayer';
import { generateWindBarbSvg } from '../../services/spatialMath';

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

  // Initialize MapLibre GL Map
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

    // Add Navigation Control
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left');

    map.on('load', () => {
      GisLayerRenderer.initializeSources(map);
      GisLayerRenderer.initializeLayers(map);
      GisLayerRenderer.updateMapState(map, store.get());

      // Initialize Custom Handwritten Wind Particle Engine
      windParticleEngineRef.current = new CanvasWindParticleEngine(map);
      const windGeoJson = store.get().currentGeoJsonData.wind;
      if (windGeoJson && windGeoJson.features) {
        windParticleEngineRef.current.setWindData(windGeoJson.features);
      }
      if (store.get().activeLayerIds.includes('wind')) {
        windParticleEngineRef.current.start();
      }
    });

    // Handle Hover Tooltip on Solar Polygons
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
          .setHTML(`
            <div style="font-size: 11px; font-family: Inter, sans-serif;">
              <strong style="color: #fbbf24;">☀️ Solar Irradiance</strong>
              <div style="font-family: JetBrains Mono; font-size: 13px; font-weight: bold; margin-top: 2px;">
                ${props.irradiance} W/m²
              </div>
            </div>
          `)
          .addTo(map);
      }
    });

    map.on('mouseleave', 'solar-fill', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });

    // Handle Hover on Wind circles with WMO Barb
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
          .setHTML(`
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
          `)
          .addTo(map);
      }
    });

    map.on('mouseleave', 'wind-points-bg', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });

    // Sync camera changes back to store
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

  // Update GIS data layers and Wind Particle Engine when store updates
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

  // Handle Camera Fly-To when Selected Station or 3D Mode changes
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

  // Render Interactive Station DOM Markers with live badges
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((station) => {
      const isSelected = station.id === selectedStationId;
      const snap = stationTimeSeries[station.id]?.[currentTimeIndex];
      const tempVal = snap ? `${snap.temperature > 0 ? '+' : ''}${snap.temperature.toFixed(1)}°` : '--°';

      // Create Custom Marker Element
      const el = document.createElement('div');
      el.className = 'station-marker-container';
      el.style.cursor = 'pointer';

      el.innerHTML = `
        <div class="station-marker-inner" style="
          display: flex;
          align-items: center;
          gap: 5px;
          background: ${isSelected ? 'rgba(6, 182, 212, 0.95)' : 'rgba(15, 23, 42, 0.9)'};
          backdrop-filter: blur(8px);
          border: 1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'};
          box-shadow: ${isSelected ? '0 0 16px rgba(6, 182, 212, 0.8)' : '0 4px 12px rgba(0,0,0,0.5)'};
          padding: 3px 8px;
          border-radius: 20px;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          user-select: none;
        ">
          <div style="
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: ${isSelected ? '#ffffff' : '#38bdf8'};
            box-shadow: 0 0 6px #38bdf8;
          "></div>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;">
            ${tempVal}
          </span>
          <span style="font-size: 10px; color: ${isSelected ? '#f0fdf4' : '#94a3b8'}; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${station.name.split(' ')[0]}
          </span>
        </div>
      `;

      // Station Click Handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        AppStoreActions.selectStation(
          dispatch,
          isSelected ? null : station.id,
          store
        );
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(station.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [stations, selectedStationId, currentTimeIndex, stationTimeSeries, dispatch, store]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#090d16',
      }}
    />
  );
};
