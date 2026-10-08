import { apiRequest } from './authApi';

export function getInstitutions() {
  return apiRequest('/api/v1/catalog/institutions');
}

export function getCampuses(institutionName, institutionDomain) {
  const query = new URLSearchParams({ institutionName });
  if (institutionDomain) query.set('institutionDomain', institutionDomain);
  return apiRequest(`/api/v1/catalog/campuses?${query}`);
}

export function getCourses(institutionName, institutionDomain, campus) {
  const query = new URLSearchParams({ institutionName });
  if (institutionDomain) query.set('institutionDomain', institutionDomain);
  if (campus) query.set('campus', campus);
  return apiRequest(`/api/v1/catalog/courses?${query}`);
}

export function getPeriods() {
  return apiRequest('/api/v1/catalog/periods');
}

export function saveOnboarding(data) {
  return apiRequest('/api/v1/users/me/onboarding', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
