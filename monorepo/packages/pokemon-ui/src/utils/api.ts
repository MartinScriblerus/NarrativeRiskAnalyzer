import axios from 'axios';

// // Use VITE_ prefix for env variables in Vite
// const BASE_URL = (window as any).__ENV_API_BASE || 'http://localhost:3000/api';

// Use VITE_ prefix for env variables in Vite
// Use a relative path so Vite dev server proxy handles requests in development.
const BASE_URL = (window as any).__ENV_API_BASE || '/api';

// Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request helpers (named exports)
export const getProfiles = () => api.get('/profiles');

// Fetch a single topic by id (backend still uses /teams endpoint)
export const getTeam = (teamId: string) => api.get(`/teams/${teamId}`);

// Fetch topics list (discovery / top-N). Optional topN param (backend still uses /teams endpoint)
export const getAllTeams = (topN?: number) =>
  api.get('/teams', { params: topN ? { topN } : undefined });

// Get profile's topics (backend still uses /teams endpoint)
export const getProfileTeams = (profileId: string) =>
  api.get(`/profiles/${profileId}/teams`);

// List all companies (LEGACY_POKEMON_MAPPING: calls /pokemon endpoint, returns Pokemon entities mapped to Company)
export const getPokemon = () => api.get('/pokemon');

// Create a profile
export const createProfile = (payload: { name: string; password?: string }) =>
  api.post('/profiles', payload);

// Create a topic (backend still uses /teams endpoint)
// payload minimally: { name: string; profileId: string; pokemonIds?: string[] }
export const createTeam = (payload: { name: string; profileId: string; pokemonIds?: string[] }) =>
  api.post('/teams', payload);

// Get human-readable company names for a topic (LEGACY_POKEMON_MAPPING: backend still uses /teams/{id}/pokemon-names endpoint)
export const getTeamPokemonNames = (teamId: string) =>
  api.get(`/teams/${teamId}/pokemon-names`);

// Record that a visitor selected a topic (explicit user action, backend still uses /teams endpoint)
export const recordTeamSelection = (teamId: string) =>
  api.post(`/teams/${teamId}/select`);

// Record that a visitor selected a profile (explicit user action)
export const recordProfileSelection = (profileId: string) =>
  api.post(`/profiles/${profileId}/select`);

// Record that a visitor selected a company (LEGACY_POKEMON_MAPPING: calls /pokemon/{id}/select endpoint)
export const recordPokemonSelection = (companyId: string) =>
  api.post(`/pokemon/${companyId}/select`);