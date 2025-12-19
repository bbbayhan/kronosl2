import type { OrderBookSnapshot } from "./orderbookSnapshot";

export class HistoryFrame {
    public readonly timestamp: number;
    public readonly snapshot: OrderBookSnapshot;

    constructor(timestamp: number, snapshot: OrderBookSnapshot) {
        this.timestamp = timestamp;
        this.snapshot = snapshot;
    }

    static create(json: { timestamp: number; snapshot: OrderBookSnapshot }) {
        return new HistoryFrame(json.timestamp, json.snapshot);
    }
}