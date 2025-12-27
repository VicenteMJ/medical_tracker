/**
 * Logo mapping utility for insurance providers
 * Maps provider names to logo URLs or placeholder icons
 */

const INSURANCE_LOGO_MAP: Record<string, string> = {
  // Chilean Isapres
  'banmédica': '/icons/insurance-default.svg',
  'banmedica': '/icons/insurance-default.svg',
  'colmena': '/icons/insurance-default.svg',
  'consalud': '/icons/insurance-default.svg',
  'cruzblanca': '/icons/insurance-default.svg',
  'cruz blanca': '/icons/insurance-default.svg',
  'nueva masvida': '/icons/insurance-default.svg',
  'vida tres': '/icons/insurance-default.svg',
  'esencial': '/icons/insurance-default.svg',
  'isalud': '/icons/insurance-default.svg',
  'fundación': '/icons/insurance-default.svg',
  'fundacion': '/icons/insurance-default.svg',
  'cruz del norte': '/icons/insurance-default.svg',
  
  // International providers
  'metlife': '/icons/insurance-default.svg',
  'bice vida': '/icons/insurance-default.svg',
  'consorcio': '/icons/insurance-default.svg',
  'chilena consolidada': '/icons/insurance-default.svg',
  'vida cámara': '/icons/insurance-default.svg',
  'vida camara': '/icons/insurance-default.svg',
  'bci seguros': '/icons/insurance-default.svg',
  'confuturo': '/icons/insurance-default.svg',
  'alemana seguros': '/icons/insurance-default.svg',
  'seguros falabella': '/icons/insurance-default.svg',
  'seguros ripley': '/icons/insurance-default.svg',
  'banco de chile': '/icons/insurance-default.svg',
  'santander': '/icons/insurance-default.svg',
  
  // Default fallback
  'default': '/icons/insurance-default.svg',
}

/**
 * Gets the logo URL for an insurance provider based on provider name
 * @param providerName - The name of the insurance provider
 * @returns The logo URL or a default placeholder
 */
export function getInsuranceLogo(providerName: string): string {
  if (!providerName) {
    return INSURANCE_LOGO_MAP.default
  }

  const normalizedName = providerName.toLowerCase().trim()
  
  // Check for exact match first
  if (INSURANCE_LOGO_MAP[normalizedName]) {
    return INSURANCE_LOGO_MAP[normalizedName]
  }

  // Check for partial matches
  for (const [key, logoUrl] of Object.entries(INSURANCE_LOGO_MAP)) {
    if (key !== 'default' && normalizedName.includes(key)) {
      return logoUrl
    }
  }

  // Return default if no match found
  return INSURANCE_LOGO_MAP.default
}

/**
 * Gets a placeholder icon component for insurance providers
 * This can be used as a fallback when logo URLs are not available
 */
export function getInsurancePlaceholderIcon(): string {
  return INSURANCE_LOGO_MAP.default
}

