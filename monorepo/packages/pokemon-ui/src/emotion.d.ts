// packages/pokemon-ui/src/emotion.d.ts
import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors?: {
      primary?: string;
      accent?: string;
      surface?: string;
      background?: string;
      text?: string;
      textMuted?: string;
      white?: string;
      heroBg?: string;
      [key: string]: string | undefined;
    };
    space?: {
      sm?: string;
      md?: string;
      lg?: string;
      [key: string]: string | undefined;
    };
    radii?: {
      sm?: string;
      md?: string;
      lg?: string;
      [key: string]: string | undefined;
    };
    sizes?: {
      container?: string;
      [key: string]: string | undefined;
    };
    // allow other top-level tokens
    [key: string]: any;
  }
}