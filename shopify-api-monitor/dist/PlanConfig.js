"use strict";
/**
 * PlanConfig.ts
 * Manages Shopify plan configuration and associated rate limits.
 * Allows for manual updates to the plan and provides plan-specific thresholds.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanConfig = void 0;
class PlanConfig {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'shopify-plan-config';
        this.persistConfig = options.persistConfig !== undefined ? options.persistConfig : true;
        this.onPlanChange = options.onPlanChange;
        // Try to load from storage first if persistence is enabled
        if (this.persistConfig && this.loadFromStorage()) {
            // Successfully loaded from storage
        }
        else {
            // Use provided initial plan or default to standard
            this.currentPlan = options.initialPlan || 'standard';
            // Save initial config if persistence is enabled
            if (this.persistConfig) {
                this.saveToStorage();
            }
        }
    }
    /**
     * Gets the current Shopify plan
     */
    getCurrentPlan() {
        return this.currentPlan;
    }
    /**
     * Gets the rate limits for the current plan
     */
    getCurrentRateLimits() {
        return PlanConfig.PLAN_RATE_LIMITS[this.currentPlan];
    }
    /**
     * Gets the rate limits for a specific plan
     */
    getRateLimitsForPlan(plan) {
        return PlanConfig.PLAN_RATE_LIMITS[plan];
    }
    /**
     * Updates the current Shopify plan
     */
    updatePlan(plan) {
        if (this.currentPlan !== plan) {
            this.currentPlan = plan;
            // Persist the change if enabled
            if (this.persistConfig) {
                this.saveToStorage();
            }
            // Notify listeners if callback is provided
            if (this.onPlanChange) {
                this.onPlanChange(plan, PlanConfig.PLAN_RATE_LIMITS[plan]);
            }
        }
    }
    /**
     * Gets all available Shopify plans and their rate limits
     */
    getAllPlans() {
        return { ...PlanConfig.PLAN_RATE_LIMITS };
    }
    /**
     * Calculates the warning threshold for approaching rate limits (80% by default)
     */
    getWarningThreshold(percentage = 80) {
        const limits = this.getCurrentRateLimits();
        return Math.floor(limits.pointsPerSecond * (percentage / 100));
    }
    /**
     * Saves the current plan configuration to storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    plan: this.currentPlan,
                    updatedAt: new Date().toISOString(),
                }));
            }
        }
        catch (error) {
            console.error('Failed to save plan configuration to storage:', error);
        }
    }
    /**
     * Loads plan configuration from storage
     * Returns true if successful, false otherwise
     */
    loadFromStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const config = JSON.parse(stored);
                    if (config.plan && PlanConfig.PLAN_RATE_LIMITS[config.plan]) {
                        this.currentPlan = config.plan;
                        return true;
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load plan configuration from storage:', error);
        }
        return false;
    }
}
exports.PlanConfig = PlanConfig;
// Rate limits by plan according to Shopify documentation
PlanConfig.PLAN_RATE_LIMITS = {
    standard: {
        pointsPerSecond: 100,
        maxSingleQueryCost: 1000, // This is a global limit for all plans
        restoreRate: 100,
    },
    advanced: {
        pointsPerSecond: 200,
        maxSingleQueryCost: 1000,
        restoreRate: 200,
    },
    plus: {
        pointsPerSecond: 1000,
        maxSingleQueryCost: 1000,
        restoreRate: 1000,
    },
    enterprise: {
        pointsPerSecond: 2000,
        maxSingleQueryCost: 1000,
        restoreRate: 2000,
    },
};
//# sourceMappingURL=PlanConfig.js.map