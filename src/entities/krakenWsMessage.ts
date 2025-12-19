import type { KrakenBookEntry } from "./krakenBookEntry";

export class KrakenWsMessage {
    public readonly channel: string;
    public readonly type: 'snapshot' | 'update';
    public readonly data: {
        symbol: string;
        bids: KrakenBookEntry[];
        asks: KrakenBookEntry[];
        timestamp: string;
    }[]
    constructor(
        channel: string,
        type: 'snapshot' | 'update',
        data: {
            symbol: string;
            bids: KrakenBookEntry[];
            asks: KrakenBookEntry[];
            timestamp: string;
        }[]
    ) {
        this.channel = channel;
        this.type = type;
        this.data = data;
    }

    static create(json: {
        channel: string;
        type: 'snapshot' | 'update';
        data: {
            symbol: string;
            bids: KrakenBookEntry[];
            asks: KrakenBookEntry[];
            timestamp: string;
        }[]
    }) {
        return new KrakenWsMessage(json.channel, json.type, json.data);
    }
}