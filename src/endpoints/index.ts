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

      const folders = await req.payload.find({
        collection,
        pagination: false,
        where: folderId === "root"
          ? { folder: { equals: false } }
          : { id: { equals: folderId } },
      });

      if (folderId === "root") {
        return Response.json(folders.docs.map((folder) => {
          return {
            id: folder.id,
            data: folder.documentsAndFolders.docs.map((doc) => {
              return {
                id: folder.id,
                title: doc.value.title,
              };
            }),
            title: folder.name,
          };
        }));
      }


      const folder = folders.docs[0];

      return Response.json(
        folder.documentsAndFolders.docs
          .map((doc) => {
            return {
              id: doc._id,
              data: doc.relationTo === collection ? doc.value.documentsAndFolders.docs.map((doc) => {
                return {
                  id: doc._id,
                  title: doc.value.title,
                };
              }) : undefined,
              title: doc.relationTo === collection ? doc.value.name : doc.value.title,
            };
          })
      );

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
        title: folder.name,
      });
    },
    method: 'get',
    path: '/:id/folder-tree-view/item',
  },
  root: {
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const collection = config.folders ? config.folders.slug ? config.folders.slug : 'payload-folders' : 'payload-folders';

      const folders = await req.payload.find({
        collection,
        pagination: false,
        where: {
          folder: {
            equals: false,
          }
        }
      });

      return Response.json(folders.docs.map((folder) => {
        return {
          id: folder.id,
          data: folder.documentsAndFolders.docs.map((doc) => {
            return {
              id: folder.id,
              title: doc.value.title,
            };
          }),
          title: folder.name,
        };
      }));
    },
    method: 'get',
    path: '/folder-tree-view/root',
  }
}) satisfies Endpoints

export { endpoints }