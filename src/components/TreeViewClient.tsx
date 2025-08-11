"use client";
import React, { useCallback, useState } from 'react';

import type { TreeDataItem } from './TreeView.js';

interface TreeViewClientProps {
  data: TreeDataItem[];
}

// Utility to sort folders first then alphabetically
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
  // Maintain a set of expanded folder ids
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

  const renderNodes = (nodes: TreeDataItem[], depth = 0) => (
    <ul style={{ listStyle: 'none', marginLeft: depth === 0 ? 0 : 12, paddingLeft: 0 }}>
      {sortTree(nodes).map(node => {
        const isFolder = Array.isArray(node.children) && node.children.length > 0;
        const isOpen = isFolder && expanded.has(node.id);

        return (
          <li key={node.id}>
            <button
              aria-expanded={isFolder ? isOpen : undefined}
              aria-label={isFolder ? `${isOpen ? 'Collapse' : 'Expand'} folder ${node.name}` : undefined}
              onClick={isFolder ? () => toggle(node.id) : () => {
                window.location.href = `
                  admin/${node.relationTo === 'payload-folders' ? 'browse-by-folder' : 'collections/'}${node.relationTo}/${node.id}
                `
              }}
              style={{
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                fontFamily: 'monospace',
                gap: 4,
                padding: 0,
                userSelect: 'none'
              }}
              type="button"
            >
              {isFolder ? (
                <span style={{ display: 'inline-block', textAlign: 'center', width: 16 }}>
                  {isOpen ? '▾' : '▸'}
                </span>
              ) : (
                <span style={{ display: 'inline-block', width: 16 }} />
              )}
              <span>{node.name}</span>
            </button>
            {isFolder && isOpen && node.children && (
              <div>{renderNodes(node.children, depth + 1)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return <div>{renderNodes(data)}</div>;
};

export default TreeViewClient;
