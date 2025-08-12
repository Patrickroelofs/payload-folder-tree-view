import type { ServerComponentProps } from "payload"
import type { PayloadFolderTreeViewConfig } from "src/index.js"

import type { Folder } from "../lib/buildFolderTree.js";

import { buildFolderTree } from "../lib/buildFolderTree.js"
import TreeViewClient from "./TreeViewClient.js";

export const TreeViewServer = async (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders',
  })

  const treeData = await buildFolderTree({
    allDocs: folders.docs as Folder[],
    payload: props.payload,
    serverProps: {
      collections: props.collections || []
    }
  })

  return <TreeViewClient data={treeData} />
}