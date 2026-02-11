import { Card, Empty } from 'antd';
import { MainLayout } from '../components/layout';

export const ExecutionsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">执行历史</h1>
        
        <Card className="bg-dark-surface border-dark-border">
          <Empty
            description="暂无执行记录"
            className="text-gray-400"
          />
        </Card>
      </div>
    </MainLayout>
  );
};
