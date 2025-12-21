
import React, { useMemo } from 'react';
import { OrderBookSnapshot } from '../../entities/orderbookSnapshot';
import { OrderLevel } from '../../entities/orderLevel';

interface OrderBookTableProps {
    snapshot: OrderBookSnapshot | null;
    limit?: number;
}

const OrderRow = React.memo(({ level, type, maxTotal }: { level: OrderLevel, type: 'bid' | 'ask', maxTotal: number }) => {
    const isBid = type === 'bid';
    const percentage = (level.total! / maxTotal) * 100;

    return (
        <div className={`relative flex items-center h-7 text-[11px] mono border-b border-zinc-800/30 group hover:bg-zinc-800/40 transition-colors`}>
            {/* Visual Depth Bar */}
            <div
                className={`absolute top-0 bottom-0 transition-all duration-500 opacity-20 ${isBid ? 'right-0 bg-green-500' : 'left-0 bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            />

            {isBid ? (
                <>
                    <div className="flex-1 text-left pl-2 text-zinc-500 z-10">{level.total?.toFixed(2)}</div>
                    <div className="flex-1 text-right pr-4 text-zinc-300 z-10 font-medium">{level.quantity.toFixed(4)}</div>
                    <div className="w-24 text-right pr-3 text-green-400 font-bold z-10 bg-zinc-900/40">{level.price.toLocaleString(undefined, { minimumFractionDigits: 1 })}</div>
                </>
            ) : (
                <>
                    <div className="w-24 text-left pl-3 text-red-400 font-bold z-10 bg-zinc-900/40">{level.price.toLocaleString(undefined, { minimumFractionDigits: 1 })}</div>
                    <div className="flex-1 text-left pl-4 text-zinc-300 z-10 font-medium">{level.quantity.toFixed(4)}</div>
                    <div className="flex-1 text-right pr-2 text-zinc-500 z-10">{level.total?.toFixed(2)}</div>
                </>
            )}
        </div>
    );
});

const OrderBookTable: React.FC<OrderBookTableProps> = ({ snapshot, limit = 20 }) => {
    if (!snapshot) return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Awaiting Kraken Snapshot</span>
        </div>
    );

    const bids = snapshot.bids.slice(0, limit);
    const asks = snapshot.asks.slice(0, limit);

    const maxTotal = useMemo(() => {
        const bMax = bids[bids.length - 1]?.total || 1;
        const aMax = asks[asks.length - 1]?.total || 1;
        return Math.max(bMax, aMax);
    }, [bids, asks]);

    return (
        <div className="flex flex-col h-full bg-zinc-900/20 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Header Tabs */}
            <div className="grid grid-cols-2 bg-zinc-800/40 border-b border-zinc-800">
                <div className="p-3 text-[10px] font-black text-green-500 uppercase tracking-tighter text-center border-r border-zinc-800">Bids (Buys)</div>
                <div className="p-3 text-[10px] font-black text-red-500 uppercase tracking-tighter text-center">Asks (Sells)</div>
            </div>

            {/* Column Sub-headers */}
            <div className="grid grid-cols-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex justify-between px-2 py-1.5 border-r border-zinc-800">
                    <span>Total</span>
                    <span>Size</span>
                    <span className="w-24 text-right">Price</span>
                </div>
                <div className="flex justify-between px-2 py-1.5">
                    <span className="w-24">Price</span>
                    <span>Size</span>
                    <span className="text-right">Total</span>
                </div>
            </div>

            {/* The Symmetrical Ladder */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 bg-black/20">
                {/* Bids Column */}
                <div className="border-r border-zinc-800">
                    {bids.map((bid) => (
                        <OrderRow key={`bid-${bid.price}`} level={bid} type="bid" maxTotal={maxTotal} />
                    ))}
                </div>

                {/* Asks Column */}
                <div>
                    {asks.map((ask) => (
                        <OrderRow key={`ask-${ask.price}`} level={ask} type="ask" maxTotal={maxTotal} />
                    ))}
                </div>
            </div>

            {/* Spread Footer */}
            <div className="p-3 bg-indigo-600/10 border-t border-indigo-500/20 flex justify-between items-center">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Market Spread</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black text-white mono">
                        {(snapshot.asks[0].price - snapshot.bids[0].price).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">USD</span>
                </div>
            </div>
        </div>
    );
};

export default OrderBookTable;
