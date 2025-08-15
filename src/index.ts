import { addDataAndFileToRequest, type Config } from 'payload'

import { getIdFromUrl } from './lib/getIdFromUrl.js'

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
        endpoints: [
          ...(config.endpoints ?? []),
          {
            handler: async (req) => {
              await addDataAndFileToRequest(req);

              const folderId = getIdFromUrl(req.url ?? "");

              if (!folderId) {
                return Response.json({ error: "Invalid folder ID" }, { status: 400 });
              }

              const files = await req.payload.findByID({
                id: folderId,
                collection: 'payload-folders',
              })

              if (!files) {
                return Response.json({ error: "Folder not found" }, { status: 404 });
              }


              const mappedFilesFromFolders = [];

              for (const file of files.documentsAndFolders.docs) {
                if (file.relationTo === "payload-folders") {
                  continue;
                }
                const { relationTo } = file;
                const {
                  createdAt: _createdAt,
                  documentsAndFolders: _documentsAndFolders,
                  folder: _folder,
                  updatedAt: _updatedAt,
                  ...rest
                } = file.value;

                mappedFilesFromFolders.push({
                  ...rest,
                  relationTo,
                });
              }

              const mappedFilesFromIds = [];

              for (const file of mappedFilesFromFolders) {
                const document = await req.payload.findByID({
                  id: file.id,
                  collection: file.relationTo,
                })

                if (!document) {
                  continue;
                }

                const { folder: _folder, ...rest } = document;

                mappedFilesFromIds.push({
                  ...rest,
                });
              }


              return Response.json(mappedFilesFromIds)
            },
            method: 'get',
            path: '/:id/folder-tree-view/open-folder',
          }
        ],
      };
    }
