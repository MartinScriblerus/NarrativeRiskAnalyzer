import React, { useEffect, useState } from 'react';
import { Panel, Header, Typography, Stack, Button } from 'ui';
// LEGACY_POKEMON_MAPPING: API functions still use /pokemon endpoints
import { getPokemon, recordPokemonSelection } from '../../utils/api';

type Props = {
  selected: string[]; // company ids (LEGACY_POKEMON_MAPPING: maps to pokemon ids from API)
  onChange: (ids: string[]) => void;
};

export const CompanySelector: React.FC<Props> = ({ selected, onChange }) => {
  const [all, setAll] = useState<any[]>([]);

  useEffect(() => {
    // LEGACY_POKEMON_MAPPING: getPokemon() calls /pokemon endpoint, returns Pokemon entities
    getPokemon().then((res) => setAll(res.data ?? []));
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  const onCompanyClick = async (companyId: string) => {
    // update local UI selection immediately
    toggle(companyId);

    // then record selection (best-effort)
    // LEGACY_POKEMON_MAPPING: recordPokemonSelection() calls /pokemon/{id}/select endpoint
    try {
      await recordPokemonSelection(companyId);
    } catch (err) {
      console.warn('recordCompanySelection failed', err);
    }
  };

  return (
    <Panel background="surface" rounded={false}>
      <Stack background="primary" direction="column" spacing="4px" scroll="vertical" maxHeight={260} paddingTop={12}>
        <div style={{ padding: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {all.map((company) => {
            // LEGACY_POKEMON_MAPPING: company data comes from Pokemon API response
            const isSelected = selected.includes(company.id);
            return (
              <Button
                key={company.id}
                onClick={() => onCompanyClick(company.id)}
                background={isSelected ? 'accent' : 'color-secondary'}
                type="button"
              >
                {company.name}
              </Button>
            );
          })}
        </div>
      </Stack>
    </Panel>
  );
};