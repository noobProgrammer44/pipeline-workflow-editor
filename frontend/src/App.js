import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { PipelineUI } from './ui';
import { StatusBar } from './StatusBar';
import { ToastContainer } from './Toast';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <PipelineUI />
      </div>
      <StatusBar />
      <ToastContainer />
    </div>
  );
}

export default App;
