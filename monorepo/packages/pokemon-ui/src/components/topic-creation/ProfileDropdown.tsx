import React, { useEffect, useState } from 'react';
import { Panel, Header, Typography, Stack, Button } from 'ui';
import { getProfiles } from '../../utils/api';

export const ProfileDropdown: React.FC<{
  value?: string;
  onChange?: (profileId?: string) => void;
}> = ({ value, onChange }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [newName, setNewName] = useState('');

  const fetchProfiles = async () => {
    const res = await getProfiles();
    setProfiles(res.data ?? []);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <Panel background="secondary" rounded={false}>
      <Header sticky="sticky" position="top" background="secondary">
        <Typography as="h2" weight="bold" uppercase color="primary">
          Select Profile
        </Typography>
      </Header>

      <Stack direction="column" spacing="4px" scroll="vertical" maxHeight={260} paddingTop={12}>
        <div style={{ padding: 8 }}>
          <select
            style={{ width: '100%', padding: 8 }}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value || undefined)}
            aria-label="Select profile"
          >
            <option value="">-- select profile --</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ padding: 8, display: 'flex', gap: 8 }}>
          <input
            placeholder="New profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <Button
            onClick={async () => {
              const name = newName.trim();
              if (!name) return;
              await fetchProfiles();
              setNewName('');
            }}
          >
            Create
          </Button>
        </div>
      </Stack>
    </Panel>
  );
};