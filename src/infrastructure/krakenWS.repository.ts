
import { OrderLevel } from '../entities/orderLevel';
import { KrakenWsMessage } from '../entities/krakenWsMessage';

export class KrakenWsService {
    private ws: WebSocket | null = null;
    private symbol: string;
    private currentBook: { bids: OrderLevel[], asks: OrderLevel[] } = { bids: [], asks: [] };
    private lastUiUpdate = 0;
    private UI_THROTTLE = 100; // ms

    constructor(symbol: string) {
        this.symbol = symbol;
    }

    connect() {
        this.ws = new WebSocket('wss://ws.kraken.com/v2');

        this.ws.onopen = () => {
            const subscription = {
                method: 'subscribe',
                params: { channel: 'book', symbol: [this.symbol], depth: 25 }
            };
            this.ws?.send(JSON.stringify(subscription));
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.channel === 'book' && (msg.type === 'snapshot' || msg.type === 'update')) {
                    this.processMessage(msg as KrakenWsMessage);
                }
            } catch (e) {
                console.error('Error parsing Kraken message:', e);
            }
        };

        this.ws.onclose = () => setTimeout(() => this.connect(), 5000);
    }

    private processMessage(msg: KrakenWsMessage) {
        console.log({ msg })
        const data = msg.data[0];
        if (!data) return;

        if (msg.type === 'snapshot') {
            const bids = data.bids.map(b => ({ price: b.price, quantity: b.qty })).sort((a, b) => b.price - a.price);
            let bTotal = 0;
            const bidsWithTotal = bids.map(b => ({ ...b, total: (bTotal += b.quantity) }));

            const asks = data.asks.map(a => ({ price: a.price, quantity: a.qty })).sort((a, b) => a.price - b.price);
            let aTotal = 0;
            const asksWithTotal = asks.map(a => ({ ...a, total: (aTotal += a.quantity) }));

            this.currentBook = { bids: bidsWithTotal, asks: asksWithTotal };
        } else {
            this.currentBook = {
                bids: this.updateLevels(this.currentBook.bids, data.bids, 'desc'),
                asks: this.updateLevels(this.currentBook.asks, data.asks, 'asc')
            };
        }

        const now = Date.now();
        if (now - this.lastUiUpdate > this.UI_THROTTLE) {
            const snap = {
                ...this.currentBook,
                timestamp: now,
                symbol: this.symbol
            };
            this.lastUiUpdate = now;
            return snap;
        }
    }

    private updateLevels(current: OrderLevel[], updates: { price: number, qty: number }[], order: 'asc' | 'desc') {
        const map = new Map(current.map(l => [l.price, l.quantity]));
        updates.forEach(u => {
            if (u.qty === 0) map.delete(u.price);
            else map.set(u.price, u.qty);
        });
        const sorted = Array.from(map.entries())
            .map(([price, quantity]) => ({ price, quantity }))
            .sort((a, b) => order === 'desc' ? b.price - a.price : a.price - b.price);

        let total = 0;
        return sorted.map(lvl => ({ ...lvl, total: (total += lvl.quantity) }));
    }

    disconnect() {
        this.ws?.close();
    }
}
