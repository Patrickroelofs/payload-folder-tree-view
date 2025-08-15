function getIdFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);

    const idSegment = segments[1];

    return idSegment;
  } catch {
    return null;
  }
}

export { getIdFromUrl }