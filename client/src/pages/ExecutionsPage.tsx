/**
 * 执行历史页面
 * 显示所有执行记录，支持查看详情
 */

import { useEffect, useState } from 'react';
import { Card, Empty, Table, Tag, Button, Drawer, Spin, Space, Tooltip, Descriptions, Badge } from 'antd';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Play } from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useExecutionStore } from '../store/executionStore';
import type { ExecutionRecord } from '../../../shared/types';

export const ExecutionsPage = () => {
  const { executions, loading, loadExecutions, loadExecution, currentExecution } = useExecutionStore();
  const [detailVisible, setDetailVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 加载执行历史
  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  // 查看执行详情
  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    setDetailVisible(true);
    try {
      await loadExecution(id);
    } catch (error) {
      console.error('加载执行详情失败:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string; badge: "default" | "processing" | "success" | "error" }> = {
      pending: { color: 'default', icon: <Clock size={14} />, text: '等待中', badge: 'default' },
      running: { color: 'processing', icon: <AlertCircle size={14} />, text: '执行中', badge: 'processing' },
      completed: { color: 'success', icon: <CheckCircle size={14} />, text: '已完成', badge: 'success' },
      failed: { color: 'error', icon: <XCircle size={14} />, text: '失败', badge: 'error' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon} className="flex w-fit items-center gap-1 border-none px-2 py-1">
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
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-400">#{id.substring(0, 8)}</span>
      ),
    },
    {
      title: '工作流ID',
      dataIndex: 'workflowId',
      key: 'workflowId',
      render: (id: string) => (
        <span className="font-mono text-xs text-blue-400">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: Date) => (
        <div className="flex items-center gap-2 text-gray-300">
           <Calendar size={14} className="text-gray-500" />
           {new Date(time).toLocaleString('zh-CN')}
        </div>
      ),
    },
    {
      title: '时长',
      key: 'duration',
      render: (_: any, record: ExecutionRecord) => (
         <div className="flex items-center gap-2 text-gray-300">
            <Clock size={14} className="text-gray-500" />
            {calculateDuration(record.startTime, record.endTime)}
         </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ExecutionRecord) => (
        <Tooltip title="查看详情">
           <Button
             type="text"
             icon={<Eye size={16} className="text-primary hover:text-primary-hover" />}
             onClick={() => handleViewDetail(record.id)}
           />
        </Tooltip>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">执行历史</h1>
                <p className="text-gray-400">查看工作流的历史运行记录和结果</p>
            </div>
        </div>

        <Card className="bg-dark-surface border-dark-border shadow-md">
          <Spin spinning={loading}>
            {executions.length === 0 ? (
              <Empty
                description="暂无执行记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="text-gray-400 py-10"
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
                  className: "text-gray-400"
                }}
                className="ant-table-custom"
              />
            )}
          </Spin>
        </Card>

        {/* 执行详情 Drawer */}
        <Drawer
          title="执行详情"
          open={detailVisible}
          onClose={() => setDetailVisible(false)}
          width={600}
          classNames={{ body: 'p-0 bg-dark-bg' }}
        >
          <Spin spinning={loadingDetail}>
             {currentExecution && (
                <div className="p-6 space-y-6">
                   {/* Status Banner */}
                   <div className={`p-4 rounded-lg border flex items-center justify-between ${
                      currentExecution.status === 'completed' ? 'bg-green-500/10 border-green-500/20' :
                      currentExecution.status === 'failed' ? 'bg-red-500/10 border-red-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                   }`}>
                      <div className="flex items-center gap-3">
                         {currentExecution.status === 'completed' ? <CheckCircle className="text-green-500" /> :
                          currentExecution.status === 'failed' ? <XCircle className="text-red-500" /> :
                          <Play className="text-blue-500" />}
                         <div>
                            <div className="font-semibold text-white capitalize">{currentExecution.status}</div>
                            <div className="text-xs text-gray-400">ID: {currentExecution.id}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm text-gray-300">{calculateDuration(currentExecution.startTime, currentExecution.endTime)}</div>
                         <div className="text-xs text-gray-500">耗时</div>
                      </div>
                   </div>

                   {currentExecution.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                         <div className="font-semibold mb-1 flex items-center gap-2"><AlertCircle size={14}/> 错误信息</div>
                         {currentExecution.error}
                      </div>
                   )}

                   <Descriptions title={<span className="text-white">基本信息</span>} column={1} size="small" className="text-gray-400">
                      <Descriptions.Item label="工作流 ID">{currentExecution.workflowId}</Descriptions.Item>
                      <Descriptions.Item label="开始时间">{new Date(currentExecution.startTime).toLocaleString('zh-CN')}</Descriptions.Item>
                      {currentExecution.endTime && (
                         <Descriptions.Item label="结束时间">{new Date(currentExecution.endTime).toLocaleString('zh-CN')}</Descriptions.Item>
                      )}
                   </Descriptions>

                   <div>
                      <h3 className="text-white font-medium mb-3">节点执行结果</h3>
                      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                         {Object.entries(currentExecution.nodeResults || {}).length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">无节点输出数据</div>
                         ) : (
                            <div className="divide-y divide-dark-border">
                               {Object.entries(currentExecution.nodeResults || {}).map(([nodeId, result]: [string, any]) => (
                                  <div key={nodeId} className="p-4">
                                     <div className="flex justify-between items-center mb-2">
                                        <Badge status={result.status === 'completed' ? 'success' : 'error'} text={<span className="text-gray-300 font-mono text-xs">{nodeId}</span>} />
                                        <span className="text-xs text-gray-500">{result.duration ? `${result.duration}ms` : '-'}</span>
                                     </div>
                                     {result.output && (
                                        <div className="bg-dark-bg p-3 rounded border border-dark-border mt-2 overflow-x-auto">
                                           <pre className="text-xs text-gray-400 font-mono m-0">
                                              {typeof result.output === 'object' ? JSON.stringify(result.output, null, 2) : result.output}
                                           </pre>
                                        </div>
                                     )}
                                     {result.error && (
                                        <div className="text-red-400 text-xs mt-2">{result.error}</div>
                                     )}
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             )}
          </Spin>
        </Drawer>
      </div>
    </MainLayout>
  );
};
