const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const CONNECTIONS_CHANGED_EVENT = 'unilink:connections-changed';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('unilink.token');
  const isPublicEndpoint = ['/api/v1/auth/', '/api/v1/catalog/', '/api/v1/health/']
    .some((prefix) => path.startsWith(prefix));
  if (!token && !isPublicEndpoint) {
    throw new Error('Sua sessão não está ativa. Entre novamente para publicar.');
  }
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token && !isPublicEndpoint ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar ao backend. Verifique se ele está em execução.', { cause: error });
    }
    throw error;
  }
  const responseBody = response.status === 204 ? '' : await response.text();
  let result = null;
  if (responseBody) {
    try {
      result = JSON.parse(responseBody);
    } catch {
      if (response.ok) {
        throw new Error('A API retornou uma resposta inválida.');
      }
    }
  }

  if (!response.ok) {
    const message = result?.message
      || (response.status === 404
        ? 'A rota da API não foi encontrada. Reinicie o backend para carregar os endpoints atuais.'
        : response.status === 401
          ? 'Sua sessão expirou. Entre novamente na aplicação.'
          : response.status === 403
            ? 'O backend em execução recusou sua sessão (403). Reinicie o backend atualizado e entre novamente.'
            : `O backend retornou o erro ${response.status}${response.statusText ? ` (${response.statusText})` : ''}.`);
    throw new Error(message);
  }

  if (response.status !== 204 && result === null) {
    throw new Error('A API retornou uma resposta vazia.');
  }
  return result;
}

async function authenticate(path, credentials) {
  const result = await apiRequest(`/api/v1/auth/${path}`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  localStorage.setItem('unilink.token', result.token);
  localStorage.setItem('unilink.user', JSON.stringify(result.user));
  return result;
}

export function register(credentials) {
  return authenticate('register', credentials);
}

export function login(credentials) {
  return authenticate('login', credentials);
}

export function getCurrentUser() {
  return apiRequest('/api/v1/users/me');
}

export function getUserProfile(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}`);
}

export function getUserPosts(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/posts`);
}

export function getUserFollowing(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/following`);
}

export function getUserFollowers(userId) {
  return apiRequest(`/api/v1/users/${encodeURIComponent(userId)}/followers`);
}

export function getFollowing() {
  return apiRequest('/api/v1/users/me/following');
}

export function getFollowers() {
  return apiRequest('/api/v1/users/me/followers');
}

export function followUser(userId) {
  return apiRequest(`/api/v1/users/me/following/${encodeURIComponent(userId)}`, { method: 'POST' })
    .then((result) => {
      window.dispatchEvent(new Event(CONNECTIONS_CHANGED_EVENT));
      return result;
    });
}

export function unfollowUser(userId) {
  return apiRequest(`/api/v1/users/me/following/${encodeURIComponent(userId)}`, { method: 'DELETE' })
    .then((result) => {
      window.dispatchEvent(new Event(CONNECTIONS_CHANGED_EVENT));
      return result;
    });
}

export function getCommunities() {
  return apiRequest('/api/v1/communities');
}

export function getCommunityPosts() {
  return apiRequest('/api/v1/communities/posts');
}

export function getNotifications() {
  return apiRequest('/api/v1/notifications');
}

export function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  });
}

export function searchUsers(query) {
  return apiRequest(`/api/v1/users/search?q=${encodeURIComponent(query)}`);
}

export function getUserSuggestions() {
  return apiRequest('/api/v1/users/suggestions');
}

export function joinCommunity(communityId) {
  return apiRequest(`/api/v1/communities/${encodeURIComponent(communityId)}/join`, { method: 'POST' });
}

export function getCommunityJoinRequests() {
  return apiRequest('/api/v1/communities/requests');
}

export function approveCommunityJoinRequest(communityId, requesterId) {
  return apiRequest(`/api/v1/communities/${encodeURIComponent(communityId)}/requests/${encodeURIComponent(requesterId)}/approve`, {
    method: 'POST',
  });
}

export function rejectCommunityJoinRequest(communityId, requesterId) {
  return apiRequest(`/api/v1/communities/${encodeURIComponent(communityId)}/requests/${encodeURIComponent(requesterId)}/reject`, {
    method: 'POST',
  });
}

export function createCommunity(community) {
  return apiRequest('/api/v1/communities', {
    method: 'POST',
    body: JSON.stringify({
      name: community.name,
      description: community.description,
      category: community.category,
      visibility: community.visibility,
      imageUrl: community.imageUrl,
    }),
  });
}

export function updateProfile(profile) {
  const avatarPosition = profile.avatarPosition || {};
  const headerPosition = profile.headerPosition || {};
  return apiRequest('/api/v1/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      name: profile.name,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      headerUrl: profile.headerUrl,
      avatarPositionX: avatarPosition.x,
      avatarPositionY: avatarPosition.y,
      headerPositionX: headerPosition.x,
      headerPositionY: headerPosition.y,
    }),
  });
}

export function getPosts() {
  return apiRequest('/api/v1/posts');
}

export function createPost(content, privacy = 'PUBLIC', communityName = null, media = []) {
  return apiRequest('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify({ content, privacy, communityName, media }),
  });
}

export function likePost(postId) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/likes`, { method: 'POST' });
}

export function unlikePost(postId) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/likes`, { method: 'DELETE' });
}

export function commentOnPost(postId, content) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function editCommentOnPost(postId, commentId, content) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export function deleteCommentOnPost(postId, commentId) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
}

export function repostPost(postId) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/reposts`, { method: 'POST' });
}

export function undoRepost(postId) {
  return apiRequest(`/api/v1/posts/${encodeURIComponent(postId)}/reposts`, { method: 'DELETE' });
}
