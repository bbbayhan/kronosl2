import { signal, computed } from '@preact/signals-react';

import { KrakenWsService } from '../infrastructure/krakenWS.repository';
import type { OrderBookSnapshot } from '../entities/orderbookSnapshot';
import type { HistoryFrame } from '../entities/historyFrame';

const MAX_HISTORY = 1000;

export const useOrderBookReadService = (symbol: string) => {
    // ----- STATE -----
    const liveSnapshot = signal<OrderBookSnapshot | null>(null);
    const history = signal<HistoryFrame[]>([]);
    const isPaused = signal(false);
    const historyIndex = signal(-1);
    const isConnected = signal(false);

    // ----- COMPUTED -----
    const activeSnapshot = computed(() => {
        if (isPaused.value && historyIndex.value >= 0) {
            return history.value[historyIndex.value]?.snapshot ?? null;
        }
        return liveSnapshot.value;
    });

    // ----- INFRASTRUCTURE -----
    const wsService = new KrakenWsService(symbol);

    // ----- ACTIONS -----
    const actions = {
        connect() {
            wsService.connect();
        },

        disconnect() {
            wsService.disconnect();
            isConnected.value = false;
        },

        pause() {
            isPaused.value = true;
        },

        resume() {
            isPaused.value = false;
            historyIndex.value = -1;
        },

        goToHistory(index: number) {
            if (index >= 0 && index < history.value.length) {
                historyIndex.value = index;
                isPaused.value = true;
            }
        },

        reset() {
            liveSnapshot.value = null;
            history.value = [];
            isPaused.value = false;
            historyIndex.value = -1;
        },
    };

    return {
        state: {
            liveSnapshot: liveSnapshot.value,
            activeSnapshot: activeSnapshot.value,
            history: history.value,
            isPaused: isPaused.value,
            isConnected: isConnected.value,
        },
        actions,
    };
};
