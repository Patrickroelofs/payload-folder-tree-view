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
import { fetchFolders } from "../../src/lib/fetchFilesFromEndpoint.js";

interface TreeViewClientProps {
  foldersSlug: string;
}

const TreeViewComponent = ({ foldersSlug }: TreeViewClientProps) => {
  const tree = useTree<TreeData>({
    dataLoader: {
      getChildrenWithData: async (id) => {
        const folders = await fetchFolders(id);

        return folders;
      },
      getItem: (itemId) => {
        return {
          relationTo: "post",
          title: "Pizza",
        }
      },
    },
    features: [asyncDataLoaderFeature, selectionFeature],
    getItemName(item) {
      return item.getItemData().title || "Unknown";
    },
    isItemFolder(item) {
      return item.getItemData().relationTo === foldersSlug;
    },
    rootItemId: "root",
  });

  const openClickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  }

  // const mapUrl = (item) => {
  //   if (!item || !item.id || !item.relationTo) { return "#"; }

  //   const isFolder = item.relationTo === foldersSlug;
  //   const basePath = isFolder ? "browse-by-folder" : item.relationTo;
  //   const prefix = isFolder ? "" : "collections/";

  //   return `/admin/${prefix}${basePath}/${item.id}`;
  // }

  return (
    <NavGroup isOpen={false} label="Folders">
      <div {...tree.getContainerProps()} className="tree">
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
                <ChevronIcon className="chevron-icon" />
                <div className="treeitem-content">
                  <Link href={"#"} onClick={openClickHandler}>{item.getItemData().title}</Link>
                  {item.isLoading() && <LoadingIcon />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </NavGroup>
  );
};

export default TreeViewComponent;