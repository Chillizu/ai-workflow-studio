import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { Header } from './Header';

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
  return (
    <Layout className="min-h-screen">
      <Header {...headerProps} />
      <Layout>
        {sidebar}
        <AntContent className="bg-dark-bg">
          {children}
        </AntContent>
      </Layout>
    </Layout>
  );
};
