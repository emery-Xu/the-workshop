'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [time, setTime] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkApi = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch('http://98.82.28.184:3001/health');
      const data = await res.json();
      setApiStatus(data.status === 'ok' ? 'ok' : 'error');
    } catch (error) {
      setApiStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🧪 Deployment Test Page</h1>
        
        <div className="space-y-4">
          {/* 时间信息 */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Server Time</h2>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              {time}
            </p>
          </div>

          {/* API 状态 */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold mb-4">API Status</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={checkApi}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
              >
                Check API Connection
              </button>
              <span className={`font-mono text-sm px-2 py-1 rounded ${
                apiStatus === 'ok' ? 'bg-green-500/20 text-green-400' :
                apiStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-muted text-muted-foreground'
              }`}>
                {apiStatus === 'checking' ? 'Checking...' : apiStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 环境变量信息 */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node Environment:</span>
                <span className="font-mono">{process.env.NODE_ENV || 'unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Base URL:</span>
                <span className="font-mono text-xs">http://98.82.28.184:3001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Browser:</span>
                <span className="font-mono">{typeof window !== 'undefined' ? 'Browser' : 'Server'}</span>
              </div>
            </div>
          </div>

          {/* 链接列表 */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Links</h2>
            <div className="space-y-2">
              <a href="/dashboard/tasks" className="block p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="font-medium">Tasks</div>
                <div className="text-xs text-muted-foreground">/dashboard/tasks</div>
              </a>
              <a href="/dashboard/ideas" className="block p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="font-medium">Ideas</div>
                <div className="text-xs text-muted-foreground">/dashboard/ideas</div>
              </a>
              <a href="/dashboard/notes" className="block p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="font-medium">Notes</div>
                <div className="text-xs text-muted-foreground">/dashboard/notes</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
