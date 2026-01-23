import React, { useEffect, useState } from 'react';
import { Panel, Header, Typography, Stack, Button } from 'ui';
import { getAllTeams } from '../../utils/api';

type Props = {
  value?: string;
  onChange?: (topicId?: string) => void;
};

export const TopicDropdown: React.FC<Props> = ({ value, onChange }) => {
  const [topics, setTopics] = useState<any[]>([]);

  const fetch = async () => {
    const res = await getAllTeams();
    setTopics(res.data ?? []);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Panel background="secondary" rounded={false}>
      <Header sticky="sticky" position="top" background="secondary">
        <Typography as="h2" weight="bold" uppercase color="primary">
          Select Topic
        </Typography>
      </Header>

      <Stack direction="column" spacing="4px" scroll="vertical" maxHeight={260} paddingTop={12}>
        <div style={{ padding: 8 }}>
          <select
            style={{ width: '100%', padding: 8 }}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value || undefined)}
            aria-label="Select topic"
          >
            <option value="">-- select topic --</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ padding: 8 }}>
          <Button onClick={fetch}>Refresh</Button>
        </div>
      </Stack>
    </Panel>
  );
};