/** Single source of truth for where each role lands after sign-in. */
export const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  VENDOR: "/vendor/dashboard",
  CUSTOMER: "/customer/vendors",
};

export function roleHome(role?: string | null): string {
  return (role && ROLE_HOME[role]) || "/customer/dashboard";
}

/** Canonical forward flow of an order (index order matters). */
export const ORDER_FLOW = [
  "PENDING",
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export function statusIndex(status: string): number {
  return (ORDER_FLOW as readonly string[]).indexOf(status);
}
