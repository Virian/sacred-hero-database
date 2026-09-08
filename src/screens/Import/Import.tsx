import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const Import = () => {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  const greet = async () => {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke('read_save_file', { path: name });
    setGreetMsg(await invoke('greet', { name }));
  };

  return (
    <div>
      <h1>Welcome to Tauri + React</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </div>
  );
};
