
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with the given locale and currency code
 * @param amount The amount to format
 * @param locale The locale to use for formatting (default: 'es-MX')
 * @param currency The currency code to use (default: 'MXN')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  locale = 'es-MX', 
  currency = 'MXN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
