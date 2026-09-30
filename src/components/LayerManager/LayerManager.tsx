import React from 'react';
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
import {
  useAppDispatch,
  useAppSelector,
  AppStoreActions,
} from '../../store/appStore';
import { LayerId } from '../../types/gis.types';
import { LayerLegend } from './LayerLegend';

const LAYER_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Thermometer: (props) => <Thermometer {...props} color="#f43f5e" />,
  Wind: (props) => <Wind {...props} color="#38bdf8" />,
  Sun: (props) => <Sun {...props} color="#fbbf24" />,
  RadioTower: (props) => <Radio {...props} color="#a855f7" />,
};

export const LayerManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [expandedLayerId, setExpandedLayerId] = React.useState<LayerId | null>('temperature');

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
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 72,
        left: 14,
        width: 300,
        maxHeight: 'calc(100vh - 180px)',
        zIndex: 20,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={17} color="#38bdf8" />
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>GIS Layers</h2>
        </div>

        <span
          style={{
            fontSize: 11,
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '2px 8px',
            borderRadius: 12,
          }}
        >
          {activeLayerIds.length} / {layerList.length} active
        </span>
      </div>

      {/* Layer List */}
      <div
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflowY: 'auto',
        }}
      >
        {layerList.map((layer) => {
          const isActive = activeLayerIds.includes(layer.id);
          const isExpanded = expandedLayerId === layer.id;
          const IconComponent = LAYER_ICONS[layer.iconName] || Layers;

          return (
            <div
              key={layer.id}
              style={{
                borderRadius: 10,
                background: isActive ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                border: isActive
                  ? '1px solid rgba(56, 189, 248, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                padding: '10px 12px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Main Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  onClick={() => toggleExpand(layer.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={16} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? '#f8fafc' : '#94a3b8',
                      }}
                    >
                      {layer.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {layer.unit} • {layer.type}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => AppStoreActions.toggleLayer(dispatch, layer.id)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: isActive
                        ? 'rgba(6, 182, 212, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isActive
                        ? '1px solid var(--accent-cyan)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#38bdf8' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={isActive ? 'Disable Layer' : 'Enable Layer'}
                  >
                    {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  {/* Expand button */}
                  <button
                    onClick={() => toggleExpand(layer.id)}
                    style={{
                      padding: 4,
                      color: '#94a3b8',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details: Opacity & Legend */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>
                    {layer.description}
                  </p>

                  {/* Opacity Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <Sliders size={12} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', minWidth: 44 }}>Opacity</span>
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
                      style={{ flex: 1, height: 4 }}
                    />
                    <span
                      style={{
                        minWidth: 32,
                        textAlign: 'right',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#cbd5e1',
                      }}
                    >
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>

                  {/* Color Scale Legend */}
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
