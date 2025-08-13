import type { JsonObject, TypeWithID } from "payload";

export type Document = {
  id: string;
}

export type Folder = {
  id: string;
  title?: string;
}

export type FlatTree = {
  items: Record<string, {
    documents?: Document[];
    folders?: Folder[]
  }>;
  rootIds: string[];
};

interface FolderEntry {
  _id?: string;
  documentsAndFolders?: { docs?: FolderEntry[] };
  id?: string;
  name?: string;
  relationTo?: string;
  value?: unknown;
}

const getId = (val: unknown): string => {
  if (!val) { return ''; }
  if (typeof val === 'string') { return val; }
  const obj = val as Record<string, unknown>;
  const valueObj = (typeof obj.value === 'object' && obj.value !== null)
    ? (obj.value as Record<string, unknown>)
    : undefined;
  if (typeof obj.id === 'string') { return obj.id; }
  if (typeof obj._id === 'string') { return obj._id; }
  if (valueObj && typeof valueObj.id === 'string') { return valueObj.id; }
  if (typeof obj.value === 'string') { return obj.value; }
  return '';
};

export function buildSimpleFolderTree(docs: (JsonObject | TypeWithID)[]): FlatTree {
  const items: FlatTree["items"] = {};
  const rootIdSet = new Set<string>();
  const childFolderSet = new Set<string>();
  const visiting = new Set<string>();
  const processed = new Set<string>();

  const ensureNode = (id: string) => {
    if (!items[id]) { items[id] = {}; }
  };

  const processNode = (node: unknown): string => {
    const anyNode = node as FolderEntry;
    const id = getId(anyNode);
    if (!id) { return ''; }

    if (visiting.has(id)) { return id; }

    ensureNode(id);

    if (processed.has(id)) { return id; }
    visiting.add(id);

    const entries = anyNode?.documentsAndFolders?.docs ?? [];
    for (const entry of entries) {
      if (!entry) { continue; }
      if (entry.relationTo === 'payload-folders') {
        const folderId = processNode(entry.value ?? entry);
        if (folderId) {
          childFolderSet.add(folderId);
          const foldersArr = (items[id].folders ??= []);
          if (!foldersArr.some(f => f.id === folderId)) {
            foldersArr.push({ id: folderId, title: entry.name });
          }
        }
      } else {
        const docId = getId(entry.value ?? entry);
        if (docId) {
          const docsArr = (items[id].documents ??= []);
          if (!docsArr.some(d => d.id === docId)) {
            docsArr.push({ id: docId });
          }
        }
      }
    }

    visiting.delete(id);
    processed.add(id);
    return id;
  };

  for (const doc of docs) {
    const rootId = processNode(doc);
    if (rootId) { rootIdSet.add(rootId); }
  }

  const rootIds = Array.from(rootIdSet).filter(id => !childFolderSet.has(id));

  return { items, rootIds };
}