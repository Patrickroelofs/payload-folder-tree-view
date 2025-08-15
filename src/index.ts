import type { Config } from 'payload'

export type PayloadFolderTreeViewConfig = {
  /**
   * Whether the folder tree view plugin is enabled.
   * 
   * @default false
   */
  disabled?: boolean
}

export const payloadFolderTreeView =
  (pluginOptions: PayloadFolderTreeViewConfig) =>
    (config: Config): Config => {
      if (pluginOptions.disabled) {
        return config
      }

      return {
        ...config,
        admin: {
          ...config.admin,
          components: {
            ...config.admin?.components,
            beforeNavLinks: [
              {
                path: 'payload-folder-tree-view/rsc#TreeViewServer',
              }
            ]
          }
        },
      };
    }
