import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pacena.distribuidora',
  appName: 'Paceña Móvil Vendedor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
