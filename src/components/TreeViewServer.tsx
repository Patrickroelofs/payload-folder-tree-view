
import type { ServerComponentProps } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";

import TreeViewComponent from "./TreeViewComponent.js";

export const TreeViewServer = (props: PayloadFolderTreeViewConfig & ServerComponentProps) => {
  const foldersSlug = props.payload.config.folders ? props.payload.config.folders.slug ? props.payload.config.folders.slug : 'payload-folders' : 'payload-folders';

  return (
    <TreeViewComponent
      foldersSlug={foldersSlug} />
  );
}