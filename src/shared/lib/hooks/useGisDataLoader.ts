import { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useAppStoreInstance, AppStoreActions } from '@/app/store';

export function useGisDataLoader() {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const { currentTimeIndex, activeLayerIds } = useAppSelector((state) => ({
    currentTimeIndex: state.currentTimeIndex,
    activeLayerIds: state.activeLayerIds,
  }));

  useEffect(() => {
    AppStoreActions.setTimeIndex(dispatch, store, currentTimeIndex);
  }, []);

  useEffect(() => {
    const currentState = store.get();
    const missingData = activeLayerIds.some((layerId) => !currentState.currentGeoJsonData[layerId]);

    if (missingData) {
      AppStoreActions.setTimeIndex(dispatch, store, currentState.currentTimeIndex);
    }
  }, [activeLayerIds, dispatch, store]);
}
