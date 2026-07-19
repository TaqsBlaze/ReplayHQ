import React from 'react';

interface DiffViewerProps {
  filePath: string;
  originalContent?: string;
  newContent?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ 
  filePath = "", 
  originalContent = "", 
  newContent = "" 
}) => {
  if (!filePath) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Select a file to view differences
      </div>
    );
  }

  // Simple diff implementation - in reality you'd use a library like diff2html
  const generateDiffLines = (orig: string, neu: string) => {
    const origLines = orig.split('\n').filter(line => line !== '');
    const newLines = neu.split('\n').filter(line => line !== '');
    
    // Simple line-by-line comparison (not a real diff algorithm)
    const maxLines = Math.max(origLines.length, newLines.length);
    const diffLines = [];
    
    for (let i = 0; i < maxLines; i++) {
      const origLine = origLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (origLine === newLine) {
        diffLines.push({ type: 'unchanged', content: origLine, lineNum: i + 1 });
      } else {
        if (origLine && i < origLines.length) {
          diffLines.push({ type: 'removed', content: origLine, lineNum: i + 1 });
        }
        if (newLine && i < newLines.length) {
          diffLines.push({ type: 'added', content: newLine, lineNum: i + 1 });
        }
      }
    }
    
    return diffLines;
  };

  const diffLines = generateDiffLines(originalContent, newContent);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          File Diff: {filePath}
        </h2>
        
        {/* Diff controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={() => {
              // In a real app, this would reset to original
              alert('Reset to original not implemented');
            }}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm"
          >
            Reset to Original
          </button>
          
          <button
            onClick={() => {
              // In a real app, this would apply changes
              alert('Apply changes not implemented');
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          >
            Apply Changes
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {originalContent.length} → {newContent.length} characters
          </span>
        </div>
      </div>
      
      {/* Diff view */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
            activeClassName="border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
          >
            Unified View
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            Side-by-Side
          </button>
        </div>
        
        <div className="overflow-auto">
          <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
              <div className="w-20 text-center">Original</div>
              <div className="w-20 text-center">New</div>
              <div className="flex-1">Line</div>
            </div>
            
            {/* Diff content */}
            <div className="space-y-0">
              {diffLines.map((line, index) => {
                const bgColor = line.type === 'added' 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : line.type === 'removed' 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'bg-transparent';
                
                return (
                  <div key={index} className={`flex items-start px-4 py-1 ${bgColor}`}>
                    <div className="w-20 flex-shrink-0">
                      {line.type === 'added' ? (
                        <span className="text-green-600 dark:text-green-400">+</span>
                      ) : line.type === 'removed' ? (
                        <span className="text-red-600 dark:text-red-400">−</span>
                      ) : (
                        <span className="text-gray-400"> </span>
                      )}
                    </div>
                    <div className="w-20 flex-shrink-0 text-center text-xs text-gray-500 dark:text-gray-400">
                      {line.lineNum}
                    </div>
                    <div className="flex-1 whitespace-pre-wrap text-sm font-mono">
                      {/* Escape HTML entities for safety */}
                      {line.content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
