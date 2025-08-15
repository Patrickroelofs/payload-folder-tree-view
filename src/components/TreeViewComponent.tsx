import type { PayloadFolderTreeViewConfig } from 'src/index.js';
import type { FlatTree } from 'src/lib/buildFolderTree.js';

import React from 'react';

import "./styles.scss";
import { ExpandedNavGroup } from './ExpandedNavGroup/ExpandedNavGroup.js';

interface TreeViewClientProps {
  data: FlatTree;
  pluginConfig: PayloadFolderTreeViewConfig
}

const TreeViewComponent: React.FC<TreeViewClientProps> = ({ data, pluginConfig }) => {
  const getFolderLabel = (id: string) => data.items[id]?.title || id;

  const renderFolders = (folderIds: string[], depth = 0): React.ReactNode => {
    if (!folderIds.length) { return null; }

    return (
      <ul data-depth={depth}>
        {folderIds.map(folderId => {
          const folderNode = data.items[folderId];
          if (!folderNode) { return null; }

          const childFolderIds =
            (folderNode.folders || []).map(f => (typeof f === 'string' ? f : f.id));

          const hasFolders = childFolderIds.length > 0;

          return (
            <ExpandedNavGroup
              data-depth={depth}
              folderCount={childFolderIds.length}
              folderId={folderId}
              isOpen={false}
              key={folderId}
              label={getFolderLabel(folderId)}
              pluginConfig={pluginConfig}
            >
              {hasFolders && renderFolders(childFolderIds, depth + 1)}
            </ExpandedNavGroup>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="tree-view-component">
      <ExpandedNavGroup folderCount={data.rootIds.length} folderId="root" isOpen={false} label="Folders" pluginConfig={pluginConfig}>
        {data.rootIds.length === 0 ? (
          <span className="empty-state">No folders found...</span>
        ) : (
          renderFolders(data.rootIds, 0)
        )}
      </ExpandedNavGroup>
    </div>
  );
};

export default TreeViewComponent;