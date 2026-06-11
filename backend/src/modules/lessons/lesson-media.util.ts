/** YouTube / Vimeo URLs are played directly without presigned S3 access. */
export function isExternalVideoUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')
  );
}

/** Extract S3 object key from s3Key-only or legacy public S3 URL. */
export function extractS3Key(contentUrl: string): string | null {
  if (contentUrl.startsWith('lessons/')) {
    return contentUrl;
  }
  const match = contentUrl.match(/\.amazonaws\.com\/(lessons\/[^?]+)/);
  return match?.[1] ?? null;
}

export function isS3LessonContent(contentUrl: string): boolean {
  return extractS3Key(contentUrl) !== null;
}
