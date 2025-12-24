import { useMemo } from 'react';
import { createOrderBookService } from '../../application/orderbook.readService';

export const useOrderBook = (symbol: string) => {
    // Memoize the service to ensure it persists across renders
    // It will only be recreated if the symbol changes
    const service = useMemo(() => createOrderBookService(symbol), [symbol]);

    return service;
};
