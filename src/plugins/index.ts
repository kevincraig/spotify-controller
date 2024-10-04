import { ReactElement } from 'react';

export interface Plugin {
    name: string;
    icon: string;
    component: () => ReactElement;
}

const plugins: Plugin[] = [];

export const registerPlugin = (plugin: Plugin): void => {
    plugins.push(plugin);
};

export const getPlugins = (): Plugin[] => plugins;

// Example plugin usage (create this in a separate file later)
// import { registerPlugin, Plugin } from './index';
// import TidalComponent from '../components/TidalComponent';
//
// const tidalPlugin: Plugin = {
//   name: 'Tidal Integration',
//   icon: 'tidal-icon',
//   component: () => <TidalComponent />,
// };
//
// registerPlugin(tidalPlugin);