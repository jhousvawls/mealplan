import type { GroceryItem } from '../types';

export interface WalmartExportOptions {
  includeQuantities?: boolean;
  optimizeForMobile?: boolean;
  storeLocation?: string;
}

export class WalmartIntegrationService {
  /**
   * Formats grocery items for Walmart search
   */
  static formatGroceryListForWalmart(
    items: GroceryItem[],
    options: WalmartExportOptions = {}
  ): string {
    const { includeQuantities = true, optimizeForMobile = true } = options;

    // Filter out empty items and format for search
    const formattedItems = items
      .filter(item => item.item && item.item.trim())
      .map(item => {
        let searchTerm = item.item.trim();
        
        // Add quantity if requested and available
        if (includeQuantities && item.quantity) {
          searchTerm = `${item.quantity} ${searchTerm}`;
        }
        
        // Clean up special characters that might break URLs
        searchTerm = searchTerm.replace(/[^\w\s-]/gi, '');
        
        return searchTerm;
      })
      .filter(term => term.length > 0);

    // For mobile, limit the number of items to avoid overly long URLs
    const maxItems = optimizeForMobile ? 10 : 20;
    const limitedItems = formattedItems.slice(0, maxItems);

    return limitedItems.join(' ');
  }

  /**
   * Generates Walmart search URL from grocery items
   */
  static generateWalmartSearchUrl(
    items: GroceryItem[],
    options: WalmartExportOptions = {}
  ): string {
    const searchTerms = this.formatGroceryListForWalmart(items, options);
    
    if (!searchTerms) {
      throw new Error('No valid grocery items to export');
    }

    const baseUrl = 'https://www.walmart.com/search';
    const encodedTerms = encodeURIComponent(searchTerms);
    
    // Add department filter for grocery items
    const params = new URLSearchParams({
      q: searchTerms,
      cat_id: '976759' // Grocery department ID
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Opens Walmart with the grocery list
   */
  static openWalmartWithList(
    items: GroceryItem[],
    options: WalmartExportOptions = {}
  ): void {
    try {
      const url = this.generateWalmartSearchUrl(items, options);
      
      // Detect mobile and try to open in app first
      if (this.isMobileDevice()) {
        // Try to open in Walmart app first, fallback to web
        window.location.href = url;
      } else {
        // Open in new tab for desktop
        window.open(url, '_blank', 'noopener,noreferrer');
      }

      // Track the export for analytics
      this.trackWalmartExport(items.length);
    } catch (error) {
      console.error('Failed to open Walmart with grocery list:', error);
      throw error;
    }
  }

  /**
   * Generates a formatted text list for manual copying
   */
  static generateTextList(items: GroceryItem[]): string {
    return items
      .filter(item => item.item && item.item.trim())
      .map(item => {
        const quantity = item.quantity ? `${item.quantity} ` : '';
        const notes = item.notes ? ` (${item.notes})` : '';
        return `• ${quantity}${item.item}${notes}`;
      })
      .join('\n');
  }

  /**
   * Copies grocery list to clipboard as formatted text
   */
  static async copyToClipboard(items: GroceryItem[]): Promise<void> {
    const textList = this.generateTextList(items);
    
    if (!textList) {
      throw new Error('No items to copy');
    }

    try {
      await navigator.clipboard.writeText(textList);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Validates grocery items before export
   */
  static validateGroceryItems(items: GroceryItem[]): {
    isValid: boolean;
    errors: string[];
    validItems: GroceryItem[];
  } {
    const errors: string[] = [];
    const validItems: GroceryItem[] = [];

    if (!items || items.length === 0) {
      errors.push('No grocery items provided');
      return { isValid: false, errors, validItems };
    }

    items.forEach((item, index) => {
      if (!item.item || !item.item.trim()) {
        errors.push(`Item ${index + 1} is empty`);
      } else {
        validItems.push(item);
      }
    });

    if (validItems.length === 0) {
      errors.push('No valid items found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      validItems
    };
  }

  /**
   * Detects if user is on mobile device
   */
  private static isMobileDevice(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  /**
   * Tracks Walmart export for analytics
   */
  private static trackWalmartExport(itemCount: number): void {
    // Track the export event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'grocery_export', {
        event_category: 'grocery',
        event_label: 'walmart',
        value: itemCount
      });
    }

    // Console log for development
    console.log(`Exported ${itemCount} items to Walmart`);
  }

  /**
   * Gets user preferences for Walmart integration
   */
  static getUserPreferences(): WalmartExportOptions {
    try {
      const stored = localStorage.getItem('walmart_preferences');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Saves user preferences for Walmart integration
   */
  static saveUserPreferences(preferences: WalmartExportOptions): void {
    try {
      localStorage.setItem('walmart_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save Walmart preferences:', error);
    }
  }
}

export default WalmartIntegrationService;
