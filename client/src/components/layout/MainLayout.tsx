import { Layout, Drawer } from 'antd';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { useState, useEffect } from 'react';

const { Content: AntContent } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  headerProps?: {
    onSave?: () => void;
    onExecute?: () => void;
    onExport?: () => void;
    onImport?: () => void;
  };
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
  headerProps,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout className="min-h-screen bg-dark-bg">
      <Header {...headerProps} />
      <Layout className="relative">
        {/* Desktop Sidebar */}
        {!isMobile && sidebar}

        {/* Mobile Sidebar Drawer - Only if sidebar is provided */}
        {isMobile && sidebar && (
          <Drawer
            placement="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            width={280}
            classNames={{ body: 'p-0' }}
            title="组件库"
          >
            {sidebar}
          </Drawer>
        )}

        {/* Mobile Toggle Button for Sidebar - Only visible in editor page which has sidebar */}
        {isMobile && sidebar && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 bottom-20 z-40 bg-primary text-white p-3 rounded-full shadow-lg lg:hidden"
            aria-label="Open Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}

        <AntContent className="bg-dark-bg flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          {children}
        </AntContent>
      </Layout>
    </Layout>
  );
};
