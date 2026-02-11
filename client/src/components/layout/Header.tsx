import { Layout, Menu, Button, Space } from 'antd';
import { PlayCircle, Save, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <AntHeader className="bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between h-16">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
          AI工作流系统
        </Link>
        <Menu
          mode="horizontal"
          className="bg-transparent border-none flex-1"
          items={[
            { key: 'workflows', label: <Link to="/workflows">工作流</Link> },
            { key: 'executions', label: <Link to="/executions">执行历史</Link> },
            { key: 'settings', label: <Link to="/settings/apis">API配置</Link> },
          ]}
        />
      </div>
      
      {(onSave || onExecute || onExport || onImport) && (
        <Space size="middle">
          {onImport && (
            <Button
              icon={<Upload size={16} />}
              onClick={onImport}
              className="flex items-center gap-2"
            >
              导入
            </Button>
          )}
          {onExport && (
            <Button
              icon={<Download size={16} />}
              onClick={onExport}
              className="flex items-center gap-2"
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
              保存
            </Button>
          )}
          {onExecute && (
            <Button
              type="primary"
              icon={<PlayCircle size={16} />}
              onClick={onExecute}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              执行
            </Button>
          )}
        </Space>
      )}
    </AntHeader>
  );
};
