import type { FormikErrors } from 'formik';

import { isValidPath } from './isValidPath';
import type { FormValues } from './Settings.types';

export const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.installationPath) {
    errors.installationPath = 'Installation path is required.';
  } else if (!isValidPath(values.installationPath)) {
    errors.installationPath = 'Installation path must be a valid path.';
  }

  return errors;
};
