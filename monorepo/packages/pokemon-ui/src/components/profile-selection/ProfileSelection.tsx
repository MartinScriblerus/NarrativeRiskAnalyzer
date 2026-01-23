import styled from '@emotion/styled';
import { Container, Section, Panel, Typography, Button, Stack, Header, Form, InputFormField, FormProps } from 'ui';
import React, { useEffect, useRef, useState } from 'react';
import { createProfile, getProfiles, getAllTeams, recordTeamSelection, recordProfileSelection } from '../../utils/api';
import { useMainContext } from '../../contexts/MainContext';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../app/providers';
import { setProfileContext } from '../../utils/profileContext';
import axios from 'axios';



export const ProfileSelection = () => {
  const { tryGetTopicsSelection, setSelectedPortfolio, setSelectedTopic, topics, setTopics } = useMainContext();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCanSeeOthers, setUserCanSeeOthers] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const StyledContainer = styled(Container)`
    height: 100%;
    max-height: 100%;
  `;

  // Compact cross icon + button styles for dismiss control
  const CrossIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" role="img">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const StyledCloseButton = styled(Button)`
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0;
    line-height: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    border: none;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
    &:focus {
      outline: 2px solid rgba(0, 0, 0, 0.12);
      outline-offset: 2px;
    }

    & > svg {
      width: 12px;
      height: 12px;
      display: block;
    }
  `;

  const StyledButtonsWrapper = styled(Header)`
    width: 100%;
    justify-content: right;
    align-items: right;
    display: flex;
    marginTop: 1rem; 
    display: flex;
    gap: 0.5rem;
  `;

  const StyledCloseRow = styled(Stack)`
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 4px;
  `;

  useEffect(() => {
    (async () => {
      try {
        const [profilesRes, topicsRes] = await Promise.all([getProfiles(), getAllTeams()]);
        setProfiles(profilesRes.data ?? []);
        setTopics(topicsRes.data ?? []);
      } catch (err) {
        console.warn('Failed to load profiles or topics', err);
        setProfiles([]);
        setTopics([]);
      }
    })();
  }, [setTopics]);

  const selectProfile = (profileId: string, profile: Profile) => {
    setSelectedPortfolio(profileId);
    tryGetTopicsSelection(profile.name ?? '', 'selected', profileId);
    navigate('/topics', {
      state: {
        selectedProfileName: profile?.name ?? '',
        selectedProfileId: profileId,
        selectedTopicId: null,
      },
    });
  };

  const validate: NonNullable<FormProps['validate']> = (values) => {
    const errors: Record<string, string | undefined> = {};
    if (!values.create_profile || String(values.create_profile).trim() === '') {
      errors.create_profile = 'Profile name is required';
    }
    return errors;
  };

  const handleSubmitValues: NonNullable<FormProps['onSubmitValues']> = async (values) => {
    setErrorMsg(null);
    try {
      setLoading(true);

      const chosenName = String(values.create_profile ?? '').trim();
      if (!chosenName) {
        setErrorMsg('Please enter a profile name');
        return;
      }

      const res = await createProfile({ name: chosenName });
      const payload = res.data ?? {};
      // Support older backend shape (profile) or new shape { profile, token }
      const created = payload.profile ?? payload;
      const token = payload.token;

      // Persist lightweight profile context + token for visitor flows (best-effort)
      if (token && created?.id) {
        try {
          setProfileContext({
            profile: { id: created.id, name: created.name, createdAt: created.createdAt },
            token,
          });
        } catch (err) {
          console.warn('setProfileContext failed', err);
        }
      }

      setProfiles((prev) => [created, ...prev]);
      formRef.current?.reset();

      setSelectedPortfolio(created.id);
      tryGetTopicsSelection(created.name ?? '', 'created', created.id);
      navigate('/topics', {
        state: {
          selectedProfileName: created.name,
          selectedProfileId: created.id,
          selectedTopicId: null,
        },
      });
    } catch (err: any) {
      // Axios HTTP error handling: show server-provided message when available.
      if (axios.isAxiosError(err)) {
        const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
        if (err.response?.status === 409) {
          setErrorMsg(typeof serverMsg === 'string' ? serverMsg : 'Profile name already exists');
        } else {
          setErrorMsg(typeof serverMsg === 'string' ? serverMsg : 'Could not create profile');
        }
      } else {
        setErrorMsg(String(err));
      }
      console.error('create profile failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvent: FormProps['onSubmit'] = (evt) => {
    console.log('form submit event', evt);
  };

  const onTopicClick = async (topic: any) => {
    const topicId = topic.id;
    // 1) update UI selection immediately
    setSelectedTopic(topicId);

    // 2) record the explicit user selection (do this before navigation to avoid other effects causing duplicates)
    try {
      await recordTeamSelection(topicId);
    } catch (err) {
      console.warn('failed to record selection', err);
      // continue — recording failure should not block navigation
    }

    // 3) navigate and pass a flag so receiving components know this was an explicit click
    navigate('/topics', {
      state: {
        selectedProfileName: topic?.profile?.name ?? '',
        selectedProfileId: topic?.profile?.id ?? '',
        selectedTopicId: topicId,
        recordSelection: false, // explicit flag: don't auto-record again
      },
    });
  };

  const onProfileClick = async (profileId: string, profile: Profile) => {
    // 1) UI update
    setSelectedPortfolio(profileId);

    // 2) record explicit user selection (best-effort)
    try {
      await recordProfileSelection(profileId);
    } catch (err) {
      console.warn('recordProfileSelection failed', err);
    }

    // 3) navigate, include recordSelection flag to avoid downstream auto-record
    tryGetTopicsSelection(profile.name ?? '', 'selected', profileId);
    navigate('/topics', {
      state: {
        selectedProfileName: profile?.name ?? '',
        selectedProfileId: profileId,
        selectedTopicId: null,
        recordSelection: false,
      },
    });
  };

  // Sorted lists for presentation
  const sortedProfiles = [...profiles].sort((a, b) => (String(a?.name ?? '')).localeCompare(String(b?.name ?? '')));
  const sortedAllTopics = [...(topics ?? [])].sort((a: any, b: any) => (String(a?.name ?? '')).localeCompare(String(b?.name ?? '')));

  return (
    <StyledContainer>
      <Section>
        <Panel background="primary" rounded={false}>
          <Header sticky="sticky" position="top" background="secondary">
            <Typography as="h2" weight="bold" uppercase>
              Create Profile
            </Typography>
          </Header>
          <Stack>
            {errorMsg && (
              <Panel background='color-secondary'>
                <StyledCloseRow direction="row-reverse">
                  <StyledCloseButton onClick={() => setErrorMsg(null)} type="button" aria-label="Dismiss error">
                    <CrossIcon />
                  </StyledCloseButton>
                </StyledCloseRow>
                <Typography as="div" color="danger">
                  {errorMsg}
                </Typography>
              </Panel>
            )}
            <Form
              ref={formRef}
              onSubmit={handleSubmitEvent}
              onSubmitValues={handleSubmitValues}
              validate={validate}
              validateOn="submit"
              preventDefault={true}
              className="signup-form"
              action="/legacy-endpoint"
              method="post"
            >
              <InputFormField type="email" name="create_profile_email" label="create_profile_email" placeholder="Enter email" />

              <InputFormField type="password" name="create_profile_password" label="create_profile_email" placeholder="Password" />

              <StyledButtonsWrapper> 
                <Button type="submit" background="heroBg" disabled={loading}>
                  Create Profile
                </Button>

                <Button onClick={() => formRef.current?.reset()} type="button" background="heroBg">
                  Reset
                </Button>
              </StyledButtonsWrapper>
            </Form>
          </Stack>
        </Panel>

        

        {
          userCanSeeOthers && <Panel background="primary" rounded={false}>
            <Header sticky="sticky" position="top" background="secondary">
              <Typography as="h2" weight="bold" uppercase color="primary">
                Select Profile
              </Typography>
            </Header>
            <Stack direction="column" spacing="4px" scroll="vertical" maxHeight={154} paddingTop={12}>
              {sortedProfiles.map((p) => (
                <Button key={`select_profile_${p.id}`} onClick={() => onProfileClick(p.id, p)} background="heroBg">
                  {p.name}
                </Button>
              ))}
            </Stack>
          </Panel>
        }
      </Section>

      {/* Fullscreen area: All available topics as clickable buttons (layout like CompanySelector) */}
      <Section>
        <Panel rounded={false}>
          <Stack direction="column">
            <Header sticky="sticky" position="top" background="secondary">
              <Typography as="h2" weight="bold" uppercase color="primary">
                All Available Topics
              </Typography>
            </Header>

            {/* Scrollable wrapping buttons layout, similar to CompanySelector */}
            <Stack background="surface" direction="column" spacing="4px" scroll="vertical" maxHeight={260} paddingTop={12}>
              <div style={{ padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sortedAllTopics.map((t: any) => {
                  return (
                    <Button key={t.id} onClick={() => onTopicClick(t)} background="secondary" type="button">
                      {t.name}
                    </Button>
                  );
                })}
              </div>
            </Stack>
          </Stack>
        </Panel>
      </Section>
    </StyledContainer>
  );
};