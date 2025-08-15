import type { JsonObject, ServerComponentProps, TypeWithID } from "payload"
import type { PayloadFolderTreeViewConfig } from "src/index.js"

import type { FolderEntry } from "../lib/buildFolderTree.js";

import { buildSimpleFolderTree } from "../lib/buildFolderTree.js"
import TreeViewComponent from "./TreeViewComponent.js";

export const TreeViewServer = async (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders',
    limit: 0,
  });

  const folderEntries: FolderEntry[] = folders.docs.map((doc: JsonObject & TypeWithID) => ({
    ...doc,
    _id: doc._id !== undefined ? String(doc._id) : undefined,
    id: doc.id !== undefined ? String(doc.id) : undefined,
    folderType: doc.folderType,
    value: doc.value,
  }));

  const treeData = buildSimpleFolderTree(folderEntries);

  return <TreeViewComponent
    data={treeData}
    pluginConfig={{
      showFiles: props.showFiles
    }}
  />
}