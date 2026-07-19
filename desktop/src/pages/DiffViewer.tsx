import React, { useState } from 'react';
import DiffViewer from '../components/replay/DiffViewer';

const DiffViewerPage: React.FC = () => {
  return (
    <div>
      <h1>Diff Viewer Placeholder</h1>
      <DiffViewer filePath="test.js" originalContent="// original" newContent="// new" />
    </div>
  );
};

export default DiffViewerPage;
