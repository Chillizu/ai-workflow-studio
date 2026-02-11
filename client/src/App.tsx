import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { EditorPage } from './pages/EditorPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { APISettingsPage } from './pages/APISettingsPage';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: '#1a1a1a',
          colorBgElevated: '#1a1a1a',
          colorBorder: '#2a2a2a',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/executions" element={<ExecutionsPage />} />
          <Route path="/settings/apis" element={<APISettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
