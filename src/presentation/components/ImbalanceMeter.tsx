
import React from 'react';
import { OrderBookSnapshot } from '../../entities/orderbookSnapshot';

interface ImbalanceMeterProps {
    snapshot: OrderBookSnapshot | null;
}

const ImbalanceMeter: React.FC<ImbalanceMeterProps> = ({ snapshot }) => {
    if (!snapshot) return null;

    const bidVol = snapshot.bids.slice(0, 10).reduce((acc, b) => acc + b.quantity, 0);
    const askVol = snapshot.asks.slice(0, 10).reduce((acc, a) => acc + a.quantity, 0);
    const total = bidVol + askVol;
    const bidRatio = (bidVol / total) * 100;

    return (
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-green-500">Buy Pressure</span>
                <span className="text-red-500">Sell Pressure</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                    className="h-full bg-green-500 transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    style={{ width: `${bidRatio}%` }}
                />
                <div
                    className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    style={{ width: `${100 - bidRatio}%` }}
                />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs">
                <span className="text-zinc-500">{bidVol.toFixed(2)}</span>
                <span className="text-zinc-300 font-bold">{Math.abs(50 - bidRatio).toFixed(1)}% Bias</span>
                <span className="text-zinc-500">{askVol.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default ImbalanceMeter;
