import { homedir } from 'node:os';
import { AppConfig } from './types';

let _config: AppConfig = {
	port: 7435,
	dataDir: `${homedir()}/.local/state/tabmanager-server`,
}

export function config(): AppConfig {
	return _config;
}

// TODO add a way to set config items
