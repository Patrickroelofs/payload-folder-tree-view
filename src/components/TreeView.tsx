import type { ServerComponentProps } from "payload"

import TreeViewClient from "./TreeViewClient.js"



interface TreeDataItem {
  children?: TreeDataItem[]
  id: string
  name: string
  onClick?: () => void
  relationTo: string
}

// Types reflecting the API example structure (relaxed where uncertain)
type FolderDoc = {
  [key: string]: unknown
  createdAt: string
  documentsAndFolders?: {
    docs: Array<{
      _id: string
      relationTo: string
      value: unknown
    }>
    hasNextPage: boolean
  }
  folder: FolderDoc | null | string
  folderType?: string[]
  id: string
  name?: string
  updatedAt: string
}

export function buildFolderTree(allDocs: FolderDoc[]): TreeDataItem[] {
  if (!Array.isArray(allDocs)) { return [] }

  const folderById = new Map<string, FolderDoc>()
  allDocs.forEach(doc => {
    if (doc?.id) { folderById.set(doc.id, doc) }
  })

  const resolveFolder = (value: unknown): FolderDoc | undefined => {
    if (!value) { return undefined }
    if (typeof value === 'string') { return folderById.get(value) }
    if (typeof value === 'object' && value !== null && 'id' in value) {
      const v = value as FolderDoc
      if (!folderById.has(v.id)) { folderById.set(v.id, v) }
      return v
    }
    return undefined
  }

  const rootFolders = allDocs.filter(doc => !doc.folder)
  const building = new Set<string>()

  const buildLeafNode = (ref: {
    _id: string
    relationTo: string
    value: unknown
  }): TreeDataItem => {
    const value = ref.value
    let id: string
    let name: string

    if (typeof value === 'string') {
      id = value
      name = `${ref.relationTo}:${id}`
    } else if (value && typeof value === 'object') {
      const obj = value as { id?: string; name?: string }
      id = obj.id ?? ref._id
      name = obj.name ?? `${ref.relationTo}:${id}`
    } else {
      id = ref._id
      name = `${ref.relationTo}:${id}`
    }

    return { id, name, relationTo: ref.relationTo }
  }

  const buildNode = (folder: FolderDoc): TreeDataItem => {
    if (building.has(folder.id)) {
      return { id: folder.id, name: folder.name ?? '(circular)', children: [], relationTo: 'payload-folders' }
    }

    building.add(folder.id)
    try {
      const children: TreeDataItem[] = []

      for (const ref of folder.documentsAndFolders?.docs ?? []) {
        if (ref.relationTo === 'payload-folders') {
          const childFolder = resolveFolder(ref.value)
          if (childFolder) { children.push(buildNode(childFolder)) }
        } else {
          children.push(buildLeafNode(ref))
        }
      }

      return {
        id: folder.id,
        name: folder.name ?? folder.id,
        children,
        relationTo: 'payload-folders'
      }
    } finally {
      building.delete(folder.id)
    }
  }

  return rootFolders.map(buildNode)
}

export const TreeViewComponent = async (props: ServerComponentProps) => {
  const folders = await props.payload.find({
    collection: 'payload-folders'
  })
  const treeData = buildFolderTree(folders.docs as FolderDoc[])

  console.log(folders)

  return <TreeViewClient data={treeData} />
}

export type { TreeDataItem }
