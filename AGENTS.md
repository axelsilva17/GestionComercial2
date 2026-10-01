# GestionComercial2 — Agent Contract

Project identity: `GestionComercial2` (Desktop/GestionComercial2).
Design contract: `DESIGN.md` (verified 366 líneas, audit contrast pasado).
Frontend design task: `odd/tasks/frontend-design-system.md` (T1-T7 verificados, T8 pendiente: responsive browser).

## Agent roles

- `gentle-ai` / `gentle-pi`: orquestación del proyecto, reviews, delegación.
- `opencode` CLI V2 (`v2.0.21` en `.opencode/bin/`): ejecución directa (no integrado con Pi por `opencode-pi` bug `.map()` — ver `opencode-pi` docs).
- `openrouter/free`: modelos gratis vía Pi (`pi --model openrouter/free`). Cuenta con créditos limitados (~38K tokens restantes).

## Skill references

- `frontend-design-system.md`: contrato de tokens (`accent-strong` `#047857`, `line-control` `#64748B`, etc.).
- `frontend-seo` (skill.sh / `skillsdirectory.com`): sistema SEO portable para Vite/React — constante única (`services/seo/constants.js`), meta derivada por ruta, sitemap y robots generados desde manifest, `lang="es"`, contraste mínimo 4.5:1.
- `theme-factory`: si se aplica un tema visual adicional (no usado actualmente; tokens propios en `DESIGN.md`).

## Commands working

```bash
opencode --version        # V2: 2.0.21
opencode --prompt "..." --standalone  # ejecución directa (TUI interactiva)
pi --model openrouter/free "..."      # gratis con Pi (créditos bajos)
pi --model openrouter/~deepseek/deepseek-v4-flash-latest "..."  # con billing
```

## Constraints

- UI en español; código en inglés.
- `DESIGN.md` es autoridad para tokens; cualquier desviación debe corregirse en documento + código antes de considerar T8 cerrado.
- No modificar `.cs` ni `.csproj` (out of scope del diseño frontend).
- Backend (`API/Domain/Infra/App`) se trata como cambio independiente; mock layer aislada en `src/data/`.

## Pending

- T8 responsive verification (375 / 768 / 1024 / 1440, navegador real, no observado aún).
- `opencode-pi` bug pendiente de parche upstream (`message.content.map`).
- SEO section agregado a `DESIGN.md` (407 líneas) con constante única, meta derivada, sitemap/robots, `lang="es"`, integración con tokens.
---
### Principios de diseño (registrados por usuario)
- Respetar patrones de diseño decididos (Clean Architecture, tokens DESIGN.md).
- Comentarios solo necesarios; evitar exceso.
- Respetar siempre la arquitectura aplicada (capa separada, sin mezclar Domain/App/Infra/API).
- No modificar .cs de desktop terminado (GestionComercial).
