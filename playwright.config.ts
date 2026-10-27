import { defineConfig, devices } from '@playwright/test';

// La web se sirve en local desde la carpeta site/ antes de ejecutar las pruebas.
// Se prueba en escritorio y en un móvil, porque los fallos de maquetación suelen aparecer en pantallas estrechas.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // sin reintentos: si una prueba falla, queremos saberlo, no esconderlo
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Opcional: usar un Chrome ya instalado (CHROME_PATH=/ruta/al/chrome npm test).
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
