import React, { useEffect, useMemo, useState } from 'react';
import { Panel, Header, Typography, Stack, Button, Grid } from 'ui';
import { useMainContext } from '../../contexts/MainContext';
import { getProfiles, getAllTeams, createTeam } from '../../utils/api';
import { useLocation } from 'react-router-dom';
import { CompanySelector } from './CompanySelector';
import styled from '@emotion/styled';

/**
 * Small cross SVG icon — keeps visuals crisp and independent of font-size.
 */
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" role="img">
    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StyledCloseButton = styled(Button)`
  /* Compact square hit area */
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Make sure text won't leak (we use an SVG child instead) */
  font-size: 0;
  line-height: 0;

  border-radius: 4px;
  background: transparent;
  color: inherit;
  border: none;

  &:hover {
    background: rgba(0,0,0,0.06);
  }
  &:active {
    background: rgba(0,0,0,0.10);
  }
  &:focus {
    outline: 2px solid rgba(0,0,0,0.12);
    outline-offset: 2px;
  }

  & > svg {
    width: 12px;
    height: 12px;
    display: block;
  }
`;

const StyledCloseRow = styled(Stack)`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 4px;
`;

export const TopicEditor: React.FC<{ onCreated?: (topic: any) => void }> = ({ onCreated }) => {
  const { selectedPortfolio, setSelectedPortfolio, addTopic, setTopics, topics } = useMainContext();
  const location = useLocation();
  const state = (location.state ?? {}) as any;
  const profileIdFromState: string | undefined = state?.selectedProfileId;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const [topicName, setTopicName] = useState('');
  // LEGACY_POKEMON_MAPPING: companyIds maps to pokemonIds in API payload
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    const res = await getProfiles();
    setProfiles(res.data ?? []);
  };

  const fetchTopicsIntoContext = async () => {
    const res = await getAllTeams();
    setTopics(res.data ?? []);
  };

  useEffect(() => {
    fetchProfiles();
    fetchTopicsIntoContext();
  }, []);

  // determine initial profileId: prefer router state, else try context (match name -> id), else keep undefined
  useEffect(() => {
    if (profileIdFromState) {
      setProfileId(profileIdFromState);
      return;
    }
    if (selectedPortfolio) {
      // selectedPortfolio might be an id or a name depending on how tryGetTeamsSelection is used
      // try to match by id first
      const byId = profiles.find((p) => p.id === selectedPortfolio);
      if (byId) {
        setProfileId(byId.id);
        return;
      }
      // otherwise try match by name
      const byName = profiles.find((p) => p.name === selectedPortfolio);
      if (byName) {
        setProfileId(byName.id);
        return;
      }
    }
  }, [profileIdFromState, selectedPortfolio, profiles]);

  const handleCreate = async () => {
    // prefer local profileId, fall back to router state or context
    const effectiveProfileId = profileId ?? profileIdFromState ?? selectedPortfolio;

    if (!topicName.trim() || !effectiveProfileId) {
      // replace with toast in prod
      console.warn('Topic name and profile are required.', { topicName, profileId, profileIdFromState, selectedPortfolio });
      return;
    }

    // Prevent duplicate topic names for the same profile (case-insensitive, trimmed)
    const normalizedNewName = topicName.trim().toLowerCase();
    const duplicate = (topics ?? []).some((t: any) => {
      const existingName = String(t?.name ?? '').trim().toLowerCase();
      const existingProfileId = t?.profile?.id ?? t?.profile ?? null;
      return existingName === normalizedNewName && String(existingProfileId) === String(effectiveProfileId);
    });
    if (duplicate) {
      setError('A topic with this name already exists for the selected profile.');
      return;
    }

    setLoading(true);
    try {
      // LEGACY_POKEMON_MAPPING: API expects pokemonIds, we map from companyIds
      const pokemonIds = companyIds; // Map company IDs to pokemon IDs for API
      console.log('%c[CreateTopic Payload]', 'color: orange; font-weight: 700;', { name: topicName, profileId: effectiveProfileId, companyIds, pokemonIds });
      try {
        const res = await createTeam({ name: topicName, profileId: effectiveProfileId, pokemonIds });
        const created = res.data;

        // Update global UI state without triggering refetches or automatic selection side-effects
        addTopic(created);

        // set the profile as selected in the UI
        setSelectedPortfolio(effectiveProfileId);

        // clear local form state
        setTopicName('');
        setCompanyIds([]);
        setError(null);
        onCreated?.(created);

        console.log('%c[Topic Created] Ready to act on topic:', 'color: royalblue; font-weight: 700;', created);
      } catch (err: any) {
        console.error('create topic failed', err);
        setError(err?.response?.data?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('create topic failed', err);
      setLoading(false);
    }
  };

  const profileOptions = useMemo(() => profiles, [profiles]);

  return (
    <Panel rounded={false}>
      <Stack direction="row">
        <Header sticky="sticky" position="top">
          <Typography as="h2" weight="bold" uppercase color="accent">
            Name your Topic!!!
          </Typography>
        </Header>

        <Panel background="primary">
          <input value={topicName} onChange={(e) => setTopicName(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </Panel>
        {error && (
          <Panel background="color-secondary" color="#f6f6f6">
              <StyledCloseRow direction="row">
                <StyledCloseButton aria-label="Dismiss error" onClick={() => setError(null)}>
                  <CrossIcon />
                </StyledCloseButton>
              </StyledCloseRow>
            <Typography as="div" color="danger">
              {error}
            </Typography>
          </Panel>
        )}
      </Stack>

      <Stack direction="column" spacing="8px">
        <CompanySelector selected={companyIds} onChange={setCompanyIds} />

        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 8 }}>
          <Button onClick={handleCreate} disabled={loading}>
            Create Topic
          </Button>
          <Button
            onClick={() => {
              setTopicName('');
              setCompanyIds([]);
            }}
            type="button"
          >
            Clear
          </Button>
        </div>
      </Stack>
    </Panel>
  );
};