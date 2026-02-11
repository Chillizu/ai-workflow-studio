/**
 * 执行历史页面
 * 显示所有执行记录，支持查看详情
 */

import { useEffect, useState } from 'react';
import { Card, Empty, Table, Tag, Button, Modal, Spin, Space } from 'antd';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useExecutionStore } from '../store/executionStore';
import type { ExecutionRecord } from '../../../shared/types';

export const ExecutionsPage = () => {
  const { executions, loading, loadExecutions, loadExecution, currentExecution } = useExecutionStore();
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 加载执行历史
  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  // 查看执行详情
  const handleViewDetail = async (id: string) => {
    try {
      await loadExecution(id);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('加载执行详情失败:', error);
    }
  };

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      pending: { color: 'default', icon: <Clock size={14} />, text: '等待中' },
      running: { color: 'processing', icon: <AlertCircle size={14} />, text: '执行中' },
      completed: { color: 'success', icon: <CheckCircle size={14} />, text: '已完成' },
      failed: { color: 'error', icon: <XCircle size={14} />, text: '失败' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 计算执行时长
  const calculateDuration = (startTime: Date, endTime?: Date) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const duration = Math.floor((end - start) / 1000);
    
    if (duration < 60) return `${duration}秒`;
    if (duration < 3600) return `${Math.floor(duration / 60)}分${duration % 60}秒`;
    return `${Math.floor(duration / 3600)}小时${Math.floor((duration % 3600) / 60)}分`;
  };

  // 表格列定义
  const columns = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: '工作流ID',
      dataIndex: 'workflowId',
      key: 'workflowId',
      width: 200,
      render: (id: string) => (
        <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: renderStatus,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: (time: Date) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '执行时长',
      key: 'duration',
      width: 120,
      render: (_: any, record: ExecutionRecord) => 
        calculateDuration(record.startTime, record.endTime),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: ExecutionRecord) => (
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={() => handleViewDetail(record.id)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">执行历史</h1>

        <Card className="bg-dark-surface border-dark-border">
          <Spin spinning={loading}>
            {executions.length === 0 ? (
              <Empty
                description="暂无执行记录"
                className="text-gray-400"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={executions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            )}
          </Spin>
        </Card>

        {/* 执行详情对话框 */}
        <Modal
          title="执行详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {currentExecution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">执行ID</div>
                  <div className="font-mono text-xs">{currentExecution.id}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">工作流ID</div>
                  <div className="font-mono text-xs">{currentExecution.workflowId}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">状态</div>
                  <div>{renderStatus(currentExecution.status)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">执行时长</div>
                  <div>{calculateDuration(currentExecution.startTime, currentExecution.endTime)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">开始时间</div>
                  <div>{new Date(currentExecution.startTime).toLocaleString('zh-CN')}</div>
                </div>
                {currentExecution.endTime && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">结束时间</div>
                    <div>{new Date(currentExecution.endTime).toLocaleString('zh-CN')}</div>
                  </div>
                )}
              </div>

              {currentExecution.error && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">错误信息</div>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600">
                    {currentExecution.error}
                  </div>
                </div>
              )}

              <div>
                <div className="text-gray-400 text-sm mb-2">节点执行结果</div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-96 overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(currentExecution.nodeResults, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
