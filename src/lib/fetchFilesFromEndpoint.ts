const fetchRootFolders = async <T>(): Promise<T> => {
  try {
    const res = await fetch(`/api/folder-tree-view/root`, {
      method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })

    return res;
  } catch (err) {
    throw new Error('Error fetching root folders');
  }
}

const fetchFolders = async <T>(id: string): Promise<T> => {
  try {
    const res = await fetch(`/api/${id}/folder-tree-view/folder`, {
      method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })

    return res;
  } catch (err) {
    throw new Error('Error fetching folders');
  }
}

const fetchItem = async <T>(itemId: string): Promise<T> => {
  try {
    const res = await fetch(`/api/${itemId}/folder-tree-view/item`, {
      method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })

    return res as T;
  } catch (err) {
    console.error('Error fetching item:', err)
    throw new Error('Error fetching item');
  }
}

export { fetchFolders, fetchItem, fetchRootFolders }