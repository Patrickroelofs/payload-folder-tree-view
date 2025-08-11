"use client";
import React, { useCallback, useState } from 'react';

import type { TreeDataItem } from './TreeView.js';

import styles from "./styles.module.css";

interface TreeViewClientProps {
  data: TreeDataItem[];
}

function sortTree(nodes: TreeDataItem[]): TreeDataItem[] {
  return [...nodes].sort((a, b) => {
    const aIsFolder = Array.isArray(a.children) && a.children.length > 0;
    const bIsFolder = Array.isArray(b.children) && b.children.length > 0;
    if (aIsFolder !== bIsFolder) {
      return aIsFolder ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
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

  const buildNodeHref = (node: TreeDataItem) => {
    return `/admin/${node.relationTo === 'payload-folders' ? 'browse-by-folder/' : 'collections/'}${node.relationTo !== 'payload-folders' ? node.relationTo : ''}/${node.id}`;
  };

  const renderNodes = (nodes: TreeDataItem[], depth = 0) => (
    <ul className={styles.treeList} data-depth={depth}>
      {sortTree(nodes).map(node => {
        const isFolder = Array.isArray(node.children) && node.children.length > 0;
        const isOpen = isFolder && expanded.has(node.id);

        return (
          <li className={styles.treeItem} key={node.id}>
            {isFolder ? (
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
                  <span>{node.name}</span>
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
            ) : (
              <button
                aria-label={`Open item ${node.name}`}
                className={styles.itemButton}
                onClick={() => { window.location.href = buildNodeHref(node); }}
                type="button"
              >
                <span className={styles.disclosureSpacer} />
                <span>{node.name}</span>
              </button>
            )}
            {isFolder && isOpen && node.children && (
              <div>{renderNodes(node.children, depth + 1)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return <div className={styles.treeRoot}>{renderNodes(data)}</div>;
};

export default TreeViewClient;
