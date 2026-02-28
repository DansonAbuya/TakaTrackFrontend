'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBrandingAction, getBrandingBySlugAction, type BrandingResponse } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';

/**
 * White-labeling is per tenant (city). When the user is logged in, branding is loaded for their
 * tenant from /config/branding (JWT schema). Each city = one tenant with its own logo, primary color, name.
 */
type BrandingState = BrandingResponse | null;

interface BrandingContextType {
  branding: BrandingState;
  loading: boolean;
  /** For public pages (e.g. login) when tenant slug is in URL */
  loadPublicBranding: (slug: string) => Promise<void>;
}

const defaultBranding: BrandingResponse = {
  logoUrl: null,
  primaryColor: null,
  contactEmail: null,
  mpesaPaybill: null,
  tenantName: null,
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  loading: false,
  loadPublicBranding: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [branding, setBranding] = useState<BrandingState>(defaultBranding);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setBranding(defaultBranding);
      return;
    }
    setLoading(true);
    getBrandingAction(getAccessToken())
      .then(setBranding)
      .catch(() => setBranding(defaultBranding))
      .finally(() => setLoading(false));
  }, [isAuthenticated, getAccessToken]);

  const loadPublicBranding = async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    try {
      const b = await getBrandingBySlugAction(slug);
      setBranding(b);
    } catch {
      setBranding(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, loadPublicBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}

/** CSS custom property for primary color (white-label). */
export function useBrandingStyles(): React.CSSProperties {
  const { branding } = useBranding();
  const primary = branding?.primaryColor || undefined;
  if (!primary) return {};
  return {
    ['--brand-primary' as string]: primary,
  };
}
