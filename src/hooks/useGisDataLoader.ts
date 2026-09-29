import { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useAppStoreInstance, AppStoreActions } from '../store/appStore';

/**
 * Ensures GIS layer data is automatically fetched when the component mounts
 * or when active layers change.
 */
export function useGisDataLoader() {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const { currentTimeIndex, activeLayerIds } = useAppSelector((state) => ({
    currentTimeIndex: state.currentTimeIndex,
    activeLayerIds: state.activeLayerIds,
  }));

  // Initial load
  useEffect(() => {
    AppStoreActions.setTimeIndex(dispatch, store, currentTimeIndex);
  }, []); // Run on mount

  // When layer visibility toggles, ensure we fetch if data is missing
  useEffect(() => {
    const currentState = store.get();
    const missingData = activeLayerIds.some(
      (layerId) => !currentState.currentGeoJsonData[layerId]
    );

    if (missingData) {
      AppStoreActions.setTimeIndex(dispatch, store, currentState.currentTimeIndex);
    }
  }, [activeLayerIds, dispatch, store]);
}
