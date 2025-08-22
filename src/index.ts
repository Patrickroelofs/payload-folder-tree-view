import { type Config } from 'payload'

import { endpoints } from './endpoints/index.js'

export type PayloadFolderTreeViewConfig = {
  /**
   * Whether the folder tree view plugin is enabled.
   * 
   * @default false
   */
  disabled?: boolean
  /**
   * Show files in the folder tree view.
   *
   * @default true
   * //TODO: Implement showFiles functionality
   */
  showFiles: boolean
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

      const pluginEndpoints = endpoints(config, pluginOptions);

      configEndpoints.push(
        pluginEndpoints.item,
        pluginEndpoints.folder,
      )

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
                  showFiles: pluginOptions.showFiles,
                }
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
