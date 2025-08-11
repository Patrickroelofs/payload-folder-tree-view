import type { Config } from 'payload'

export type PayloadFolderTreeViewConfig = {
  disabled?: boolean
}

export const PayloadFolderTreeView =
  (pluginOptions: PayloadFolderTreeViewConfig) =>
    (config: Config): Config => {
      const { admin } = config;

      if (!config.collections) {
        config.collections = []
      }

      if (pluginOptions.disabled) {
        return config
      }

      return {
        ...config,
        admin: {
          ...admin,
          components: {
            ...admin?.components,
            beforeNavLinks: [
              {
                path: 'payload-folder-tree-view/client#TreeViewComponent'
              }
            ]
          }
        },
      };
    }
