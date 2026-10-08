const SAVED_POSTS_KEY = 'unilink:saved-posts';
export const SAVED_POSTS_CHANGED_EVENT = 'unilink:saved-posts-changed';

export function getSavedPosts() {
  const savedPosts = JSON.parse(window.localStorage.getItem(SAVED_POSTS_KEY) || '[]');
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

  window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updatedPosts));
  window.dispatchEvent(new Event(SAVED_POSTS_CHANGED_EVENT));
  return !isSaved;
}
