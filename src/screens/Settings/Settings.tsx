import { Formik, type FormikErrors } from 'formik';
import { X, Save } from 'lucide-react';

import { Button, Input, RadioGroup } from '../../components';
import { isValidPath } from './isValidPath';
import styles from './Settings.module.scss';

interface FormValues {
  installationPath: string;
  activeCharacterSlots: string;
}

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.installationPath) {
    errors.installationPath = 'Installation path is required.';
  } else if (!isValidPath(values.installationPath)) {
    errors.installationPath = 'Installation path must be a valid path.';
  }

  return errors;
};

export const Settings = () => {
  const saveSettings = (values: FormValues) => {
    console.log('submit', values);
  };

  return (
    <Formik<FormValues>
      initialValues={{ installationPath: '', activeCharacterSlots: '8' }}
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
              <Button variant="secondary">Browse...</Button>
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
              options={[
                { label: '8 slots (Sacred Underworld)', value: '8' },
                { label: '6 slots (Sacred Plus Compatibility)', value: '6' },
              ]}
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
