import {
  Autocomplete,
  FormControlLabel,
  IconButton,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import Close from '@mui/icons-material/Close';
import React from 'react';

import { formatConfigValue } from '../../utilities';
import {
  StyledBox,
  StyledChip,
  StyledWrapper,
} from './DatabaseConfigurationItem.style';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type { ConfigValue } from '@linode/api-v4';

interface Props {
  configItem?: ConfigurationOption;
  configValue?: ConfigValue;
  engine: string;
  errorText: string | undefined;
  isNewConfig?: boolean;
  onChange: (config: ConfigValue) => void;
  onRemove: (label: string) => void;
}

export const DatabaseConfigurationItem = (props: Props) => {
  const {
    configItem,
    configValue,
    engine,
    errorText,
    isNewConfig,
    onChange,
    onRemove,
  } = props;
  const configLabel = configItem?.label || '';

  const renderInputField = () => {
    if (configItem?.type === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Toggle
              checked={Boolean(configValue)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={formatConfigValue(String(configValue))}
        />
      );
    }
    if (configItem?.type === 'string' && configItem.enum) {
      const options =
        configItem.enum?.map((option) => ({ label: option })) || [];
      const selectedValue = options.find(
        (option) => option.label === String(configValue)
      );
      return (
        <Autocomplete
          onChange={(_, selected) => {
            onChange(selected?.label ?? '');
          }}
          renderInput={(params) => (
            <TextField {...params} label="" placeholder="Select an option" />
          )}
          disableClearable
          filterOptions={(options) => options}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label={''}
          options={options}
          value={selectedValue ?? options[0]}
        />
      );
    }
    if (configItem?.type === 'number' || configItem?.type === 'integer') {
      return (
        <TextField
          slotProps={{
            htmlInput: { max: configItem.maximum, min: configItem.minimum },
          }}
          errorText={errorText}
          fullWidth
          label=""
          name={configLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={isNewConfig ? String(configItem?.example ?? '') : ''}
          type="number"
          value={Number(configValue)}
        />
      );
    }

    return (
      <TextField
        slotProps={{
          htmlInput: {
            maxLength: configItem?.maxLength,
            minLength: configItem?.minLength,
          },
        }}
        errorText={errorText}
        fullWidth
        label=""
        name={configLabel}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isNewConfig ? String(configItem?.example ?? '') : ''}
        type="text"
        value={configValue ? String(configValue) : ''}
      />
    );
  };

  return (
    <StyledWrapper
      alignItems="flex-start"
      display="flex"
      justifyContent="space-between"
    >
      <StyledBox>
        <Typography
          sx={(theme) => ({ font: theme.tokens.typography.Body.Bold, mr: 0.5 })}
        >
          {`${engine}.${configLabel}`}
        </Typography>
        {configItem?.restart_cluster && (
          <StyledChip color="warning" label="restarts service" size="small" />
        )}
        {configItem?.description && (
          <Typography mt={0.5}>{configItem?.description}</Typography>
        )}
        {renderInputField()}
      </StyledBox>

      {isNewConfig && configItem && (
        <IconButton
          disableRipple
          onClick={() => onRemove(configItem?.label)}
          size="large"
        >
          <Close />
        </IconButton>
      )}
    </StyledWrapper>
  );
};
