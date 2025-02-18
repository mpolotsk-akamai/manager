import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';

import { GroupHeader, GroupItems } from './DatabaseAdvancedConfiguration.style';

import type { ConfigurationItem } from '@linode/api-v4';

export interface ConfigurationOption extends ConfigurationItem {
  category: string;
  label: string;
  value?: boolean | number | string;
}

interface Props {
  configurations: ConfigurationOption[];
  errorText: string | undefined;
  label: string;
  onChange: (value: ConfigurationOption) => void;
}

export const DatabaseConfigurationSelect = (props: Props) => {
  const { configurations, errorText, label, onChange } = props;

  const selectedConfig = configurations.find((val) => val.label === label);

  return (
    <Autocomplete
      ListboxProps={{
        style: {
          padding: 0,
        },
      }}
      groupBy={(option) => {
        if (option.category === 'Other') {
          return 'Other';
        }
        return option.category;
      }}
      isOptionEqualToValue={(option, selectedValue) =>
        option.label === selectedValue.label
      }
      onChange={(_, selected) => {
        onChange(selected!);
      }}
      renderGroup={(params) => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          error={!!errorText}
          helperText={errorText}
          label="Add a Configuration Option"
          placeholder="Select a configuration option"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={props.id}>
          {option.label}
        </li>
      )}
      sx={{
        width: '316px',
      }}
      autoHighlight
      clearIcon={null}
      getOptionLabel={(option) => option.label}
      label={''}
      options={configurations}
      value={selectedConfig ?? null}
    />
  );
};
