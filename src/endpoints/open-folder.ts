import type { Config } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";
import type { Endpoints } from "src/types.js";

import { addDataAndFileToRequest } from "payload";

import { getIdFromUrl } from "../../src/lib/getIdFromUrl.js";


const endpoints: (config: Config, pluginConfig: PayloadFolderTreeViewConfig) => Endpoints = (config, pluginConfig) => ({
  files: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);

      const folderId = getIdFromUrl(req.url ?? "");

      const folders = await req.payload.find({
        collection: config.folders ? config.folders.slug ? config.folders.slug : 'payload-folders' : 'payload-folders',
        pagination: false,
        where: {
          id: {
            equals: folderId
          },
        },
      })

      const folder = folders.docs[0];

      return Response.json({
        id: folder.id,
        createdAt: folder.createdAt,
        title: folder.name,
        updatedAt: folder.updatedAt,
      });
    },
    method: 'get',
    path: '/:id/folder-tree-view/item',
  },
  openFolder: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);

      const folderId = getIdFromUrl(req.url ?? "");

      const folders = await req.payload.find({
        collection: config.folders ? config.folders.slug ? config.folders.slug : 'payload-folders' : 'payload-folders',
        pagination: false,
        where: folderId === "root"
          ? { folder: { equals: false } }
          : { id: { equals: folderId } },
      })

      if (folderId === "root") {
        return Response.json(folders.docs.map((folder) => {
          return {
            id: folder.id,
            createdAt: folder.createdAt,
            data: folder.documentsAndFolders.docs.map((doc) => {
              return {
                id: folder.id,
                createdAt: folder.createdAt,
                title: doc.value.title,
                updatedAt: folder.updatedAt,
              };
            }),
            title: folder.name,
            updatedAt: folder.updatedAt
          };
        }));
      }


      const folder = folders.docs[0];

      return Response.json(
        folder.documentsAndFolders.docs
          .filter((doc) => doc.relationTo !== (config.folders ? config.folders.slug : 'payload-folders'))
          .map((doc) => {
            return {
              id: doc._id,
              createdAt: doc.createdAt,
              title: doc.value.title,
              updatedAt: doc.updatedAt,
            };
          })
      );

    },
    method: 'get',
    path: '/:id/folder-tree-view/folder',
  }
}) satisfies Endpoints

export { endpoints }