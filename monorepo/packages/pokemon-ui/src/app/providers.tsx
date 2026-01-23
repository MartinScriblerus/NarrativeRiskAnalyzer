import { ReactNode } from 'react';
import { MainProvider } from '../contexts/MainContext';

type Props = { children?: ReactNode };

// LEGACY_POKEMON_MAPPING: Pokemon type kept for backward compatibility with API responses
export type Pokemon = {
  id: string;
  name: string;
  pokedexNumber: number;
  profileId: string;
  selectedCount: number;
}

// Company type - new domain model (maps to Pokemon entity in database)
export type Company = {
  id: string;
  name: string;
  urls?: string[];
  documents?: CompanyDocument[];
  // LEGACY_POKEMON_MAPPING: pokedexNumber maps from Pokemon.pokedexNumber for now
  pokedexNumber?: number;
  selectedCount?: number;
}

export type CompanyDocument = {
  id: string;
  name: string;
  url?: string;
  // MIGRATION_REQUIRED: Add document-specific fields when Company entity is migrated
}

export type Profile = {
  id: string;
  name: string;
  persistent: boolean;
  createdAt: Date;
  selectedCount: string;
}

export type Topic = {
  id: string;
  name: string;
  profileId: string;
  createdAt: Date;
  selectedCount: number;
}

export type MainContextState = {
  profiles: Profile[];
  topics: Topic[];
  // LEGACY_POKEMON_MAPPING: pokemon array kept for API compatibility
  pokemon: Pokemon[];
  companies: Company[];
  loading: boolean;
  refreshProfiles(): Promise<void>;
  refreshTopics(): Promise<void>;
  refreshCompanies(): Promise<void>;
};

export function AppProviders({ children }: Props) {  
  return (
    <MainProvider>
        {children}
    </MainProvider>
  )
}