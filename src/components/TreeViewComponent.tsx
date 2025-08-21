"use client";

import {
  asyncDataLoaderFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Link } from "@payloadcms/ui";
import cn from "classnames";

import "./styles.scss";

import React from 'react';

import { fetchFolders, fetchItem } from "../../src/lib/fetchFilesFromEndpoint.js";

interface TreeViewClientProps {

}

type TreeData = {
  createdAt: string;
  data?: TreeData[];
  id: string;
  title: string;
  updatedAt: string;
}

const TreeViewComponent = () => {
  const tree = useTree<TreeData>({
    dataLoader: {
      getChildrenWithData: async (id) => {
        if (id === "root") {
          const folders = await fetchFolders<TreeData[]>(id);

          return folders
            ? folders.map((folder) => ({
              id: folder.id,
              data: folder,
            }))
            : [];
        }

        const items = await fetchFolders<TreeData[]>(id);

        return items ? items.map((item) => ({
          id: item.id,
          data: item,
        })) : [];
      },
      getItem: async (itemId) => {
        const item = await fetchItem<TreeData>(itemId);

        return {
          id: itemId,
          createdAt: item.createdAt,
          title: item.title,
          updatedAt: item.updatedAt,
        }
      },
    },
    features: [asyncDataLoaderFeature, selectionFeature],
    getItemName: (item) => {
      if (!item.getItemData()) {
        return "null"
      }

      return item.getItemData().title;
    },
    indent: 20,
    isItemFolder: (item) => Array.isArray(item.getItemData().data),
    rootItemId: "root",
  });

  const openClickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  }

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
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
            <div className="treeitem-content">
              <Link href="#" onClick={openClickHandler}>{item.getItemName()}</Link>
              {item.isLoading() && <span className="loading-indicator">Loading...</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TreeViewComponent;