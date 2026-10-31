# Facts (authoritative — from the codebase and the human)

- F1 [user]: Frontend only. Backend, database and environment belong to other roles (R17).
- F2 [user]: Mock data only until the backend exists.
- F3 [calc: package.json]: React 19.3.1, react-router 8.5.1, Vite 8.3.5, Tailwind 4.3.3, Vitest 5.0.5.
- F4 [calc: src/presentation/app/App.tsx]: routes: /login; panel (guarded): /, /horario, /pedidos, /carta, /stock, /clientes, /informes, /consola, /cocina, /ajustes; any other path → /.
- F5 [calc: src/infrastructure/mock/mock-session-store.ts]: session kept in sessionStorage under key barpraza.mockSession.
- F6 [calc: frontend/vite.config.ts]: coverage thresholds 95 % (statements, branches, functions, lines).
- F7 [calc: npm test, 2026-10-31]: 56 files, 304 tests passing.
- F8 [user, 2026-10-31]: the dev server is port 5173, not 3000.
- F9 [calc: git]: the project is not a git repository.
