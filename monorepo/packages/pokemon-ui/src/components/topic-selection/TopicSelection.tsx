import styled from '@emotion/styled';
import { Container, Section, Panel, Typography, Stack, Button, Grid } from 'ui';

import { useLocation } from 'react-router-dom';
import { useMainContext } from '../../contexts/MainContext';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllTeams, getTeamPokemonNames } from '../../utils/api';
import { TopicEditor } from '../topic-creation/TopicEditor';

const Column = styled.div`
  flex: 0 0 33%;
  padding: 12px;
  box-sizing: border-box;
  min-width: 0; /* important for flex children to allow children to shrink */
`;

const CurrProfileColumn = styled(Column)`
  max-width: 200px;
`;

export const TopicSelection = () => {
  const location = useLocation();
  const state = (location.state ?? {}) as {
    selectedProfileName?: string;
    selectedProfileId?: string;
    selectedTopicId?: string;
  };
  const profileFromState = state?.selectedProfileName;
  const profileIdFromState = state?.selectedProfileId;
  const topicIdFromState = state?.selectedTopicId;

  // Pull topics and helpers from global MainContext (single source of truth)
  const {
    selectedPortfolio,
    setSelectedPortfolio,
    topics,
    setTopics,
    addTopic,
    selectedTopic: globalSelectedTopic,
    setSelectedTopic: setGlobalSelectedTopic,
  } = useMainContext();

  const profileToUse = profileFromState ?? selectedPortfolio;

  // effective profile id: prefer router-state id then context
  const effectiveProfileId = profileIdFromState ?? (typeof selectedPortfolio === 'string' ? selectedPortfolio : undefined);

  // local UI state for the selected topic's company names
  // LEGACY_POKEMON_MAPPING: company names come from pokemon-names API endpoint
  const [topicCompanyNames, setTopicCompanyNames] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(globalSelectedTopic ?? null);

  // load topics on mount into context (idempotent)
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllTeams();
        // store sorted topics in context
        const all = res.data ?? [];
        const sorted = all.slice().sort((a: any, b: any) => (String(a?.name ?? '')).localeCompare(String(b?.name ?? '')));
        setTopics(sorted);
      } catch (err) {
        console.warn('Failed to load topics', err);
        setTopics([]);
      }
    })();
  }, [setTopics]);

  // derive the list of topics to display for the chosen profile (or all if no profile)
  const displayedTopics = useMemo(() => {
    if (!effectiveProfileId) return topics ?? [];
    return (topics ?? []).filter((t) => (t?.profile?.id ?? (t as any).profileId) === effectiveProfileId);
  }, [topics, effectiveProfileId]);

  // memoize handler so effect deps are stable
  const showSelectedTopicCompanies = useCallback(
    async (topic: any) => {
      if (!topic?.id) return;
      setSelectedTopicId(topic.id);
      // also set global selected topic so other components can react
      try {
        setGlobalSelectedTopic?.(topic.id);
      } catch {}
      try {
        // LEGACY_POKEMON_MAPPING: getTeamPokemonNames() calls /teams/{id}/pokemon-names endpoint
        const namesRes = await getTeamPokemonNames(topic.id);
        setTopicCompanyNames((namesRes.data?.pokemonNames ?? []).slice(0, 6));
      } catch (err) {
        console.warn('Could not fetch company names for topic', err);
        setTopicCompanyNames([]);
      }
    },
    [setGlobalSelectedTopic]
  );

  // Auto-select if router provided a topicId. Wait until topics loaded so we can find the topic and sync context if needed.
  useEffect(() => {
    if (!topicIdFromState) return;
    // try to find topic in the loaded list; if available, prefer that object
    const topicObj = (topics ?? []).find((t) => t.id === topicIdFromState);
    if (topicObj) {
      // if profile is not in context, sync it so other components see it
      const topicProfileId = topicObj?.profile?.id ?? (topicObj as any).profileId;
      if (topicProfileId && topicProfileId !== selectedPortfolio) {
        setSelectedPortfolio(topicProfileId);
      }
      showSelectedTopicCompanies(topicObj);
    } else {
      // topics not loaded yet or topic not present -> call handler with minimal object (it will still fetch names)
      showSelectedTopicCompanies({ id: topicIdFromState });
    }
  }, [topics, topicIdFromState, selectedPortfolio, setSelectedPortfolio, showSelectedTopicCompanies]);

  // normalize created topic and update UI in-place
  const handleTopicCreated = (createdTopic: any) => {
    if (!createdTopic) return;

    // Ensure profile object exists for downstream UI (some APIs return only profileId)
    if (!createdTopic.profile && createdTopic.profileId) {
      createdTopic.profile = { id: createdTopic.profileId, name: profileToUse ?? '' };
    }

    // Add to global topics via context helper (addTopic avoids duplicates)
    try {
      addTopic?.(createdTopic);
    } catch {
      // fallback: ensure topics updated (MainContext.setTopics expects the full array)
      const deduped = (topics ?? []).some((t: any) => t.id === createdTopic.id) ? topics : [createdTopic, ...(topics ?? [])];
      setTopics(deduped);
    }

    const topicProfileId = createdTopic?.profile?.id ?? createdTopic.profileId;

    // if this topic belongs to the currently-selected profile, show its companies and highlight
    if (topicProfileId && topicProfileId === effectiveProfileId) {
      showSelectedTopicCompanies(createdTopic);
      setSelectedTopicId(createdTopic.id);
    }

    // ensure the UI-wide selected profile is set so other components sync
    if (topicProfileId && topicProfileId !== selectedPortfolio) {
      setSelectedPortfolio(topicProfileId);
    }
  };

  // ADD NEW! ADD NEW 

  return (
    <Container noPadding>
      <Section direction="column" gap="0px" padding="0">
        <Panel background="primary" rounded={false} padding="0">
          <Stack direction="row">
            {/* Column 1: Current Profile */}
            <CurrProfileColumn>
              <Typography as="h3" variant="body" color="accent">
                Current Profile:
              </Typography>
              <Typography as="h3" variant="heading" color="accent">
                {profileToUse}
              </Typography>
            </CurrProfileColumn>

            {/* Column 2: Topics list */}
            <Column>
              <Typography as="h3" variant="body" color="accent">
                Topics:
              </Typography>
              <Stack background="primaryPokemon" direction="column" spacing="4px" scroll="vertical" maxHeight={100} paddingTop={4}>
                {displayedTopics.map((t) => {
                  const topicProfileId = t?.profile?.id ?? (t as any).profileId;
                  return (
                    <Button key={t.id} onClick={() => showSelectedTopicCompanies(t)} background={selectedTopicId === t.id ? 'accent' : 'secondary'} type="button">
                      {t.name}
                    </Button>
                  );
                })}
              </Stack>
            </Column>

            {/* Column 3: Companies on selected topic (grid up to 6 items) */}
            <Column>
              <Typography as="h3" variant="body" color="accent">
                Companies:
              </Typography>
              <Grid columns="repeat(auto-fit, minmax(120px, 1fr))" gap="8px">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const name = topicCompanyNames[idx];
                  return name ? (
                    <Button key={name} onClick={() => console.log('clicked company', name)} type="button">
                      {name}
                    </Button>
                  ) : (
                    // placeholder empty slot for consistent surface visibility
                    <div key={`empty-${idx}`} style={{ minHeight: 44 }} />
                  );
                })}
              </Grid>
            </Column>
          </Stack>
        </Panel>
      </Section>
      <TopicEditor onCreated={handleTopicCreated} />
    </Container>
  );
};