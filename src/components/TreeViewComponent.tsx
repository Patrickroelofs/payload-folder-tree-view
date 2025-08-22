"use client";

import type { TreeData } from "src/types.js";

import {
  asyncDataLoaderFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { ChevronIcon, Link, NavGroup } from "@payloadcms/ui";

import "./styles.scss";

import cn from "classnames";
import React from 'react';

import { LoadingIcon } from "../../src/icons/Loading/index.js";
import { fetchFolders, fetchItem, fetchRootFolders } from "../../src/lib/fetchFilesFromEndpoint.js";

interface TreeViewClientProps { }

const TreeViewComponent = () => {
  const tree = useTree<TreeData>({
    dataLoader: {
      getChildrenWithData: async (id) => {
        if (id === "root") {
          const folders = await fetchRootFolders<TreeData[]>();

          return folders
            ? folders.map((folder) => ({
              id: folder.id,
              data: folder,
              relationTo: folder.relationTo,
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
          relationTo: item.relationTo,
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

  const mapUrl = (item: TreeData) => {
    if (!item || !item.id || !item.relationTo) { return "#"; }

    const isFolder = item.relationTo === "payload-folders";
    const basePath = isFolder ? "browse-by-folder" : item.relationTo;
    const prefix = isFolder ? "" : "collections/";

    return `/admin/${prefix}${basePath}/${item.id}`;
  }

  return (
    <NavGroup isOpen={false} label="Folders">
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
              <ChevronIcon className="chevron-icon" />
              <div className="treeitem-content">
                <Link href={mapUrl(item.getItemData())} onClick={openClickHandler}>{item.getItemName()}</Link>
                {item.isLoading() && <LoadingIcon />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </NavGroup>
  );
};

export default TreeViewComponent;