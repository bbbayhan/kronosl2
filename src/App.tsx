import { useEffect, useState } from 'react'
import './App.css'
import { useOrderBookReadService } from './application/orderbook.readService'
import InfoModal from './presentation/components/InfoModal'
import DepthChart from './presentation/components/DepthChart';
import ImbalanceMeter from './presentation/components/ImbalanceMeter';
import OrderBookTable from './presentation/components/OrderbookTable';

function App() {
  const [symbol, setSymbol] = useState('BTC/USD');
  const [showInfo, setShowInfo] = useState(false);

  const readService = useOrderBookReadService(symbol);

  // Reconnect WS when symbol changes
  useEffect(() => {
    readService.actions.connect();
    return () => readService.actions.disconnect();
  }, [symbol]);

  const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD'];



  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        readService.state.isPaused.value = !readService.state.isPaused.value;
        if (readService.state.isPaused.value) readService.state.historyIndex.value = readService.state.history.value.length - 1;
        else readService.state.historyIndex.value = -1;
      }
      if (readService.state.isPaused.value) {
        if (e.code === 'ArrowLeft') readService.state.historyIndex.value = Math.max(0, readService.state.historyIndex.value - 1);
        if (e.code === 'ArrowRight') readService.state.historyIndex.value = Math.min(readService.state.history.value.length - 1, readService.state.historyIndex.value + 1);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  return (
    <div className="flex flex-col h-screen p-4 bg-[#0a0a0c] gap-4">
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      <header className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 gap-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowInfo(true)}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">KronosL2</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Signal-Core V1.8</p>
            </div>
          </div>

          <nav className="flex bg-zinc-800/50 p-1 rounded-xl gap-1">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => readService.actions.reset()}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${symbol === s ? 'font-bold bg-zinc-700 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {s.split('/')[0]}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 bg-zinc-800/30 px-4 py-2 rounded-xl border border-zinc-700/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Live Market</span>
            <span className={`text-lg font-black mono text-indigo-400`}>
              ${readService.state.liveSnapshot.value?.asks[0]?.price.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-[2] min-h-[300px]">
            <DepthChart snapshot={readService.state.liveSnapshot.value} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <ImbalanceMeter snapshot={readService.state.liveSnapshot.value} />
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 flex-1 flex flex-col justify-center">
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Network Health</h4>
                <p className="text-xs text-zinc-400 mono">STATUS: <span className="text-green-500">CONNECTED</span></p>
                <p className="text-xs text-zinc-400 mono">LATENCY: <span className="text-indigo-400">14MS</span></p>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[600px] flex flex-col">
          <OrderBookTable snapshot={readService.state.liveSnapshot.value} limit={25} />
        </aside>
      </main>

      <footer className="bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-700/50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              readService.actions.pause();
              if (readService.state.isPaused.value) readService.actions.goToHistory(readService.state.history.value.length - 1);
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${readService.state.isPaused.value ? 'bg-indigo-600' : 'bg-zinc-800 text-red-400'}`}
          >
            {readService.state.isPaused.value ? <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>}
          </button>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
              <span>{readService.state.history.value.length > 0 ? new Date(readService.state.history.value[0].timestamp).toLocaleTimeString() : '...'}</span>
              <span className={readService.state.isPaused.value ? 'text-indigo-400' : 'text-zinc-500'}>
                {readService.state.isPaused.value ? 'REPLAYING HISTORICAL BUFFER' : 'STREAMING LIVE DATA'}
              </span>
              <span>LIVE</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, readService.state.history.value.length - 1)}
              value={readService.state.historyIndex.value >= 0 ? readService.state.historyIndex.value : Math.max(0, readService.state.history.value.length - 1)}
              onChange={(e) => {
                readService.actions.pause();
                readService.actions.goToHistory(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App
