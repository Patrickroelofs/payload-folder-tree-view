import type { PayloadFolderTreeViewConfig } from "src/index.js";
import type { Endpoints } from "src/types.js";

import { addDataAndFileToRequest } from "payload";

import { getIdFromUrl } from "../../src/lib/getIdFromUrl.js";

const endpoints: (pluginConfig: PayloadFolderTreeViewConfig) => Endpoints = (pluginConfig) => ({
  openFolder: {
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
          relationTo: file.relationTo,
        });
      }


      return Response.json(mappedFilesFromIds)
    },
    method: 'get',
    path: '/:id/folder-tree-view/open-folder',
  }
}) satisfies Endpoints

export { endpoints }