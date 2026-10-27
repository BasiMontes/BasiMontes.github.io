import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Pruebas de la propia web. Cada una protege algo que, si se rompe, nadie lo notaría a simple vista.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('muestra el nombre y el puesto', async ({ page }) => {
  await expect(page).toHaveTitle(/Basilio Montes/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Basilio Montes');
  await expect(page.locator('.role')).toContainText('QA Engineer');
});

test('cada enlace interno lleva a una sección que existe', async ({ page }) => {
  const hrefs = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href')!),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of new Set(hrefs)) {
    await expect(page.locator(href), `no existe el destino de ${href}`).toHaveCount(1);
  }
});

// Decisión: no se comprueba que LinkedIn o GitHub respondan, porque bloquean peticiones
// automáticas y la prueba fallaría por motivos ajenos a la web. Se comprueba lo que sí depende de mí:
// que los enlaces externos usen https y abran en otra pestaña de forma segura.
test('los enlaces externos usan https y abren de forma segura', async ({ page }) => {
  const external = page.locator('a[href^="http"]');
  const count = await external.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const link = external.nth(i);
    const href = await link.getAttribute('href');
    expect(href, 'enlace sin https').toMatch(/^https:\/\//);
    await expect(link, `${href} debe abrir en otra pestaña`).toHaveAttribute('target', '_blank');
    await expect(link, `${href} debe llevar rel="noopener"`).toHaveAttribute('rel', /noopener/);
  }
});

test('todos los botones de email llevan a la misma dirección válida', async ({ page }) => {
  const hrefs = await page.locator('a[href^="mailto:"]').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href')!),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs).size, 'hay direcciones de email distintas en la página').toBe(1);
  expect(hrefs[0]).toMatch(/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
});

test('cada proyecto tiene un estado reconocible', async ({ page }) => {
  const projects = page.locator('.project');
  expect(await projects.count()).toBeGreaterThan(0);
  const allowed = ['en-curso', 'terminado'];
  for (const project of await projects.all()) {
    expect(allowed).toContain(await project.getAttribute('data-status'));
    await expect(project.locator('.status')).not.toBeEmpty();
  }
  // Solo puede haber un proyecto en curso: es la regla del portfolio.
  await expect(page.locator('.project[data-status="en-curso"]')).toHaveCount(1);
});

test('cada proyecto terminado enlaza a su repositorio en GitHub', async ({ page }) => {
  for (const project of await page.locator('.project[data-status="terminado"]').all()) {
    await expect(project.locator('a[href^="https://github.com/BasiMontes/"]')).toHaveCount(1);
  }
});

test('el botón de email abre un correo a la dirección de Gmail', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Enviar un email' })).toHaveAttribute(
    'href',
    'mailto:basilio.montescastano@gmail.com',
  );
});

test('el menú marca la sección que se está viendo', async ({ page, isMobile }) => {
  test.skip(isMobile, 'en móvil el menú está plegado');
  await page.locator('#formacion').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById('formacion')!.scrollIntoView({ block: 'center' }));
  await expect(page.locator('#menu a[href="#formacion"]')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('#menu a[aria-current]')).toHaveCount(1);
});

test('el nombre de la cabecera solo aparece al dejar atrás el inicio', async ({ page }) => {
  const headerName = page.locator('.me-name');
  await expect(headerName).not.toHaveClass(/shown/);
  await page.locator('#experiencia').scrollIntoViewIfNeeded();
  await expect(headerName).toHaveClass(/shown/);
  // Aunque esté oculto visualmente, el enlace de la cabecera conserva su nombre accesible.
  await expect(page.locator('a.me')).toHaveAccessibleName(/Basilio Montes/);
});

test('"Volver arriba" lleva al principio de la página', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: 'Volver arriba' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('la duración del puesto actual se calcula sola', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2027-03-15T10:00:00'));
  await page.reload();
  // De octubre de 2023 a marzo de 2027, contando ambos meses: 3 años y 6 meses.
  await expect(page.locator('#exp-knowmad .dur')).toHaveText('3 años 6 meses');
});

test('en móvil, el menú se abre, lleva a la sección y se cierra', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'el menú desplegable solo existe en móvil');
  const button = page.getByRole('button', { name: 'Menú' });
  await expect(page.locator('#menu')).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#menu').getByRole('link', { name: 'Formación' }).click();
  await expect(page.locator('#menu')).toBeHidden();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#formacion')).toBeInViewport();
});

test('no hay scroll horizontal', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'la página es más ancha que la pantalla').toBeLessThanOrEqual(0);
});

test('pasa la revisión de accesibilidad WCAG 2.1 AA', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('respeta a quien prefiere menos movimiento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const animation = await page
    .locator('.map .c')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe('none');
});
