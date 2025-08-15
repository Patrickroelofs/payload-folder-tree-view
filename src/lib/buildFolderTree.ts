export type Document = {
  id: string;
}

export type Folder = {
  id: string;
}

export type FlatTree = {
  items: Record<string, {
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

export function buildSimpleFolderTree(docs: FolderEntry[]): FlatTree {
  const items: FlatTree["items"] = {};
  const nonRootIds = new Set<string>();
  const visiting = new Set<string>();
  const processed = new Set<string>();
  const cycles: string[] = [];

  const ensureNode = (id: string, src?: FolderEntry) => {
    const node = (items[id] ??= {});
    if (!node.title && src) {
      node.title = src.name || src.value?.name;
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

      if (entry.relationTo === 'payload-folders') {
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