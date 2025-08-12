import type { Config } from 'payload'

export type PayloadFolderTreeViewCollections = {
  slug: string;
  useAsTitle: string;
}

export type PayloadFolderTreeViewConfig = {
  collections?: PayloadFolderTreeViewCollections[]
  disabled?: boolean
}

export const PayloadFolderTreeView =
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
                serverProps: {
                  collections: pluginOptions.collections,
                }
              }
            ]
          }
        },
      };
    }
