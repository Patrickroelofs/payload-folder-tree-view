import { z } from "zod";

const FolderSchema = z.object({
  id: z.string(),
  data: z.object({
    hasChildren: z.boolean().optional(),
    isFolder: z.boolean().optional(),
    relationTo: z.string(),
    title: z.string(),
  }),
})

const FoldersSchema = z.array(FolderSchema);

type Folder = z.infer<typeof FolderSchema>;

const fetchFolders = async (id: string): Promise<Folder[]> => {
  try {
    const res = await fetch(`/api/${id}/folder-tree-view/folder`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();
    return FoldersSchema.parse(data);
  } catch (err) {
    throw new Error(`Error fetching folders: ${(err as Error).message}`);
  }
}

const fetchItem = async (itemId: string): Promise<Folder> => {
  try {
    const res = await fetch(`/api/${itemId}/folder-tree-view/item`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();
    return FolderSchema.parse(data);
  } catch (err) {
    throw new Error(`Error fetching item: ${(err as Error).message}`);
  }
}

export { fetchFolders, fetchItem }