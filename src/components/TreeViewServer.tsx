import type { ServerComponentProps } from "payload"
import type { PayloadFolderTreeViewConfig } from "src/index.js"

import { buildSimpleFolderTree } from "../lib/buildFolderTree.js"
import TreeViewComponent from "./TreeViewComponent.js";

export const TreeViewServer = async (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders',
  })

  const treeData = buildSimpleFolderTree(folders.docs);

  console.log(treeData)

  return <TreeViewComponent data={treeData} />
}