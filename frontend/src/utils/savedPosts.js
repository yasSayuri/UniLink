const SAVED_POSTS_KEY = 'unilink:saved-posts';
export const SAVED_POSTS_CHANGED_EVENT = 'unilink:saved-posts-changed';

export function getSavedPosts() {
  try {
    const savedPosts = JSON.parse(window.localStorage.getItem(SAVED_POSTS_KEY) || '[]');
    return Array.isArray(savedPosts) ? savedPosts : [];
  } catch {
    return [];
  }
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

  try {
    window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updatedPosts));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(SAVED_POSTS_CHANGED_EVENT));
  return !isSaved;
}