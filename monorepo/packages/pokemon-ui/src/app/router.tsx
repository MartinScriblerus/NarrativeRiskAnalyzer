import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { History } from '../components/history-dashboard/HistoryDashboard';
import { ProfileSelection } from '../components/profile-selection/ProfileSelection';
// lazy-load named export TopicSelection
const TopicSelection = React.lazy(() =>
  import('../components/topic-selection/TopicSelection').then((mod) => ({ default: (mod as any).TopicSelection }))
);
import { Home } from '../components/home/Home';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/history', element: <History /> },
  { path: '/profiles', element: <ProfileSelection /> },
  { path: '/topics', element: <React.Suspense fallback={<div>Loading…</div>}><TopicSelection /></React.Suspense> }
]);