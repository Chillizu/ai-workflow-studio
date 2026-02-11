import { Layout, Menu, Button, Space, Drawer } from 'antd';
import { PlayCircle, Save, Download, Upload, Menu as MenuIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onSave?: () => void;
  onExecute?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSave,
  onExecute,
  onExport,
  onImport,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { key: 'workflows', label: <Link to="/workflows">工作流</Link> },
    { key: 'executions', label: <Link to="/executions">执行历史</Link> },
    { key: 'settings', label: <Link to="/settings/apis">API配置</Link> },
  ];

  const activeKey = menuItems.find(item => location.pathname.startsWith(item.key === 'workflows' ? '/workflows' : item.key === 'executions' ? '/executions' : '/settings'))?.key || 'workflows';

  return (
    <AntHeader className="bg-dark-surface/80 backdrop-blur-md border-b border-dark-border px-4 md:px-6 flex items-center justify-between h-16 sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-8">
        {isMobile && (
          <Button 
            type="text" 
            icon={<MenuIcon size={20} />} 
            onClick={() => setMobileMenuOpen(true)}
            className="text-white md:hidden"
          />
        )}
        
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          AI Workflow
        </Link>
        
        {!isMobile && (
          <Menu
            mode="horizontal"
            className="bg-transparent border-none flex-1 min-w-[300px]"
            selectedKeys={[activeKey]}
            items={menuItems}
          />
        )}
      </div>
      
      {(onSave || onExecute || onExport || onImport) && (
        <Space size="small">
          {onImport && (
            <Button
              icon={<Upload size={16} />}
              onClick={onImport}
              className="flex items-center gap-2 hidden md:flex"
            >
              导入
            </Button>
          )}
          {onExport && (
            <Button
              icon={<Download size={16} />}
              onClick={onExport}
              className="flex items-center gap-2 hidden md:flex"
            >
              导出
            </Button>
          )}
          {onSave && (
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={onSave}
              className="flex items-center gap-2"
            >
              {isMobile ? '' : '保存'}
            </Button>
          )}
          {onExecute && (
            <Button
              type="primary"
              icon={<PlayCircle size={16} />}
              onClick={onExecute}
              className="flex items-center gap-2 bg-gradient-to-r from-accent to-accent-hover border-none hover:shadow-lg hover:shadow-accent/20 transition-all"
            >
              {isMobile ? '' : '执行'}
            </Button>
          )}
        </Space>
      )}

      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        classNames={{ body: 'p-0' }}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={() => setMobileMenuOpen(false)}
          className="border-none"
        />
        {isMobile && (onImport || onExport) && (
          <div className="p-4 border-t border-dark-border flex flex-col gap-2">
             {onImport && (
                <Button block icon={<Upload size={16} />} onClick={onImport}>导入</Button>
             )}
             {onExport && (
                <Button block icon={<Download size={16} />} onClick={onExport}>导出</Button>
             )}
          </div>
        )}
      </Drawer>
    </AntHeader>
  );
};
