/**
 * ============================================================================
 * useUserStats Hook
 * ============================================================================
 * Хук для загрузки статистики пользователя
 */

import { useState, useEffect, useCallback } from 'react';
import * as statsService from '@/services/statsService';
import type { UserStats, VolumeDataPoint } from '@/services/statsService';

interface UseUserStatsState {
    stats: UserStats | null;
    volumeData: VolumeDataPoint[];
    totalVolume: number;
    loading: boolean;
    error: string | null;
}

interface UseUserStatsReturn extends UseUserStatsState {
    refetch: () => Promise<void>;
}

export function useUserStats(volumeDays = 30): UseUserStatsReturn {
    const [state, setState] = useState<UseUserStatsState>({
        stats: null,
        volumeData: [],
        totalVolume: 0,
        loading: true,
        error: null,
    });

    const fetchStats = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [stats, volumeData] = await Promise.all([
                statsService.getUserStats(),
                statsService.getVolumeData(volumeDays),
            ]);

            const totalVolume = volumeData.reduce((sum, point) => sum + point.volume, 0);

            setState({
                stats,
                volumeData,
                totalVolume,
                loading: false,
                error: null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
            setState(prev => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [volumeDays]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        ...state,
        refetch: fetchStats,
    };
}
