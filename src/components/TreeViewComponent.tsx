import type { DocType, TreeNode } from 'src/lib/buildFolderTree.js';

import { Link, NavGroup } from '@payloadcms/ui';
import React from 'react';

import styles from "./styles.module.css";

interface TreeViewClientProps {
  data: TreeNode[];
}

const TreeViewComponent: React.FC<TreeViewClientProps> = ({ data }) => {
  // TODO: Reimplement open folder icon
  const buildNodeHref = (node: TreeNode) => {
    return `/admin/browse-by-folder/${node.id}`;
  };

  const buildDocumentHref = (doc: DocType) => {
    return `/admin/collections/${doc.relationTo}/${doc._id}`;
  };

  const getDocumentLabel = (doc: DocType) => {
    return doc.title || doc._id;
  };

  const renderDocuments = (docs: DocType[], depth: number) => {
    return (
      <ul data-depth={depth}>
        {docs.map((doc) => (
          <div className={styles.treeItem} data-type="document" key={doc._id}>
            <Link
              href={buildDocumentHref(doc)}
              title={getDocumentLabel(doc)}
            >
              <span className={styles.itemName}>
                {getDocumentLabel(doc)}
              </span>
            </Link>
          </div>
        ))}
      </ul>
    );
  };

  const renderFolders = (nodes: TreeNode[], depth = 0) => (
    <ul className={styles.documentList} data-depth={depth}>
      {nodes.map(node => {
        return (
          <NavGroup data-depth={depth} isOpen={false} key={node.id} label={node.name}>
            {node.folders && node.folders.length > 0 && renderFolders(node.folders, depth + 1)}
            {Array.isArray(node.documents) && node.documents.length > 0 ? renderDocuments(node.documents, depth + 1) : (
              <span className={styles.emptyState}>
                No documents found...
              </span>
            )}
          </NavGroup>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.treeView}>
      <NavGroup isOpen={false} label="Folders">
        {data.length === 0 ? (
          <span className={styles.emptyState}>
            No folders found...
          </span>
        ) : (
          renderFolders(data)
        )}
      </NavGroup>
    </div>
  );
};

export default TreeViewComponent;