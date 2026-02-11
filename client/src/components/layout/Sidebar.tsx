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
      className="!bg-dark-surface !border-r !border-dark-border h-full custom-scrollbar"
      theme="dark"
      trigger={null} // We can add a custom trigger if needed, or rely on the parent to control
      breakpoint="lg"
      collapsedWidth={0} // On small screens, let it disappear if not handled by Drawer
      onBreakpoint={(broken) => {
        // Optional: handle breakpoint changes
      }}
    >
      <div className="h-full overflow-y-auto custom-scrollbar p-2">
        {children}
      </div>
    </Sider>
  );
};
