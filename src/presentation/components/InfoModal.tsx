
import React from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tighter">System Documentation</h2>
                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-indigo-400 font-bold uppercase text-xs mb-1">Time Travel Engine</h3>
                        <p>KronosL2 buffers up to 1,000 orderbook states. Use the scrubber to rewind and analyze liquidity dynamics before price movements.</p>
                    </section>
                    <section>
                        <h3 className="text-indigo-400 font-bold uppercase text-xs mb-1">Depth Visualization</h3>
                        <p>The chart displays cumulative volume. Green areas represent support (buy walls), and red areas represent resistance (sell walls).</p>
                    </section>
                    <section>
                        <h3 className="text-indigo-400 font-bold uppercase text-xs mb-1">Keyboard Shortcuts</h3>
                        <ul className="grid grid-cols-2 gap-2 mt-2 font-mono">
                            <li className="bg-zinc-800 p-2 rounded text-[10px] text-zinc-300 flex justify-between"><span>SPACE</span><span>PAUSE/PLAY</span></li>
                            <li className="bg-zinc-800 p-2 rounded text-[10px] text-zinc-300 flex justify-between"><span>ARROWS</span><span>SCRUB</span></li>
                        </ul>
                    </section>
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-black font-bold rounded-xl transition-all"
                >
                    CONTINUE TO TERMINAL
                </button>
            </div>
        </div>
    );
};

export default InfoModal;
