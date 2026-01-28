'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface HealthCheck {
  apiConnected: boolean;
  apiBaseUrl: string;
  error: string | null;
  timestamp: string;
}

export default function ApiTestPage() {
  const [health, setHealth] = useState<HealthCheck>({
    apiConnected: false,
    apiBaseUrl: '',
    error: null,
    timestamp: '',
  });

  const checkApi = async () => {
    try {
      const startTime = Date.now();
      const result = await apiClient.get('/health');
      const endTime = Date.now();
      
      setHealth({
        apiConnected: true,
        apiBaseUrl: 'http://98.82.28.184:3001',
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      setHealth({
        apiConnected: false,
        apiBaseUrl: 'http://98.82.28.184:3001',
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    checkApi();
    // 每 5 秒检查一次
    const interval = setInterval(checkApi, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-2">API 连接测试</h1>
        <p className="text-muted-foreground mb-8">
          测试 Vercel 前端与 VPS API 之间的连接
        </p>

        {/* API 健康状态 */}
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <h2 className="text-xl font-semibold mb-4">API 健康状态</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health.apiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">API 服务器</div>
                <div className="text-sm text-muted-foreground">
                  {health.apiConnected ? '✓ 已连接' : '✗ 未连接'}
                </div>
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API 地址：</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {health.apiBaseUrl}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">检查时间：</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {health.timestamp}
                </span>
              </div>
            </div>

            {health.error && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-md border border-destructive">
                <div className="font-medium mb-2">错误信息</div>
                <div className="text-sm font-mono bg-background p-3 rounded">
                  {health.error}
                </div>
              </div>
            )}

            {!health.error && health.apiConnected && (
              <div className="mt-4 p-4 bg-green-500/10 rounded-md border border-green-500/50">
                <div className="font-medium mb-2">✓ 连接成功</div>
                <div className="text-sm">
                  API 配置正确，可以正常使用 Dashboard 功能
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Key 信息 */}
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <h2 className="text-xl font-semibold mb-4">配置信息</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Key：</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                workshop-api-key-emery-2024 (已设置)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">环境变量：</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                API_BASE = http://98.82.28.184:3001
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">自动刷新：</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                每 5 秒
              </span>
            </div>
          </div>
        </div>

        {/* 返回首页按钮 */}
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
