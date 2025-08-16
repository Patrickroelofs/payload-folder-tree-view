import type { Config } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";
import type { Endpoints } from "src/types.js";

import { addDataAndFileToRequest } from "payload";

import type { File } from "../types.js"

import { getIdFromUrl } from "../../src/lib/getIdFromUrl.js";

const endpoints: (config: Config, pluginConfig: PayloadFolderTreeViewConfig) => Endpoints = (config, pluginConfig) => ({
  openFolder: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);

      const folderSlug = config.folders ? String(config.folders.slug) : 'payload-folders';

      const folderId = getIdFromUrl(req.url ?? "");

      if (!folderId) {
        return Response.json({ error: "Invalid folder ID" }, { status: 400 });
      }

      const files = await req.payload.findByID({
        id: folderId,
        collection: folderSlug,
      })

      if (!files) {
        return Response.json({ error: "Folder not found" }, { status: 404 });
      }


      const mappedFilesFromFolders = [];

      for (const file of files.documentsAndFolders.docs) {
        if (file.relationTo === folderSlug) {
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

      const mappedFilesFromIds: File[] = [];

      for (const file of mappedFilesFromFolders) {
        const document = await req.payload.findByID({
          id: file.id,
          collection: file.relationTo,
        })

        if (!document) {
          continue;
        }

        const useAsTitle = config?.collections?.find(
          (col) => col.slug === file.relationTo
        )?.admin?.useAsTitle;

        const { folder: _folder, ...rest } = document;

        mappedFilesFromIds.push({
          id: String(document.id),
          relationTo: file.relationTo,
          title: useAsTitle ? document[useAsTitle] : document.id,
        });
      }


      return Response.json(mappedFilesFromIds)
    },
    method: 'get',
    path: '/:id/folder-tree-view/open-folder',
  }
}) satisfies Endpoints

export { endpoints }