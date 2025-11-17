import React, { useState } from 'react';
import { OutputResult } from '../../types';
import {
  Copy,
  Download,
  Share2,
  RefreshCw,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Code,
  FileJson,
  FileText,
  File
} from 'lucide-react';

interface OutputPanelProps {
  result: OutputResult;
  onRegenerate?: () => void;
  onShare?: () => void;
  showCollaboration?: boolean; // B2B feature
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  result,
  onRegenerate,
  onShare,
  showCollaboration = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output-${result.id}.${result.format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = () => {
    switch (result.format) {
      case 'json': return <FileJson size={16} />;
      case 'html': return <Code size={16} />;
      case 'markdown': return <FileText size={16} />;
      default: return <File size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case 'success': return <CheckCircle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {getFormatIcon()}
            Generated Output
          </h3>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Maximize2 size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>Generated in: {result.metadata.generationTime}s</span>
          </div>

          {result.metadata.qualityScore && (
            <div className="flex items-center gap-1">
              <BarChart3 size={14} />
              <span>Quality: {result.metadata.qualityScore}%</span>
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${result.metadata.qualityScore}%` }}
                />
              </div>
            </div>
          )}

          {result.metadata.tokenCount && (
            <div className="flex items-center gap-1">
              <span>Tokens: {result.metadata.tokenCount.toLocaleString()}</span>
            </div>
          )}

          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize">{result.status}</span>
          </div>
        </div>
      </div>

      {/* Output Content */}
      <div className={`bg-gray-50 dark:bg-gray-900 p-6 ${isFullscreen ? 'max-h-[calc(100vh-16rem)] overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}>
        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
          {result.content}
        </pre>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Copy size={16} />
              <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span className="text-sm font-medium">Download</span>
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Share2 size={16} />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
          </div>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <RefreshCw size={16} />
              <span className="text-sm font-medium">Regenerate</span>
            </button>
          )}
        </div>

        {/* B2B Collaboration Features */}
        {showCollaboration && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Collaborate:</span>
              <div className="flex -space-x-2">
                <img
                  src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                />
                <img
                  src="https://ui-avatars.com/api/?name=Jane+Smith&background=random"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                />
                <button className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  +3
                </button>
              </div>
              <button className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                Add annotations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
