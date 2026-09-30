import { useEffect, useRef } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStoreInstance,
  AppStoreActions,
} from '@/store/appStore';

export function usePlayback() {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const { isPlaying, playbackSpeed, currentTimeIndex, timePointsCount } = useAppSelector(
    (state) => ({
      isPlaying: state.isPlaying,
      playbackSpeed: state.playbackSpeed,
      currentTimeIndex: state.currentTimeIndex,
      timePointsCount: state.timePoints.length,
    })
  );

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round(1000 / playbackSpeed);

    timerRef.current = window.setInterval(() => {
      const state = store.get();
      const nextIndex = (state.currentTimeIndex + 1) % state.timePoints.length;
      AppStoreActions.setTimeIndex(dispatch, store, nextIndex);
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, dispatch, store]);

  const stepForward = () => {
    const nextIndex = (currentTimeIndex + 1) % timePointsCount;
    AppStoreActions.setTimeIndex(dispatch, store, nextIndex);
  };

  const stepBackward = () => {
    const prevIndex = (currentTimeIndex - 1 + timePointsCount) % timePointsCount;
    AppStoreActions.setTimeIndex(dispatch, store, prevIndex);
  };

  const togglePlay = () => {
    AppStoreActions.togglePlayback(dispatch);
  };

  return {
    isPlaying,
    playbackSpeed,
    currentTimeIndex,
    stepForward,
    stepBackward,
    togglePlay,
  };
}
