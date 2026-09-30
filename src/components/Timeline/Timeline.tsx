import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, Sun } from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '@/store/appStore';
import { usePlayback } from '@/hooks/usePlayback';
import { PlaybackSpeed } from '@/types/store.types';
import { calculateSolarZenith } from '@/services/spatialMath';
import '@/components/Timeline/Timeline.scss';

export const Timeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const { timePoints, currentTimeIndex, isPlaying, playbackSpeed } = useAppSelector((state) => ({
    timePoints: state.timePoints,
    currentTimeIndex: state.currentTimeIndex,
    isPlaying: state.isPlaying,
    playbackSpeed: state.playbackSpeed,
  }));

  const { stepForward, stepBackward, togglePlay } = usePlayback();
  const currentPoint = timePoints[currentTimeIndex] || timePoints[0];
  const solarAstro = calculateSolarZenith(47.4, 11.0, 272, currentTimeIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIdx = parseInt(e.target.value, 10);
    AppStoreActions.setTimeIndex(dispatch, store, newIdx);
  };

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    AppStoreActions.setPlaybackSpeed(dispatch, speed);
  };

  return (
    <div className="timeline-panel glass-panel">
      <div className="timeline-panel__header">
        <div className="timeline-panel__controls">
          <button
            onClick={togglePlay}
            className="timeline-panel__play-btn"
            title={isPlaying ? 'Pause Animation (Space)' : 'Play Animation (Space)'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={stepBackward}
            className="timeline-panel__step-btn"
            title="Step Back 1 Hour (←)"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={stepForward}
            className="timeline-panel__step-btn"
            title="Step Forward 1 Hour (→)"
          >
            <SkipForward size={14} />
          </button>

          <div className="timeline-panel__current-time">
            <Clock size={15} color="#38bdf8" />
            <span className="timeline-panel__time-value">{currentPoint.label}</span>
            <span className="timeline-panel__time-index">({currentPoint.index}:00 UTC)</span>
          </div>

          <div className="timeline-panel__speed-group">
            {([0.5, 1, 2, 4] as PlaybackSpeed[]).map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`timeline-panel__speed-btn ${playbackSpeed === spd ? 'active' : ''}`}
                title={`Playback speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="timeline-panel__astro-badge">
          <div className="timeline-panel__astro-item">
            <Sun size={13} />
            <span className="timeline-panel__astro-elevation">
              {solarAstro.elevation > 0 ? '+' : ''}
              {solarAstro.elevation.toFixed(1)}°
            </span>
            <span>({solarAstro.phase})</span>
          </div>
          <div className="timeline-panel__astro-irradiance">
            Irradiance:{' '}
            <strong className="timeline-panel__astro-irradiance-val">
              {solarAstro.irradiance} W/m²
            </strong>
          </div>
        </div>
      </div>

      <div className="timeline-panel__slider-wrap">
        <input
          type="range"
          min={0}
          max={timePoints.length - 1}
          value={currentTimeIndex}
          onChange={handleSliderChange}
          className="timeline-panel__slider"
        />

        <div className="timeline-panel__ticks">
          {timePoints.map((tp, idx) => {
            const isMajor = idx % 3 === 0;
            const isSelected = idx === currentTimeIndex;

            return (
              <div
                key={tp.index}
                onClick={() => AppStoreActions.setTimeIndex(dispatch, store, idx)}
                className="timeline-panel__tick"
              >
                <div
                  className={`timeline-panel__tick-bar ${isMajor ? 'major' : ''} ${isSelected ? 'active' : ''}`}
                />
                {isMajor && (
                  <span className={`timeline-panel__tick-text ${isSelected ? 'active' : ''}`}>
                    {tp.label.split(' ')[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
