import type { BasePayload } from "payload";
import type { PayloadFolderTreeViewConfig } from "src/index.js";

export type DocType = {
  _id: string;
  createdAt: string;
  relationTo: string;
  title?: string;
  value: string;
}

export type Folder = {
  createdAt: string;
  documentsAndFolders: DocType[];
  folder: Folder[] | null;
  id: string;
  name: string;
  updatedAt: string;
};

export type TreeNode = {
  createdAt: string;
  documents: DocType[];
  folders: TreeNode[];
  id: string;
  name: string;
  updatedAt: string;
};

export async function buildFolderTree({ allDocs, payload, serverProps }: {
  allDocs: Folder[], payload: BasePayload, serverProps: PayloadFolderTreeViewConfig
}): Promise<TreeNode[]> {
  const byId = new Map<string, Folder>();
  for (const f of allDocs) { byId.set(f.id, f); }

  const getDocsArray = (df: any): DocType[] => {
    if (!df) { return []; }
    if (Array.isArray(df)) { return df as DocType[]; }
    if (typeof df === 'object' && Array.isArray(df.docs)) { return df.docs as DocType[]; }
    return [];
  };

  const getValueId = (val: any): null | string => {
    if (!val) { return null; }
    if (typeof val === 'string') { return val; }
    if (typeof val === 'object' && typeof val.id === 'string') { return val.id; }
    return null;
  };

  const getParentId = (folderField: any): null | string => {
    if (!folderField) { return null; }
    if (typeof folderField === 'string') { return folderField; }
    if (typeof folderField === 'object' && typeof folderField.id === 'string') { return folderField.id; }
    return null;
  };

  const nodes = new Map<string, TreeNode>();
  const childMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  const refMap = new Map<string, { collection: string; id: string }>();
  const makeKey = (collection: string, id: string) => `${collection}::${id}`;

  for (const f of allDocs) {
    const docs = getDocsArray(f.documentsAndFolders);

    for (const d of docs) {
      if (d.relationTo !== 'payload-folders') {
        const docId = getValueId(d.value);
        if (docId) {
          refMap.set(makeKey(d.relationTo, docId), { id: docId, collection: d.relationTo });
        }
      }
    }

    const documents = docs.filter(d => d.relationTo !== 'payload-folders');

    nodes.set(f.id, {
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      documents,
      folders: [],
      updatedAt: f.updatedAt
    });

    const childIds: string[] = [];
    for (const d of docs) {
      if (d.relationTo === 'payload-folders') {
        const id = getValueId(d.value);
        if (id) { childIds.push(id); }
      }
    }
    childMap.set(f.id, childIds);

    const parentId = getParentId(f.folder);
    if (parentId) { hasParent.add(f.id); }
  }

  // Fetch titles with caching
  const titleCache = new Map<string, string | undefined>();
  await Promise.all(
    Array.from(refMap.values()).map(async ({ id, collection }) => {
      const key = makeKey(collection, id);
      const useAsTitle = serverProps.collections?.find(c => c.slug === collection)?.useAsTitle;
      const doc = await payload.findByID({ id, collection, depth: 0 });

      const title = useAsTitle ? doc[useAsTitle] : undefined;
      titleCache.set(key, title);
    })
  );

  // Attach titles to documents in each node
  for (const node of nodes.values()) {
    node.documents = node.documents.map(d => {
      const docId = getValueId(d.value);
      const key = docId ? makeKey(d.relationTo, docId) : '';
      const title = docId ? titleCache.get(key) : undefined;
      return { ...d, title };
    });
  }

  let rootIds: string[] = [];
  if (hasParent.size) {
    rootIds = [...nodes.keys()].filter(id => !hasParent.has(id));
  } else {
    const referenced = new Set<string>();
    for (const ids of childMap.values()) { for (const id of ids) { referenced.add(id); } }
    rootIds = [...nodes.keys()].filter(id => !referenced.has(id));
  }

  const visited = new Set<string>();
  const build = (id: string): TreeNode => {
    if (visited.has(id)) { return nodes.get(id)!; }
    visited.add(id);
    const node = nodes.get(id)!;
    const kids = (childMap.get(id) || []).filter(k => nodes.has(k));
    node.folders = kids.map(build);
    return node;
  };

  return rootIds.filter(id => nodes.has(id)).map(build);
}