/** Decode JWT payload without verification (client-side only; used for display). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Map backend role (e.g. PLATFORM_ADMIN) to frontend UserRole (platform_admin). */
export function backendRoleToFrontend(role: string): string {
  if (!role) return 'resident';
  return role.toLowerCase();
}
