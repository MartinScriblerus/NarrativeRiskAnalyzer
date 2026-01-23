import styled from '@emotion/styled';
import { Container, Section, Panel, Typography, Grid } from 'ui';
// import { theme } from '../../theme'

import React from 'react';
import { ProfileSelection } from '../profile-selection/ProfileSelection';

const WelcomeText = styled(Typography)`
    left: -0.25rem;
    font-size: 32px;
    weight: 600;
    // position: absolute;
    top: 0;
`;

const WelcomeSection = styled(Section)`
  background: ${({ theme }) => theme.colors?.primary ?? 'transparent'};
  width: 100%;
  display: flex;
  padding: ${({ theme }) => theme.space?.[3] ?? '1rem'};
`;

const WelcomeContainer = styled(Container)`
  max-width: ${({ theme }) => theme.sizes?.container ?? '100%'};
`;

const WelcomeTextPanel = styled(Panel)`
  min-height: 4rem;
`;

export const Home = () => {
  return (
    <WelcomeContainer>
      <WelcomeSection direction="column">
        <WelcomeTextPanel background="primary" color="secondary">
           <WelcomeText color="secondary"  variant="display">
                Narrative Risk Assessment
            </WelcomeText>
        </WelcomeTextPanel>
        </WelcomeSection>
        <Grid rows="2fr" align="start" >
            <ProfileSelection />
        </Grid>  
    </WelcomeContainer>
  );
};
