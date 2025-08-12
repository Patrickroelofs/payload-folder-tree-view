"use client";
import type { DocType, TreeNode } from 'src/lib/buildFolderTree.js';

import React, { useCallback, useState } from 'react';

import styles from "./styles.module.css";

interface TreeViewClientProps {
  data: TreeNode[];
}

export const TreeViewClient: React.FC<TreeViewClientProps> = ({ data }) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const buildNodeHref = (node: TreeNode) => {
    return ``;
  };

  const buildDocumentHref = (doc: DocType) => {
    return '#';
  };

  const getDocumentLabel = (doc: DocType) => {
    return doc.title || doc._id;
  };

  const renderDocuments = (docs: DocType[], depth: number) => {
    if (!docs?.length) { return null; }
    return (
      <ul className={styles.treeList} data-depth={depth}>
        {docs.map((doc) => (
          <li className={styles.treeItem} data-type="document" key={doc._id}>
            <div className={styles.folderRow}>
              <a
                className={styles.itemLink}
                href={buildDocumentHref(doc)}
                onClick={(e) => e.stopPropagation()}
                title={getDocumentLabel(doc)}
              >
                <span className={styles.itemName}>
                  {getDocumentLabel(doc)}
                </span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderNodes = (nodes: TreeNode[], depth = 0) => (
    <ul className={styles.treeList} data-depth={depth}>
      {nodes.map(node => {
        const isOpen = expanded.has(node.id);

        return (
          <li className={styles.treeItem} key={node.id}>
            <div className={styles.folderRow}>
              <button
                aria-expanded={isOpen}
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} folder ${node.name}`}
                className={styles.toggleButton}
                onClick={() => toggle(node.id)}
                type="button"
              >
                <span className={styles.disclosureIcon}>
                  {isOpen ? '▾' : '▸'}
                </span>
                <span className={styles.itemName}>{node.name}</span>
              </button>

              <button
                aria-label={`Open folder ${node.name}`}
                className={styles.openFolderButton}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = buildNodeHref(node);
                }}
                title={`Open folder ${node.name}`}
                type="button"
              >
                ↗
              </button>
            </div>

            {isOpen && node.folders && (
              <div>{renderNodes(node.folders, depth + 1)}</div>
            )}

            {isOpen && Array.isArray(node.documents) && renderDocuments(node.documents, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return <div className={styles.treeRoot}>{renderNodes(data)}</div>;
};

export default TreeViewClient;