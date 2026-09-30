import React, { useState } from 'react';
import {
  Thermometer,
  Wind,
  Sun,
  Radio,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppDispatch, useAppSelector, AppStoreActions } from '@/store/appStore';
import { LayerId } from '@/types/gis.types';
import { LayerLegend } from '@/components/LayerManager/LayerLegend';
import '@/components/LayerManager/LayerManager.scss';

const LAYER_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Thermometer: (props) => <Thermometer {...props} color="#f43f5e" />,
  Wind: (props) => <Wind {...props} color="#38bdf8" />,
  Sun: (props) => <Sun {...props} color="#fbbf24" />,
  RadioTower: (props) => <Radio {...props} color="#a855f7" />,
};

export const LayerManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [expandedLayerId, setExpandedLayerId] = useState<LayerId | null>('temperature');

  const { layers, activeLayerIds, isSidebarOpen } = useAppSelector((state) => ({
    layers: state.layers,
    activeLayerIds: state.activeLayerIds,
    isSidebarOpen: state.isSidebarOpen,
  }));

  if (!isSidebarOpen) return null;

  const layerList = Object.values(layers);

  const toggleExpand = (id: LayerId) => {
    setExpandedLayerId((prev) => (prev === id ? null : id));
  };

  return (
    <aside className="layer-manager-panel glass-panel">
      <div className="layer-manager-panel__header">
        <div className="layer-manager-panel__title-wrap">
          <Layers size={17} color="#38bdf8" />
          <h2 className="layer-manager-panel__title">GIS Layers</h2>
        </div>

        <span className="layer-manager-panel__badge">
          {activeLayerIds.length} / {layerList.length} active
        </span>
      </div>

      <div className="layer-manager-panel__list">
        {layerList.map((layer) => {
          const isActive = activeLayerIds.includes(layer.id);
          const isExpanded = expandedLayerId === layer.id;
          const IconComponent = LAYER_ICONS[layer.iconName] || Layers;

          return (
            <div key={layer.id} className={`layer-card ${isActive ? 'active' : ''}`}>
              <div className="layer-card__header">
                <div onClick={() => toggleExpand(layer.id)} className="layer-card__info">
                  <div className="layer-card__icon-box">
                    <IconComponent size={16} />
                  </div>

                  <div>
                    <span className="layer-card__title">{layer.name}</span>
                    <span className="layer-card__unit">
                      {layer.unit} • {layer.type}
                    </span>
                  </div>
                </div>

                <div className="layer-card__actions">
                  <button
                    onClick={() => AppStoreActions.toggleLayer(dispatch, layer.id)}
                    className={`layer-card__toggle-btn ${isActive ? 'active' : ''}`}
                    title={isActive ? 'Disable Layer' : 'Enable Layer'}
                  >
                    {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button
                    onClick={() => toggleExpand(layer.id)}
                    className="layer-card__collapse-btn"
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="layer-card__controls">
                  <p className="layer-card__description">{layer.description}</p>

                  <div className="layer-card__opacity-row">
                    <div className="layer-card__opacity-label-group">
                      <Sliders size={12} color="#94a3b8" />
                      <span>Opacity</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={layer.opacity}
                      disabled={!isActive}
                      onChange={(e) =>
                        AppStoreActions.setLayerOpacity(
                          dispatch,
                          layer.id,
                          parseFloat(e.target.value)
                        )
                      }
                      className="layer-card__slider"
                    />
                    <span className="layer-card__opacity-val">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>

                  {layer.colorScale && (
                    <LayerLegend colorScale={layer.colorScale} unit={layer.unit} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
