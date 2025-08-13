import type { ServerComponentProps } from "payload"
import type { PayloadFolderTreeViewConfig } from "src/index.js"

import type { Folder } from "../lib/buildFolderTree.js";

import { buildFolderTree } from "../lib/buildFolderTree.js"
import TreeViewComponent from "./TreeViewComponent.js";

export const TreeViewServer = async (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders',
  })

  const treeData = buildFolderTree({
    allDocs: folders.docs as Folder[],
  })

  return <TreeViewComponent data={treeData} />
}