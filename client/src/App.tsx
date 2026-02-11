import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import './App.css';

// 路由懒加载 - 提升首屏加载速度
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage').then(m => ({ default: m.WorkflowsPage })));
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));
const ExecutionsPage = lazy(() => import('./pages/ExecutionsPage').then(m => ({ default: m.ExecutionsPage })));
const APISettingsPage = lazy(() => import('./pages/APISettingsPage').then(m => ({ default: m.APISettingsPage })));

// 加载中组件
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f172a'
  }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1', // indigo-500
          colorBgContainer: '#1e293b', // slate-800
          colorBgElevated: '#1e293b', // slate-800
          colorBorder: '#334155', // slate-700
          colorText: '#f8fafc', // slate-50
          colorTextSecondary: '#94a3b8', // slate-400
          colorTextHeading: '#f8fafc',
          borderRadius: 8,
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        },
        components: {
          Button: {
            controlHeight: 36,
            borderRadius: 6,
            boxShadow: 'none',
          },
          Input: {
            controlHeight: 36,
            borderRadius: 6,
            colorBgContainer: '#0f172a', // slate-950
          },
          Select: {
            controlHeight: 36,
            borderRadius: 6,
            colorBgContainer: '#0f172a', // slate-950
          },
          Card: {
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          Menu: {
            itemBg: 'transparent',
            itemHoverBg: '#334155', // slate-700
            itemSelectedBg: '#334155', // slate-700
          },
        },
      }}
    >
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/workflows" replace />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/editor/:id" element={<EditorPage />} />
            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/settings/apis" element={<APISettingsPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
