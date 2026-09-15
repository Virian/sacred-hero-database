import { useContext, useMemo } from 'react';
import { Formik, type FormikHelpers } from 'formik';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

import { Button, Input, RadioGroup } from '../../components';
import { Commands } from '../../constants';
import { SettingsContext } from '../../context';

import { validate } from './validate';
import { characterSlotsOptions } from './Settings.constants';
import type { FormValues } from './Settings.types';
import styles from './Settings.module.scss';

export const Settings = () => {
  const { settings, fetchSettings } = useContext(SettingsContext);

  const initialFormValues: FormValues = useMemo(
    () => ({
      installationPath: settings.gameInstallationPath,
      activeCharacterSlots: `${settings.activeCharacterSlots}`,
    }),
    [settings.gameInstallationPath, settings.activeCharacterSlots],
  );

  const saveSettings = async (values: FormValues) => {
    try {
      await invoke(Commands.UPDATE_SETTINGS, {
        gameInstallationPath: values.installationPath,
        activeCharacterSlots: parseInt(values.activeCharacterSlots),
      });
      await fetchSettings();
      toast.success('Settings saved successfully.', {
        position: 'bottom-center',
        theme: 'dark',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to save settings.', {
        position: 'bottom-center',
        theme: 'dark',
      });
    }
  };

  const handleBrowse = async (
    setFieldValue: FormikHelpers<FormValues>['setFieldValue'],
  ) => {
    const installationPath = await open({
      multiple: false,
      directory: true,
    });

    if (installationPath) {
      setFieldValue('installationPath', installationPath || '', true);
    }
  };

  return (
    <Formik<FormValues>
      initialValues={initialFormValues}
      enableReinitialize
      validate={validate}
      onSubmit={saveSettings}
    >
      {({
        values,
        errors,
        touched,
        dirty,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
      }) => (
        <form
          className={styles.container}
          onSubmit={handleSubmit}
        >
          <div className={styles.header}>
            <h1>Settings</h1>
            <div className={styles.actions}>
              <Button
                className={styles.button}
                variant="danger"
                disabled={!dirty}
                onClick={() => resetForm()}
              >
                <span className={styles.buttonText}>
                  <X size={16} />
                  Cancel
                </span>
              </Button>
              <Button
                type="submit"
                className={styles.button}
                disabled={!dirty}
              >
                <span className={styles.buttonText}>
                  <Save size={16} />
                  Save
                </span>
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Game installation path</h2>
            <div className={styles.installationPathRow}>
              <Input
                id="installationPath"
                name="installationPath"
                className={styles.installationPathInput}
                placeholder="Enter game installation path..."
                value={values.installationPath}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Button
                variant="secondary"
                onClick={() => handleBrowse(setFieldValue)}
              >
                Browse...
              </Button>
            </div>
            {errors.installationPath && touched.installationPath && (
              <span className={styles.errorText}>
                {errors.installationPath}
              </span>
            )}
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Active character slots</h2>
            <RadioGroup
              name="activeCharacterSlots"
              options={characterSlotsOptions}
              value={values.activeCharacterSlots}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p className={styles.activeCharacterSlotsDescription}>
              Limits how many game character slots are shown and managed. Your
              database still keeps all characters and versions regardless of
              this setting.
            </p>
          </div>
        </form>
      )}
    </Formik>
  );
};
