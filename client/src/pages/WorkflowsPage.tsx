import { Card, Button, Empty } from 'antd';
import { Plus } from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useNavigate } from 'react-router-dom';

export const WorkflowsPage = () => {
  const navigate = useNavigate();

  const handleCreateWorkflow = () => {
    navigate('/editor/new');
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">工作流列表</h1>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2"
          >
            新建工作流
          </Button>
        </div>
        
        <Card className="bg-dark-surface border-dark-border">
          <Empty
            description="暂无工作流"
            className="text-gray-400"
          >
            <Button type="primary" onClick={handleCreateWorkflow}>
              创建第一个工作流
            </Button>
          </Empty>
        </Card>
      </div>
    </MainLayout>
  );
};
