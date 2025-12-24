import { useMemo } from 'react';
import { signal, computed } from '@preact/signals-react';
import { KrakenWsService } from '../infrastructure/krakenWS.repository';
import { OrderBookSnapshot } from '../entities/orderbookSnapshot';
import { HistoryFrame } from '../entities/historyFrame';

const MAX_HISTORY = 1000;

export const useOrderBookReadService = (symbol: string) => {
    // We use useMemo to create a specific instance for this symbol.
    // This ensures:
    // 1. We don't share state between different symbols (fixes flickering).
    // 2. The service instance is stable across renders.
    // 3. When the component unmounts or symbol changes, this instance is "deleted" (garbage collected).
    const service = useMemo(() => {
        const liveSnapshot = signal<OrderBookSnapshot | null>(null);
        const history = signal<HistoryFrame[]>([]);
        const isPaused = signal(false);
        const historyIndex = signal(-1); // use live data when -1
        const isConnected = signal(false);

        const activeSnapshot = computed(() => {
            if (isPaused.value && historyIndex.value >= 0) {
                return history.value[historyIndex.value]?.snapshot ?? null;
            }
            return liveSnapshot.value;
        });

        const wsService = new KrakenWsService(symbol, (snap: OrderBookSnapshot) => {
            if (!isPaused.value) {
                liveSnapshot.value = snap;
                history.value.push({
                    snapshot: snap,
                    timestamp: Date.now(),
                });
                if (history.value.length > MAX_HISTORY) {
                    history.value.shift();
                }
            }
        });

        const actions = {
            connect() {
                wsService.connect();
                isConnected.value = true;
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
                liveSnapshot,
                activeSnapshot,
                history,
                historyIndex,
                isPaused,
                isConnected,
            },
            actions,
        };
    }, [symbol]);

    return service;
};
