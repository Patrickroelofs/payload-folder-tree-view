
import type { ServerComponentProps } from "payload";

import TreeViewComponent from "./TreeViewComponent.js";

export const TreeViewServer = (props: ServerComponentProps) => {
  return <TreeViewComponent />;
}