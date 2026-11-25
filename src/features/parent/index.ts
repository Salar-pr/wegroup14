/**
 * Public entry point for the Parent (اولیا) feature.
 *
 * The app router mounts this default export under `/parent/*`:
 *   const ParentApp = lazy(() => import('../features/parent'));
 * Wrap it in <DashboardLayout /> via the existing RequireRole route.
 */
export { default } from './ParentApp';
export { default as ParentApp } from './ParentApp';
