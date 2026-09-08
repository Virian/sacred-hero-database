import { Button, Input, RadioGroup } from '../../components';
import { useState } from 'react';
import styles from './Settings.module.scss';

export const Settings = () => {
  const [installationPath, setInstallationPath] = useState('');
  const [activeCharacterSlots, setActiveCharacterSlots] = useState('8');

  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Game installation path</h2>
        <div className={styles.installationPathRow}>
          <Input
            id="installationPath"
            name="installationPath"
            className={styles.installationPathInput}
            placeholder="Enter game installation path..."
            value={installationPath}
            onChange={(event) => setInstallationPath(event.target.value)}
          />
          <Button variant="secondary">Browse...</Button>
        </div>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active character slots</h2>
        <RadioGroup
          name="activeCharacterSlots"
          value={activeCharacterSlots}
          onChange={(event) => setActiveCharacterSlots(event.target.value)}
          options={[
            { label: '8 slots (Sacred Underworld)', value: '8' },
            { label: '6 slots (Sacred Plus Compatibility)', value: '6' },
          ]}
        />
        <p className={styles.activeCharacterSlotsDescription}>
          Limits how many game character slots are shown and managed. Your
          database still keeps all characters and versions regardless of this
          setting.
        </p>
      </div>
    </div>
  );
};
