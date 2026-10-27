# Web personal de Basilio Montes

Web de una sola página (HTML y CSS, sin frameworks) publicada en GitHub Pages. Como soy QA, la web tiene su propia suite de pruebas: **no se publica ningún cambio si las pruebas fallan**.

## Qué se prueba y por qué

| Prueba | Qué protege |
| --- | --- |
| Muestra el nombre y el puesto | Que la página carga y dice quién soy. |
| Cada enlace interno lleva a una sección que existe | Que el menú no tenga enlaces rotos al renombrar secciones. |
| Los enlaces externos usan https y abren de forma segura | Enlaces sin `http` inseguro y con `rel="noopener"`. |
| Todos los botones de email llevan a la misma dirección válida | Que no quede una dirección antigua en algún botón. |
| El botón de email abre un correo a la dirección correcta | Que el contacto llegue a donde tiene que llegar. |
| Cada proyecto tiene un estado reconocible | Que solo haya un proyecto "en curso" a la vez (la regla del portfolio). |
| Cada proyecto terminado enlaza a su repositorio | Que nada aparezca como terminado sin poder verse. |
| "Volver arriba" lleva al principio de la página | Un fallo real: con la cabecera fija, el enlace apuntaba a la propia cabecera y no hacía nada. |
| El menú marca la sección que se está viendo | Que la navegación indique dónde estás (y solo una sección a la vez). |
| La duración del puesto actual se calcula sola | Que la web no se quede desactualizada (se prueba con el reloj fijado en una fecha futura). |
| En móvil, el menú se abre, lleva a la sección y se cierra | Que la navegación funcione en pantallas pequeñas. |
| No hay scroll horizontal | Que nada se salga de la pantalla en móvil. |
| Pasa la revisión de accesibilidad WCAG 2.1 AA | Contraste, nombres accesibles, estructura (con axe-core). |
| Respeta a quien prefiere menos movimiento | Que la animación del mapa se desactive con `prefers-reduced-motion`. |

Todas se ejecutan en escritorio (Chrome) y en móvil (Pixel 7).

**Decisión:** no compruebo que LinkedIn o GitHub respondan. Esos sitios bloquean peticiones automáticas y la prueba fallaría por motivos ajenos a la web. Compruebo lo que sí depende de mí: el formato y la seguridad de los enlaces.

**Lo que ya encontraron las pruebas:** en la primera ejecución, axe detectó que el logo "BM" tenía un nombre accesible que no incluía su texto visible (`label-content-name-mismatch`). Corregido antes de publicar.

## Ejecutar en local

```bash
npm install
npx playwright install chromium
npm test
npm run serve       # la web en http://localhost:4173
```

## Publicación

El workflow `.github/workflows/pages.yml` ejecuta las pruebas en cada push y pull request. Solo si pasan, publica la carpeta `site/` en GitHub Pages. Requiere activar en el repositorio *Settings → Pages → Source: GitHub Actions*.

## Estructura

```
site/          la web (index.html, styles.css, favicon.svg)
tests/         las pruebas de Playwright
.github/       el workflow que prueba y publica
```
