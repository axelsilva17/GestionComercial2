# Backend Reuse — RDD (ODD, SDD: NO)

Date: 2026-10-01
Task: Review desktop services for web reuse (Rest API / Clean Architecture).
Status: DECISIÓN CONFIRMADA — Opción B (Clave) + integraciones + módulo Envío. Implementación pendiente confirmación integraciones

## Source review (desktop /c/Users/Usuario/Desktop/GestionComercial/)

| Service | Quality | Reuse verdict (web) | Notes |
|---|---|---|---|
| ClienteServicio | High | Full | FluentValidation + IUnitOfWork; null-safe session; reusable without SesionServicio |
| ProductoServicio | High | Full | Same pattern; import guard available |
| VentaServicio | Complex | Partial | PaymentStrategyFactory + IServicioImpresion + SesionServicio + IInventarioServicio + ILogger — must simplify for stateless REST |
| StockServicio | Pending | Verify | Read required |
| AutenticacionServicio | Verify | Verify | AuthAdapter + JWT already configured in Program.cs |

## Patterns confirmed reusable
- FluentValidation (validators with null-default injection)
- NegocioException / ProductoNoEncontradoException / AutenticacionException
- DTOs: PagedResult, ClientesDTO, ProductosDTO, VentasDTO
- Importación: ImportGuardRule, ImportacionSchema, ImportacionNormalizacion
- JWT auth (already in Program.cs)

## Web-context differences (not reuse defects)
- SesionServicio → not applicable (stateless REST; session state via JWT claims or client)
- IServicioImpresion → not applicable (thermal printing desktop-only)
- PaymentStrategyFactory → simplify to direct service or adapter; factory adds overhead for REST
- IUnitOfWork → keep, but consider repository + EF Core direct if REST needs simpler query control

## Decision needed (one focused)
Which subset of desktop services to reuse for the web REST layer?
Option A: All 5 (Cliente, Producto, Venta, Stock, Auth) — full replay.
Option B: Key entities only (Cliente, Producto, Venta + Auth) — faster, excludes Stock/import.
Option C: Minimal (Cliente, Producto) + custom Venta (simplified).

Also: simplify VentaServicio dependencies (drop Impresion, simplify Factory) — approve?

## SDD: explicitly NO (per user instruction)
Architecture: Clean Architecture (API / Application / Domain / Infrastructure). No SDD ceremony.

## Verification (to apply after decision)
- `git` branch from `master`
- `dotnet build` / `dotnet test` on `GestionComercial2`
- `npm run build` / `npm run lint` on `gestioncomercial-web` (T8 browser still open)
- `AGENTS.md` references `DESIGN.md` and `frontend-design-system.md` as contracts.
Nuevo módulo: Envío (envío/shipping) — independiente de Servicios desktop, requiere contrato REST, DTO, Controller
Integraciones a considerar: pago (gateway), email/SMS, inventario externo, reportes, envío/logística
Patrón: cada integración = servicio aislado (como desktop Importación), con adapter si es externo
Program.cs actualizado (registración servicios + V2 CLI configurado)
Controllers REST (Cliente, Producto, Venta simplificado, Envio) creados
DTO Envio creado
- Diseño: patrones decididos respetados (Clean Arch, B confirmada, SDD NO). Comentarios mínimos.
