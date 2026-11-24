/** Public barrel for shared UI. Feature teams import from `src/components`. */

// ui primitives
export { Button } from './ui/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './ui/Button';
export { Input } from './ui/Input';
export type { InputProps } from './ui/Input';
export { Select } from './ui/Select';
export type { SelectProps, SelectOption } from './ui/Select';
export { Modal } from './ui/Modal';
export type { ModalProps, ModalSize } from './ui/Modal';
export { Table } from './ui/Table';
export type { TableProps, TableColumn } from './ui/Table';
export { Badge } from './ui/Badge';
export type { BadgeProps, BadgeVariant } from './ui/Badge';
export { Avatar } from './ui/Avatar';
export type { AvatarProps, AvatarSize } from './ui/Avatar';
export { StatCard } from './ui/StatCard';
export type { StatCardProps, StatCardTone } from './ui/StatCard';
export { EmptyState } from './ui/EmptyState';
export type { EmptyStateProps } from './ui/EmptyState';

// layout
export { DashboardLayout } from './layout/DashboardLayout';
export { PageHeader } from './layout/PageHeader';
export type { PageHeaderProps, BreadcrumbItem } from './layout/PageHeader';

// navigation
export { Sidebar } from './navigation/Sidebar';
export { Header } from './navigation/Header';

// feedback
export { Toaster } from './feedback/Toast';

// common
export { FeaturePlaceholder } from './common/FeaturePlaceholder';
