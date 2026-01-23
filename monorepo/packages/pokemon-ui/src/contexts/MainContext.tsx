import React, { createContext, useContext, useState, ReactNode } from 'react';

type MainContextType = {
  // LEGACY_POKEMON_MAPPING: selectedPokemon kept for backward compatibility
  selectedPokemon?: string;
  selectedCompany?: string;
  selectedPortfolio?: string;
  selectedTopic?: string;
  setSelectedPokemon: (name: string) => void;
  setSelectedCompany: (name: string) => void;
  setSelectedPortfolio: (id: string) => void;
  setSelectedTopic: (id?: string) => void;
  isProfilesOpen: boolean;
  toggleProfiles: () => void;
  // LEGACY_POKEMON_MAPPING: isPokemonsOpen kept for backward compatibility
  isPokemonsOpen: boolean;
  isCompaniesOpen: boolean;
  togglePokemons: () => void;
  toggleCompanies: () => void;
  tryGetTopicsSelection: (nameOrId: string, action: string, id?: string) => void;
  topics: any[];
  setTopics: (topics: any[]) => void;
  addTopic: (topic: any) => void;
};

const MainContext = createContext<MainContextType | undefined>(undefined);

type MainProviderProps = {
  children: ReactNode;
};

export const MainProvider = ({ children }: MainProviderProps) => {
  // LEGACY_POKEMON_MAPPING: selectedPokemon kept for backward compatibility
  const [selectedPokemon, setSelectedPokemon] = useState<string | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | undefined>();
  const [isProfilesOpen, setIsProfilesOpen] = useState<boolean>(true);
  // LEGACY_POKEMON_MAPPING: isPokemonsOpen kept for backward compatibility
  const [isPokemonsOpen, setIsPokemonsOpen] = useState<boolean>(true);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState<boolean>(true);
  // inside MainProvider (add below existing state vars)
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();

  // helper to immutably prepend a created topic into the global list
  const addTopic = (topic: any) => {
    setTopics((prev) => {
      // avoid duplicates by id
      if (prev.some((t) => t.id === topic.id)) return prev;
      return [topic, ...prev];
    });
  };

  const toggleProfiles = () => setIsProfilesOpen((prev) => !prev);
  // LEGACY_POKEMON_MAPPING: togglePokemons kept for backward compatibility
  const togglePokemons = () => setIsPokemonsOpen((prev) => !prev);
  const toggleCompanies = () => setIsCompaniesOpen((prev) => !prev);

  // New helper: an example implementation that stores the selected profile and opens the profiles pane.
  // You can customize this to fetch topics, navigate, or open a modal instead.
  const tryGetTopicsSelection = (nameOrId: string, action: string, id?: string) => {
    console.log('[MainContext] tryGetTopicsSelection', { nameOrId, action, id });
    // Prefer explicit id when provided
    if (id) {
      setSelectedPortfolio(id);
    } else {
      // fallback to the provided identifier (could be name or id)
      setSelectedPortfolio(nameOrId);
    }
    setIsProfilesOpen(true);
  };

  const value: MainContextType = {
    // domain
    selectedPokemon,
    selectedCompany,
    selectedPortfolio,
    selectedTopic,
    setSelectedPokemon,
    setSelectedCompany,
    setSelectedPortfolio,
    setSelectedTopic,
    // UI
    isProfilesOpen,
    isPokemonsOpen,
    isCompaniesOpen,
    toggleProfiles,
    togglePokemons,
    toggleCompanies,
    tryGetTopicsSelection,
    topics,
    setTopics,
    addTopic
  };

  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

export const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext must be used within a MainProvider');
  }
  return context;
};