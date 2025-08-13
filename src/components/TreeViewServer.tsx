import type { ServerComponentProps } from "payload"
import type { PayloadFolderTreeViewConfig } from "src/index.js"

import type { Folder } from "../lib/buildFolderTree.js";

import { buildFolderTree } from "../lib/buildFolderTree.js"
import TreeViewClient from "./TreeViewClient.js";

export const TreeViewServer = async (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders',
  })

  const treeData = buildFolderTree({
    allDocs: folders.docs as Folder[],
  })

  return <TreeViewClient data={treeData} />
}