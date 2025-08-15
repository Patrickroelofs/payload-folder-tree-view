const fetchFilesFromEndpoint = async (folderId: string) => {
  try {
    const res = await fetch(`/api/${folderId}/folder-tree-view/open-folder`, {
      method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })

    return res;
  } catch (err) {
    console.error('Error fetching folder contents:', err)
  }
}

export { fetchFilesFromEndpoint }