import { Button, Divider, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import {
  useDatabaseAdvancedConfigurationQuery,
  useDatabaseMutation,
} from 'src/queries/databases/databases';

import {
  convertEngineConfigToOptions,
  convertExistingConfigsToArray,
  convertNewConfigsToArray,
} from '../../utilities';
import { DatabaseConfigurationItem } from './DatabaseConfigurationItem';
import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  ConfigCategoryValues,
  Database,
  DatabaseInstance,
  DatabaseInstanceAdvancedConfig,
} from '@linode/api-v4';
import type { UpdateDatabasePayload } from '@linode/api-v4';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { onClose, open } = props;

  const [
    selectedConfig,
    setSelectedConfig,
  ] = useState<ConfigurationOption | null>(null);
  const [addedConfigs, setAddedConfigs] = useState<ConfigurationOption[]>([]);

  const { engine, engine_config: enginConfigurationOptions, id } = database;

  const {
    // error: advancedConfigError,
    // isPending: submitInProgress,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(engine, id);

  const {
    data: allConfigs,
    // error: allConfigsError,
    // isLoading: allConfigsLoading,
  } = useDatabaseAdvancedConfigurationQuery({ engine }, true);

  const configurations = convertEngineConfigToOptions(allConfigs);

  const existingConfigsArray = convertExistingConfigsToArray(
    enginConfigurationOptions,
    allConfigs
  );
  const newConfigsArray = convertNewConfigsToArray(addedConfigs, allConfigs);

  // Get all currently used configurations (existing + added)
  const usedConfigs = new Set([
    ...existingConfigsArray.map((config) => config.label),
    ...addedConfigs.map((config) => config.label),
  ]);

  // Filter configurations to exclude already used ones
  const availableConfigurations = configurations.filter(
    (config) => !usedConfigs.has(config.label)
  );

  const handleAddConfiguration = (config: ConfigurationOption | null) => {
    if (config && !addedConfigs.some((o) => o.label === config.label)) {
      setAddedConfigs((prev) => [config, ...prev]);

      const key = String(config.label);
      let defaultValue: boolean | number | string | undefined;

      // console.log('config = ',config.enum)
      if (config.type === 'boolean') {
        defaultValue = false;
      } else if (config.enum && config.enum?.length > 0) {
        defaultValue = config.enum[0];
      } else if (config.type === 'number' || config.type === 'integer') {
        defaultValue = undefined;
      }
      setValue(key, defaultValue);
    }
    setSelectedConfig(null);
  };

  const handleRemoveConfig = (configLabel: string) => {
    setAddedConfigs((prev) => prev.filter((o) => o.label !== configLabel));
    setValue(configLabel, undefined);
  };

  const handleConfigChange = (config: ConfigurationOption | null) => {
    setSelectedConfig(config);
  };

  const initialValues = existingConfigsArray.reduce((acc, option) => {
    const key = option.label;
    acc[key] = option.value ?? '';
    return acc;
  }, {} as Record<string, boolean | number | string>);

  const { control, handleSubmit, setValue } = useForm<{
    [key: string]: boolean | number | string | undefined;
  }>({
    defaultValues: initialValues,
  });

  const onSubmit = async (formData: ConfigCategoryValues) => {
    const structuredConfig: DatabaseInstanceAdvancedConfig = {};
    configurations.forEach(({ category, label }) => {
      const value = formData[label];

      if (value !== undefined) {
        if (category === 'Other') {
          structuredConfig[label] = value;
        } else {
          if (!structuredConfig[category]) {
            structuredConfig[category] = {};
          }
          (structuredConfig[category] as ConfigCategoryValues)[label] = value;
        }
      }
    });

    const payload: UpdateDatabasePayload = {
      engine_config: structuredConfig,
    };
    try {
      await updateDatabase(payload);
      onClose();
    } catch (errors) {}
  };

  return (
    <Drawer onClose={onClose} open={open} title="Advanced Configuration">
      <Typography>
        Advanced parameters to configure your database cluster.
      </Typography>
      <Link to="">Learn more.</Link>

      <Notice important top={24} variant="info">
        <Typography>
          There is no way to reset advanced configuration options to default.
          Options that you add cannot be removed. Changing or adding some
          options causes the service to restart.
        </Typography>
      </Notice>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          alignItems={'end'}
          container
          justifyContent="space-between"
          size={12}
        >
          <Grid size={9}>
            <DatabaseConfigurationSelect
              configurations={availableConfigurations}
              errorText={undefined}
              label={selectedConfig?.label ?? ''}
              onChange={(config) => handleConfigChange(config)}
            />
          </Grid>
          <Grid size={2}>
            <Button
              buttonType="primary"
              disabled={!selectedConfig}
              onClick={() => handleAddConfiguration(selectedConfig)}
              sx={{ minWidth: 'auto', width: '70px' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Divider spacingBottom={20} spacingTop={24} />
        {newConfigsArray.length > 0 &&
          newConfigsArray.map((option) => (
            <Controller
              render={({ field, fieldState }) => (
                <DatabaseConfigurationItem
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  configItem={option}
                  configValue={field.value ?? undefined}
                  engine={engine}
                  errorText={fieldState.error?.message}
                  isNewConfig={true}
                  onRemove={handleRemoveConfig}
                />
              )}
              control={control}
              key={option.label}
              name={option.label}
            />
          ))}

        {existingConfigsArray.length > 0 &&
          existingConfigsArray.map((option) => (
            <Controller
              render={({ field, fieldState }) => (
                <DatabaseConfigurationItem
                  configItem={option}
                  configValue={field.value ?? initialValues[option.label]}
                  engine={engine}
                  errorText={fieldState.error?.message}
                  onChange={field.onChange}
                  onRemove={handleRemoveConfig}
                />
              )}
              control={control}
              key={option.label}
              name={option.label}
            />
          ))}
        {newConfigsArray.length === 0 && existingConfigsArray.length === 0 && (
          <Typography align="center">
            No advanced configurations have been added.
          </Typography>
        )}
        <Divider spacingBottom={20} spacingTop={24} />
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save and Restart Service',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
