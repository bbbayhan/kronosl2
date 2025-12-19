import type { OrderLevel } from "./orderLevel";

export class OrderBookSnapshot {
    public readonly bids: OrderLevel[];
    public readonly asks: OrderLevel[];
    public readonly timestamp: number;
    public readonly symbol: string;

    constructor(bids: OrderLevel[], asks: OrderLevel[], timestamp: number, symbol: string) {
        this.bids = bids;
        this.asks = asks;
        this.timestamp = timestamp;
        this.symbol = symbol;
    }

    static create(json: {
        bids: OrderLevel[];
        asks: OrderLevel[];
        timestamp: number;
        symbol: string;
    }) {
        return new OrderBookSnapshot(json.bids, json.asks, json.timestamp, json.symbol);
    }
}