import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Sun,
  Compass,
} from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '../../store/appStore';
import { usePlayback } from '../../hooks/usePlayback';
import { PlaybackSpeed } from '../../types/store.types';
import { calculateSolarZenith } from '../../services/spatialMath';

export const Timeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const {
    timePoints,
    currentTimeIndex,
    isPlaying,
    playbackSpeed,
  } = useAppSelector((state) => ({
    timePoints: state.timePoints,
    currentTimeIndex: state.currentTimeIndex,
    isPlaying: state.isPlaying,
    playbackSpeed: state.playbackSpeed,
  }));

  const { togglePlay, stepForward, stepBackward } = usePlayback();

  // Astronomical Solar calculation for Alpine latitude ~47.4°N
  const solarAstro = calculateSolarZenith(47.4, 11.0, 272, currentTimeIndex);

  // Spacebar hotkey to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward]);

  const currentPoint = timePoints[currentTimeIndex] || timePoints[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    AppStoreActions.setTimeIndex(dispatch, store, index);
  };

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    AppStoreActions.setPlaybackSpeed(dispatch, speed);
  };

  const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4];

  return (
    <nav
      aria-label="Spatio-temporal Timeline Controls"
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(900px, calc(100vw - 28px))',
        zIndex: 25,
        borderRadius: 14,
        padding: '10px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Top Bar: Playback Controls & Current Time & Speed Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Playback Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={stepBackward}
            className="glass-button"
            style={{ padding: '6px 8px' }}
            title="Previous Hour (← Key)"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: isPlaying
                ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 13,
              boxShadow: isPlaying
                ? '0 0 16px rgba(244, 63, 94, 0.4)'
                : '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
            title="Play / Pause Timeline (Spacebar)"
          >
            {isPlaying ? <Pause size={15} fill="#ffffff" /> : <Play size={15} fill="#ffffff" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={stepForward}
            className="glass-button"
            style={{ padding: '6px 8px' }}
            title="Next Hour (→ Key)"
          >
            <SkipForward size={15} />
          </button>

          {/* Speed Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 6,
              padding: 2,
              marginLeft: 4,
            }}
          >
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: playbackSpeed === s ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: playbackSpeed === s ? '#38bdf8' : '#94a3b8',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Time Display Pill & Astronomical Phase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Solar Twilight Phase Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: solarAstro.elevation > 0 ? '#fbbf24' : '#818cf8',
            }}
          >
            <Sun size={13} />
            <span>{solarAstro.phase}</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: '#94a3b8',
              }}
            >
              (Alt: {solarAstro.elevation.toFixed(1)}°)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 8,
              padding: '4px 12px',
            }}
          >
            <Clock size={14} color="#06b6d4" />
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                fontWeight: 700,
                color: '#f8fafc',
              }}
            >
              {currentPoint.label}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              ({currentPoint.fullLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Scrubber Range Slider & Ticks */}
      <div style={{ position: 'relative', width: '100%', paddingTop: 4, paddingBottom: 6 }}>
        {/* Daylight / Solar Band underlay */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 3,
            background:
              'linear-gradient(to right, #1e1b4b 0%, #1e1b4b 25%, #f59e0b 50%, #ea580c 70%, #1e1b4b 85%, #1e1b4b 100%)',
            opacity: 0.5,
          }}
        />

        <input
          type="range"
          min={0}
          max={timePoints.length - 1}
          value={currentTimeIndex}
          onChange={handleSliderChange}
          style={{
            position: 'relative',
            width: '100%',
            height: 6,
            zIndex: 2,
            appearance: 'none',
            background: 'transparent',
            outline: 'none',
          }}
        />

        {/* Time Tick Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 10,
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            userSelect: 'none',
          }}
        >
          {timePoints.map((tp, idx) => {
            const isSelected = idx === currentTimeIndex;
            const isMajorTick = idx % 3 === 0;

            if (!isMajorTick && !isSelected) return <div key={tp.index} style={{ width: 0 }} />;

            return (
              <button
                key={tp.index}
                onClick={() => AppStoreActions.setTimeIndex(dispatch, store, idx)}
                style={{
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  fontWeight: isSelected ? 700 : 400,
                  fontSize: isSelected ? 11 : 10,
                  transition: 'all 0.15s ease',
                  padding: '2px 4px',
                }}
              >
                {tp.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
