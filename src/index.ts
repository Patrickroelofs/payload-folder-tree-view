import { type Config } from 'payload'

import { endpoints } from './endpoints/open-folder.js'

export type PayloadFolderTreeViewConfig = {
  /**
   * Whether the folder tree view plugin is enabled.
   * 
   * @default false
   */
  disabled?: boolean
  /**
   * Show files in the folder tree view.
   * This will enable the `/open-folder` endpoint to fetch files from folders.
   * Can cause performance issues with large folder structures.
   *
   * @default true
   */
  showFiles?: boolean
}

export const payloadFolderTreeView =
  (pluginOptions: PayloadFolderTreeViewConfig) =>
    (config: Config): Config => {
      if (pluginOptions.disabled) {
        return config
      }

      const configEndpoints = [
        ...(config.endpoints ?? []),
      ]

      if (pluginOptions.showFiles) {
        const pluginEndpoints = endpoints(pluginOptions);

        configEndpoints.push(
          pluginEndpoints.openFolder,
        )
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
        endpoints: [
          ...(config.endpoints ?? []),
          ...configEndpoints,
        ],
      };
    }
