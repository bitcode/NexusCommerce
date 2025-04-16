/**
 * PlanConfig.ts
 * Manages Shopify plan configuration and associated rate limits.
 * Allows for manual updates to the plan and provides plan-specific thresholds.
 */
export type ShopifyPlan = 'standard' | 'advanced' | 'plus' | 'enterprise';
export interface PlanRateLimits {
    pointsPerSecond: number;
    maxSingleQueryCost: number;
    restoreRate: number;
}
export interface PlanConfigOptions {
    initialPlan?: ShopifyPlan;
    storageKey?: string;
    persistConfig?: boolean;
    onPlanChange?: (plan: ShopifyPlan, limits: PlanRateLimits) => void;
}
export declare class PlanConfig {
    private currentPlan;
    private storageKey;
    private persistConfig;
    private onPlanChange?;
    private static PLAN_RATE_LIMITS;
    constructor(options?: PlanConfigOptions);
    /**
     * Gets the current Shopify plan
     */
    getCurrentPlan(): ShopifyPlan;
    /**
     * Gets the rate limits for the current plan
     */
    getCurrentRateLimits(): PlanRateLimits;
    /**
     * Gets the rate limits for a specific plan
     */
    getRateLimitsForPlan(plan: ShopifyPlan): PlanRateLimits;
    /**
     * Updates the current Shopify plan
     */
    updatePlan(plan: ShopifyPlan): void;
    /**
     * Gets all available Shopify plans and their rate limits
     */
    getAllPlans(): Record<ShopifyPlan, PlanRateLimits>;
    /**
     * Calculates the warning threshold for approaching rate limits (80% by default)
     */
    getWarningThreshold(percentage?: number): number;
    /**
     * Saves the current plan configuration to storage
     */
    private saveToStorage;
    /**
     * Loads plan configuration from storage
     * Returns true if successful, false otherwise
     */
    private loadFromStorage;
}
