import '../styles/global.css';
import { Viewport, Main } from 'ui';
import { AppProviders } from '../app/providers';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { theme } from '../theme';
import { ThemeProvider } from '@emotion/react';

export function NxWelcome({ title }: { title: string }) {
  return (
    <>
      <div className="wrapper">
        <Viewport background="primary">
        <div className="container">
          <ThemeProvider theme={theme}>
            <AppProviders>
                <Main>
                  <RouterProvider router={router} />
                </Main>
            </AppProviders>
          </ThemeProvider>
        </div>
        </Viewport>
      </div>
    </>
  );
}

export default NxWelcome;
