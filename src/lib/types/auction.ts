/**
 * Auction Types
 * Type definitions for auction house-related data structures
 */

import type { ItemTemplate } from './item';

export interface AuctionListing {
	id: number;
	seller_id: number;
	item_template_id: number;
	quantity: number;
	price_per_unit: number;
	status: AuctionStatus;
	buyer_id: number | null;
	created_at: number;
	expires_at: number;
	sold_at: number | null;
}

export type AuctionStatus = 'active' | 'sold' | 'expired' | 'cancelled';

export interface AuctionListingWithDetails {
	listing: AuctionListing;
	item: ItemTemplate;
	seller_name: string;
	buyer_name: string | null;
	time_remaining_ms: number;
	is_expired: boolean;
}

export interface CreateAuctionListingRequest {
	seller_id: number;
	item_template_id: number;
	quantity: number;
	price_per_unit: number;
	duration_hours: number;
}

export interface PurchaseAuctionRequest {
	listing_id: number;
	buyer_id: number;
}

export interface CancelAuctionRequest {
	listing_id: number;
	seller_id: number;
}

export interface AuctionSearchFilters {
	item_type?: string;
	rarity?: string;
	min_level?: number;
	max_level?: number;
	min_price?: number;
	max_price?: number;
	seller_name?: string;
	sort_by?: 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc';
}

export interface AuctionMarketData {
	item_template_id: number;
	average_price: number;
	median_price: number;
	lowest_price: number;
	highest_price: number;
	total_listings: number;
	sales_last_24h: number;
}

/**
 * Calculate time remaining in milliseconds
 */
export function getTimeRemaining(expiresAt: number): number {
	return Math.max(0, expiresAt * 1000 - Date.now());
}

/**
 * Check if listing is expired
 */
export function isExpired(expiresAt: number): boolean {
	return getTimeRemaining(expiresAt) === 0;
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
	if (ms === 0) return 'Expired';

	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ${hours % 24}h`;
	if (hours > 0) return `${hours}h ${minutes % 60}m`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
	return `${seconds}s`;
}

/**
 * Calculate total price
 */
export function calculateTotalPrice(pricePerUnit: number, quantity: number): number {
	return pricePerUnit * quantity;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
	if (price >= 1000000) {
		return `${(price / 1000000).toFixed(1)}M`;
	}
	if (price >= 1000) {
		return `${(price / 1000).toFixed(1)}K`;
	}
	return price.toString();
}

/**
 * Calculate listing fee (2.5% of price)
 */
export function calculateListingFee(totalPrice: number): number {
	return Math.floor(totalPrice * 0.025);
}

/**
 * Calculate auction house cut (5% of sale price)
 */
export function calculateAuctionCut(totalPrice: number): number {
	return Math.floor(totalPrice * 0.05);
}

/**
 * Calculate seller proceeds after auction cut
 */
export function calculateSellerProceeds(totalPrice: number): number {
	return totalPrice - calculateAuctionCut(totalPrice);
}

/**
 * Get status display text
 */
export function getStatusText(status: AuctionStatus): string {
	const texts: Record<AuctionStatus, string> = {
		active: 'Active',
		sold: 'Sold',
		expired: 'Expired',
		cancelled: 'Cancelled'
	};
	return texts[status];
}

/**
 * Get status color class
 */
export function getStatusColor(status: AuctionStatus): string {
	const colors: Record<AuctionStatus, string> = {
		active: 'text-green-11',
		sold: 'text-blue-11',
		expired: 'text-gray-11',
		cancelled: 'text-red-11'
	};
	return colors[status];
}
