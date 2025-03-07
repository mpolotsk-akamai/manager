import { Button, Divider, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
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
  formatConfigPayload,
  getModifiedConfigFields,
} from '../../utilities';
import { DatabaseConfigurationItem } from './DatabaseConfigurationItem';
import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  ConfigCategoryValues,
  ConfigValue,
  Database,
  DatabaseInstance,
} from '@linode/api-v4';
import type { UpdateDatabasePayload } from '@linode/api-v4';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { database, onClose, open } = props;
  const { engine, engine_config: existingEngineConfigs, id } = database;
  const { enqueueSnackbar } = useSnackbar();
  const [
    selectedConfig,
    setSelectedConfig,
  ] = useState<ConfigurationOption | null>(null);
  const [addedConfigs, setAddedConfigs] = useState<ConfigurationOption[]>([]);

  const {
    error: updateDatabaseError,
    isPending: isUpdating,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(engine, id);

  const { data: allConfigs } = useDatabaseAdvancedConfigurationQuery(
    engine,
    true
  );

  const configurations = convertEngineConfigToOptions(allConfigs);
  const existingConfigsArray = convertExistingConfigsToArray(
    existingEngineConfigs,
    allConfigs
  );
  const newConfigsArray = convertNewConfigsToArray(addedConfigs, allConfigs);

  const usedConfigs = new Set([
    ...existingConfigsArray.map((config) => config.label),
    ...addedConfigs.map((config) => config.label),
  ]);
  const availableConfigurations = configurations.filter(
    (config) => !usedConfigs.has(config.label)
  );

  const handleAddConfiguration = (config: ConfigurationOption | null) => {
    if (config && !addedConfigs.some((o) => o.label === config.label)) {
      setAddedConfigs((prev) => [config, ...prev]);
      setValue(
        config.label,
        config.type === 'boolean'
          ? false
          : config.enum?.[0] ?? (config.type === 'string' ? '' : 0)
      );
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

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        existingConfigsArray.map((opt) => [opt.label, opt.value ?? ''])
      ),
    [existingConfigsArray]
  );

  const {
    control,
    formState: { dirtyFields, isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<{ [key: string]: ConfigValue | undefined }>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (allConfigs) {
      reset(initialValues);
    }
  }, [allConfigs]);

  const onSubmit = async (formData: ConfigCategoryValues) => {
    if (!dirtyFields) {
      return;
    }
    const modifiedFields = getModifiedConfigFields(
      dirtyFields,
      initialValues,
      newConfigsArray,
      formData
    );
    if (!Object.keys(modifiedFields).length) return;

    const payload: UpdateDatabasePayload = {
      engine_config: formatConfigPayload(modifiedFields, configurations),
    };

    await updateDatabase(payload).then(() => {
      onClose();
      enqueueSnackbar('Advanced Configuration settings saved', {
        variant: 'success',
      });
    });
  };

  return (
    <Drawer onClose={onClose} open={open} title="Advanced Configuration">
      {Boolean(updateDatabaseError) && (
        <Notice spacingBottom={16} spacingTop={16} variant="error">
          {updateDatabaseError?.[0].reason}
        </Notice>
      )}
      <Typography>
        Advanced parameters to configure your database cluster.
      </Typography>
      <Link to="">Learn more.</Link>

      <Notice important sx={{ mb: 1, mt: 3 }} variant="info">
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
                  configValue={field.value}
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
            disabled: !isDirty && newConfigsArray.length === 0,
            label: 'Save and Restart Service',
            loading: isUpdating,
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
