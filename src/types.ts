/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: {
    en: string;
    ur: string; // Roman Urdu
  };
  price: string;
  /** e.g. "15-20 min" */
  prepTime?: string;
  calories?: string | number;
  isBestseller?: boolean;
  /** 1 = mild, 2 = medium, 3 = hot; from AI estimate */
  spiceLevel?: 1 | 2 | 3;
}

export interface MenuCategory {
  title: {
    en: string;
    ur: string;
  };
  items: MenuItem[];
}

export type Language = 'en' | 'ur';

/** A line in the in-app "Current Order"; merge repeated adds by `item.id` in the cart. */
export interface OrderLine {
  item: MenuItem;
  quantity: number;
}
