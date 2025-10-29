"use client";

import type {
  ItemInstance
} from "@headless-tree/core";
import type { TreeData } from "src/types.js";

import {
  asyncDataLoaderFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { ChevronIcon, DocumentIcon, FolderIcon, Link, NavGroup } from "@payloadcms/ui";

import "./styles.scss";

import cn from "classnames";
import React, { useState } from 'react';

import { LoadingIcon } from "../../src/icons/Loading/index.js";
import { fetchFolders } from "../../src/lib/fetchFilesFromEndpoint.js";

interface TreeViewClientProps {
  defaultOpen: boolean;
  foldersSlug: string;
}

const TreeViewComponent = ({ defaultOpen, foldersSlug }: TreeViewClientProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tree = useTree<TreeData>({
    dataLoader: {
      getChildrenWithData: async (id) => {
        const folders = await fetchFolders(id);

        setIsLoading(false);
        return folders;
      },
      getItem: () => {
        // TODO: required to implement but its never used?

        return {
          relationTo: 'unknown',
          title: 'Unknown',
        };
      },
    },
    features: [asyncDataLoaderFeature, selectionFeature],
    getItemName(item) {
      return item.getItemData().title || "Unknown";
    },
    isItemFolder(item) {
      return item.getItemData().isFolder || false;
    },
    rootItemId: "root",
  });

  const openClickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  }

  const mapUrl = (item: ItemInstance<TreeData>) => {
    const id = item.getId();
    const { relationTo } = item.getItemData();
    if (!item || !id || !relationTo) { return "#"; }

    const isFolder = relationTo === foldersSlug;
    const basePath = isFolder ? "browse-by-folder" : relationTo;
    const prefix = isFolder ? "" : "collections/";

    return `/admin/${prefix}${basePath}/${id}`;
  }

  return (
    <NavGroup isOpen={defaultOpen} label="Folders">
      <div {...tree.getContainerProps()} className="tree">
        {isLoading && (
          <div className="loading-indicator">
            <LoadingIcon />
          </div>
        )}

        {!isLoading && (
          <div className="tree-content animate-in">
            {tree.getItems().map((item) => {
              return (
                <button
                  type="button"
                  {...item.getProps()}
                  key={item.getId()}
                  style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
                >
                  <div
                    className={cn("treeitem", {
                      expanded: item.isExpanded(),
                      focused: item.isFocused(),
                      folder: item.isFolder(),
                      selected: item.isSelected(),
                    })}
                  >
                    {item.isFolder() && <ChevronIcon className="chevron-icon" />}
                    <div className="treeitem-content">
                      <div className="treeitem-label">
                        {item.isFolder() ? <FolderIcon /> : <DocumentIcon />}
                        <Link href={mapUrl(item)} onClick={openClickHandler}>{item.getItemData().title}</Link>
                      </div>
                      {item.isLoading() && <LoadingIcon />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </NavGroup>
  );
};

export default TreeViewComponent;