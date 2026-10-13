const SAVED_POSTS_KEY_PREFIX = 'unilink:saved-posts:';
export const SAVED_POSTS_CHANGED_EVENT = 'unilink:saved-posts-changed';

function getSavedPostsKey() {
  let userId = 'anonymous';
  try {
    const user = JSON.parse(window.localStorage.getItem('unilink.user') || 'null');
    if (user?.id) userId = user.id;
  } catch {
    // Usa a área isolada de anônimos quando os dados da sessão não puderem ser lidos.
  }
  return `${SAVED_POSTS_KEY_PREFIX}${userId}`;
}

export function getSavedPosts() {
  const savedPosts = JSON.parse(window.localStorage.getItem(getSavedPostsKey()) || '[]');
  if (!Array.isArray(savedPosts)) {
    throw new Error('A lista de publicações salvas está inválida.');
  }
  return savedPosts;
}

export function isPostSaved(postId) {
  return getSavedPosts().some((post) => post.id === postId);
}

export function toggleSavedPost(post) {
  const savedPosts = getSavedPosts();
  const isSaved = savedPosts.some((savedPost) => savedPost.id === post.id);
  const updatedPosts = isSaved
    ? savedPosts.filter((savedPost) => savedPost.id !== post.id)
    : [post, ...savedPosts];

  window.localStorage.setItem(getSavedPostsKey(), JSON.stringify(updatedPosts));
  window.dispatchEvent(new Event(SAVED_POSTS_CHANGED_EVENT));
  return !isSaved;
}

export function removeSavedPost(postId) {
  const savedPosts = getSavedPosts();
  const updatedPosts = savedPosts.filter((post) => post.id !== postId);
  if (updatedPosts.length === savedPosts.length) return;
  window.localStorage.setItem(getSavedPostsKey(), JSON.stringify(updatedPosts));
  window.dispatchEvent(new Event(SAVED_POSTS_CHANGED_EVENT));
}
