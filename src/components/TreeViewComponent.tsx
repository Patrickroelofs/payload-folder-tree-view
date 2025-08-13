import type { Document, FlatTree } from 'src/lib/buildFolderTree.js';

import { Link, NavGroup } from '@payloadcms/ui';
import React from 'react';

import styles from "./styles.module.css";

interface TreeViewClientProps {
  data: FlatTree;
}

const TreeViewComponent: React.FC<TreeViewClientProps> = ({ data }) => {
  const getDocumentLabel = (id: string) => id;
  const getFolderLabel = (id: string) => data.items[id]?.title || id;

  const renderDocuments = (documents: Document[], depth: number) => {
    if (!documents.length) {
      return <span className={styles.emptyState}>No documents found...</span>;
    }

    return (
      <ul className={styles.documentList} data-depth={depth}>
        {documents.map(doc => (
          <li className={styles.treeItem} data-type="document" key={doc.id}>
            <Link
              href="#"
              title={getDocumentLabel(doc.id)}
            >
              <span className={styles.itemName}>
                {getDocumentLabel(doc.id)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const renderFolders = (folderIds: string[], depth = 0): React.ReactNode => {
    if (!folderIds.length) { return null; }

    return (
      <ul data-depth={depth}>
        {folderIds.map(folderId => {
          const folderNode = data.items[folderId];
          if (!folderNode) { return null; }

          const childFolderIds =
            (folderNode.folders || []).map(f => (typeof f === 'string' ? f : f.id));

          const documents = folderNode.documents || [];
          const hasFolders = childFolderIds.length > 0;
          const hasDocuments = documents.length > 0;

          return (
            <NavGroup
              data-depth={depth}
              isOpen={false}
              key={folderId}
              label={getFolderLabel(folderId)}
            >
              {hasFolders && renderFolders(childFolderIds, depth + 1)}
              {hasDocuments
                ? renderDocuments(documents, depth + 1)
                : !hasFolders && <span className={styles.emptyState}>Empty folder...</span>}
            </NavGroup>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.treeView}>
      <NavGroup isOpen={false} label="Folders">
        {data.rootIds.length === 0 ? (
          <span className={styles.emptyState}>No folders found...</span>
        ) : (
          renderFolders(data.rootIds, 0)
        )}
      </NavGroup>
    </div>
  );
};

export default TreeViewComponent;