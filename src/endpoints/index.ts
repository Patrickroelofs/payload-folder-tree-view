import type { Config } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";
import type { Endpoints } from "src/types.js";

import { addDataAndFileToRequest } from "payload";

import { getIdFromUrl } from "../lib/getIdFromUrl.js";


const endpoints: (config: Config, pluginConfig: PayloadFolderTreeViewConfig) => Endpoints = (config, pluginConfig) => ({
  folder: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const collection = config.folders ? config.folders.slug ? config.folders.slug : 'payload-folders' : 'payload-folders';

      const folderId = getIdFromUrl(req.url ?? "");
      const isRoot = folderId === "root";

      const folders = await req.payload.find({
        collection,
        where: {
          ...(isRoot ? {
            folder: {
              equals: true,
            }
          } : {
            id: {
              equals: folderId
            }
          })
        }
      })

      let data;

      if (isRoot) {
        data = folders.docs.map((folder) => {
          return {
            id: folder.id,
            data: {
              relationTo: folder.documentsAndFolders ? collection : folder.relationTo,
              title: folder.documentsAndFolders ? folder.name : "",
            },
          }
        })
      } else {
        data = folders.docs.flatMap((folder) => {
          return folder.documentsAndFolders.docs.map((doc) => {
            if (doc.relationTo === collection) {
              return {
                id: doc.value.id,
                data: {
                  relationTo: doc.relationTo,
                  title: doc.value.name,
                }
              }
            }

            return {
              id: doc.value.id,
              data: {
                relationTo: doc.relationTo,
                title: doc.value.title,
              }
            }
          })
        })
      }

      return Response.json(data)
    },
    method: 'get',
    path: '/:id/folder-tree-view/folder',
  },
  item: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const collection = config.folders ? config.folders.slug ? config.folders.slug : 'payload-folders' : 'payload-folders';

      const folderId = getIdFromUrl(req.url ?? "");

      const folders = await req.payload.find({
        collection,
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
        relationTo: folder.relationTo,
        title: folder.name,
      });
    },
    method: 'get',
    path: '/:id/folder-tree-view/item',
  },
}) satisfies Endpoints

export { endpoints }