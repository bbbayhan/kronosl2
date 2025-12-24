import { useEffect, useState } from 'react';
import './App.css';

import { useOrderBook } from './presentation/hooks/useOrderBook';
import InfoModal from './presentation/components/InfoModal';
import DepthChart from './presentation/components/DepthChart';
import ImbalanceMeter from './presentation/components/ImbalanceMeter';
import OrderBookTable from './presentation/components/OrderbookTable';

function App() {
  const [symbol, setSymbol] = useState('BTC/USD');
  const [showInfo, setShowInfo] = useState(false);

  const readService = useOrderBook(symbol);

  // Derived snapshot for UI (LIVE or HISTORY)
  const snapshot = readService.state.activeSnapshot.value;

  // Reconnect WS when symbol changes
  useEffect(() => {
    readService.actions.reset();
    readService.actions.connect();

    return () => {
      readService.actions.disconnect();
    };
  }, [symbol]);

  const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD'];

  // Keyboard navigation (replay)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();

        if (readService.state.isPaused.value) {
          readService.actions.resume();
        } else {
          readService.actions.pause();
          readService.actions.goToHistory(
            readService.state.history.value.length - 1
          );
        }
      }

      if (readService.state.isPaused.value) {
        if (e.code === 'ArrowLeft') {
          readService.actions.goToHistory(
            Math.max(0, readService.state.historyIndex.value - 1)
          );
        }

        if (e.code === 'ArrowRight') {
          readService.actions.goToHistory(
            Math.min(
              readService.state.history.value.length - 1,
              readService.state.historyIndex.value + 1
            )
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [readService]);

  return (
    <div className="flex flex-col h-screen p-4 bg-[#0a0a0c] gap-4">
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 gap-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowInfo(true)}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              ⏱
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase italic">
                KronosL2
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">
                Signal-Core V1.8
              </p>
            </div>
          </div>

          <nav className="flex bg-zinc-800/50 p-1 rounded-xl gap-1">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${symbol === s
                  ? 'bg-zinc-800 text-black border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
              >
                {s.split('/')[0]}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 bg-zinc-800/30 px-4 py-2 rounded-xl border border-zinc-700/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">
              Market
            </span>
            <span className="text-lg font-black mono text-indigo-400">
              ${snapshot?.asks[0]?.price.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-[2] min-h-[300px]">
            <DepthChart snapshot={snapshot} />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImbalanceMeter snapshot={snapshot} />
          </div>
        </div>

        <aside className="w-full xl:w-[600px] flex flex-col">
          <OrderBookTable snapshot={snapshot} limit={25} />
        </aside>
      </main>

      <footer className="mt-4 bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-700/50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (readService.state.isPaused.value) {
                readService.actions.resume();
              } else {
                readService.actions.pause();
                readService.actions.goToHistory(
                  readService.state.history.value.length - 1
                );
              }
            }}
            className="w-12 h-12 flex items-center justify-center rounded-xl"
          >
            {readService.state.isPaused.value ? '▶️' : '⏸'}
          </button>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
              <span>{readService.state.isPaused.value ? new Date(readService.state.history.value[readService.state.historyIndex.value].timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
                : new Date(Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}</span>
              <span className={readService.state.isPaused.value ? 'text-indigo-400' : 'text-zinc-500'}>
                {readService.state.isPaused.value ? 'REPLAYING HISTORICAL BUFFER' : 'STREAMING LIVE DATA'}
              </span>
              <span>LIVE</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, readService.state.history.value.length - 1)}
              value={
                readService.state.historyIndex.value >= 0
                  ? readService.state.historyIndex.value
                  : readService.state.history.value.length - 1
              }
              onChange={e => {
                readService.actions.pause();
                readService.actions.goToHistory(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
