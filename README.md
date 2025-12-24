# KronosL2

KronosL2 is a production-grade real-time orderbook visualizer designed to demonstrate how **Hexagonal Architecture** and **Signal-based state management** scale in high-frequency browser environments.

By decoupling business logic from UI rendering, KronosL2 achieves **60fps performance** while handling 20+ WebSocket messages per second. It features a novel **"Time Travel" engine**, allowing users to pause live liquid markets and scrub backward to analyze volatility tick-by-tick.

**Key Highlights:**
*   **Technical Execution**: Built with **Preact Signals** for granular reactivity to handle high-throughput streams without main-thread blocking.
*   **Innovation**: Brings DVR-style playback controls (Pause, Rewind, Replay) to live financial data streams.
*   **Architecture & Reusability**: Implements strict **Hexagonal Architecture**, completely isolating the **Domain** from the **Infrastructure**. This allows the data source (currently Kraken WS) to be swapped for any exchange connector without touching a single line of business logic or UI code.
*   **UX & Accessibility**: Features a contrast-optimized dark mode, clear data visualization with D3.js, and full keyboard navigation for the playback engine.

## 🚀 How to Run

### Prerequisites
- Node.js (v24+ recommended)
- npm

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development Server
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🛠️ Tech Stack

- **Vite**: Next-generation frontend tooling that provides a lightning-fast development server and optimized production builds.
- **TailwindCSS**: A utility-first CSS framework for rapid UI development, used here for building a modern, responsive, and dark-themed interface.
- **Preact Signals**: A high-performance state management library. We use `@preact/signals-react` to handle high-frequency WebSocket updates (20+ messages/sec) without triggering unnecessary React component re-renders, ensuring the UI stays buttery smooth (60fps).

## 🏗️ Hexagonal Architecture

This project follows **Hexagonal Architecture (Ports and Adapters)** principles to decouple core business logic from external concerns like the UI and data sources. This ensures the application is maintainable, testable, and flexible.

The codebase is organized into four distinct layers:

### 1. Domain Layer (`src/entities`)
**The Core.** This layer contains the enterprise business rules and entities. It has **no dependencies** on other layers.

-   **Key Files**:
    -   `orderbookSnapshot.ts`: Defines the structure of a normalized orderbook state.
    -   `orderLevel.ts`: Defines price/quantity levels.
    -   `historyFrame.ts`: Defines the structure for historical data points.
    -   `krakenWsMessage.ts`: Defines the structure of Kraken WebSocket messages.
    -   `krakenBookEntry.ts`: Defines the structure of Kraken WebSocket book entries.

### 2. Application Layer (`src/application`)
**The Orchestrator.** This layer controls the flow of data between the UI (Presentation) and external services (Infrastructure). It contains the *use cases* of the application.

-   **Implementation**:
    -   `orderbook.readService.ts`: A custom React hook (`useOrderBookReadService`) acts as the application service. It manages the `signals` (state), handles the cyclic buffer for time travel, and exposes specific `actions` (Connect, Pause, GoToHistory) to the UI.

### 3. Infrastructure Layer (`src/infrastructure`)
**The Adapter.** This layer implements the interfaces defined by the application/domain to talk to the "outside world."

-   **Implementation**:
    -   `krakenWS.repository.ts`: Connects to Kraken's public WebSocket API. It handles subscription management, connection health, and most importantly, **adapts** the raw, complex Kraken message format into our clean `OrderBookSnapshot` domain entity before passing it "inward" to the Application layer.

### 4. Presentation Layer (`src/presentation` & `src/App.tsx`)
**The Interface.** This layer is responsible for rendering the state to the user and capturing user input.

-   **Implementation**:
    -   **Components**: `DepthChart`, `ImbalanceMeter`, `OrderBookTable`.
    -   **View**: `App.tsx` acts as the main composition root, wiring the Application service to the UI components.

---

### Data Flow Summary
1.  **Infrastructure** receives raw WebSocket event → Adapts it to `OrderBookSnapshot` (Domain).
2.  **Application** receives `OrderBookSnapshot` → Updates State (`signals`) & History Buffer.
3.  **Presentation** observes State → Renders UI (Charts, Tables).
