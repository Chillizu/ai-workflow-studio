import { Layout } from 'antd';
import type { ReactNode } from 'react';

const { Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsed = false,
  onCollapse,
  width = 280,
}) => {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={width}
      className="bg-dark-surface border-r border-dark-border"
      theme="dark"
    >
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </Sider>
  );
};
