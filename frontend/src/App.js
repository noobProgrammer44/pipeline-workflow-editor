import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { PipelineUI } from "./components/Canvas";
import { StatusBar } from "./components/StatusBar";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <PipelineUI />
      </div>
      <StatusBar />
      <ToastContainer />
    </div>
  );
}

export default App;
