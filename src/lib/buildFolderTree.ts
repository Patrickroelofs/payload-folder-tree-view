import type { SanitizedConfig, ServerComponentProps } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";

export type Folder = {
  id: string;
}

export type FlatTree = {
  items: Record<string, {
    fileCount: number;
    folderCount: number;
    folders?: Folder[];
    title?: string;
  }>;
  rootIds: string[];
};

export type FolderEntry = {
  _id?: string;
  documentsAndFolders?: { docs?: FolderEntry[] };
  folderType: string[];
  id?: string;
  name?: string;
  relationTo?: string;
  value: {
    [key: string]: unknown;
    _id: string;
    id: string;
    name: string;
  };
};

const getId = (val: FolderEntry | FolderEntry['value']): string => {
  return val.id || val._id || '';
};

export function buildSimpleFolderTree(docs: FolderEntry[], config: PayloadFolderTreeViewConfig & ServerComponentProps): FlatTree {
  const folderSlug = config.payload.config.folders ? String(config.payload.config.folders.slug) : 'payload-folders';
  const items: FlatTree["items"] = {};
  const nonRootIds = new Set<string>();
  const visiting = new Set<string>();
  const processed = new Set<string>();
  const cycles: string[] = [];

  const ensureNode = (id: string, src?: FolderEntry) => {
    const node = (items[id] ??= {
      fileCount: 0,
      folderCount: 0,
    });

    if (!node.title && src) {
      node.title = src.name || src.value?.name;
    }
    if (!node.folderCount && src) {
      node.folderCount = src.documentsAndFolders?.docs?.filter((doc) => doc.relationTo === folderSlug).length || 0;
    }
    if (!node.fileCount && src && config.showFiles) {
      node.fileCount = src.documentsAndFolders?.docs?.filter((doc) => doc.relationTo !== folderSlug).length || 0;
    }

    return node;
  };

  const processNode = (node: FolderEntry): string => {
    const id = getId(node);
    if (!id) {
      return '';
    }

    if (visiting.has(id)) {
      cycles.push(id);
      return id;
    }
    if (processed.has(id)) {
      return id;
    }

    ensureNode(id, node);
    visiting.add(id);

    const entries = Array.isArray(node.documentsAndFolders?.docs)
      ? node.documentsAndFolders.docs
      : [];

    for (const entry of entries) {
      if (!entry) { continue; }

      if (entry.relationTo === folderSlug) {
        const folderId = processNode(entry);
        if (folderId && folderId !== id) {
          nonRootIds.add(folderId);
          const parent = ensureNode(id);
          const foldersArr = (parent.folders ??= []);
          if (!foldersArr.some(f => f.id === folderId)) {
            foldersArr.push({ id: folderId });
          }
        }
      }
    }

    visiting.delete(id);
    processed.add(id);
    return id;
  };

  for (const rootCandidate of docs) {
    const rootId = processNode(rootCandidate);
    if (rootId) {
      ensureNode(rootId, rootCandidate);
    }
  }

  const rootIds = Object.keys(items).filter(id => !nonRootIds.has(id));

  return { items, rootIds };
}