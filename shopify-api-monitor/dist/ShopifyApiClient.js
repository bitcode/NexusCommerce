"use strict";
/**
 * ShopifyApiClient.ts
 * Centralized service for all Shopify Admin GraphQL API calls,
 * real-time rate limit monitoring, and automated throttling/backoff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyApiClient = void 0;
const graphql_request_1 = require("graphql-request");
class ShopifyApiClient {
    constructor(options) {
        this.options = options;
        const apiVersion = options.apiVersion || '2023-10';
        this.plan = options.plan || 'standard';
        this.onRateLimitApproaching = options.onRateLimitApproaching;
        this.onThrottled = options.onThrottled;
        this.client = new graphql_request_1.GraphQLClient(`https://${options.shop}/admin/api/${apiVersion}/graphql.json`, {
            headers: {
                'X-Shopify-Access-Token': options.accessToken,
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Executes a GraphQL query/mutation with rate limit monitoring and backoff.
     */
    async request(document, variables) {
        var _a, _b, _c, _d, _e, _f;
        let attempt = 0;
        const maxAttempts = 5;
        let lastThrottleStatus;
        while (attempt < maxAttempts) {
            try {
                // Ensure document is a string (GraphQLClient expects string, not DocumentNode)
                const queryString = typeof document === 'string' ? document : (_b = (_a = document.loc) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.body;
                if (!queryString) {
                    throw new Error('GraphQL query must be a string or have a loc.source.body property.');
                }
                const response = await this.client.rawRequest(queryString, variables);
                const cost = (_c = response.extensions) === null || _c === void 0 ? void 0 : _c.cost;
                if (cost && cost.throttleStatus) {
                    lastThrottleStatus = cost.throttleStatus;
                    this.lastThrottleStatus = cost.throttleStatus;
                    this.handleRateLimit(cost.throttleStatus);
                }
                return {
                    data: response.data,
                    errors: response.errors,
                    extensions: { cost },
                };
            }
            catch (error) {
                // Check for throttling in error response
                const isThrottled = ((_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.errors) === null || _e === void 0 ? void 0 : _e.some((e) => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === 'THROTTLED'; })) || ((_f = error === null || error === void 0 ? void 0 : error.response) === null || _f === void 0 ? void 0 : _f.status) === 429;
                if (isThrottled && lastThrottleStatus) {
                    if (this.onThrottled)
                        this.onThrottled(lastThrottleStatus);
                    const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
                    await new Promise((res) => setTimeout(res, backoff));
                    attempt++;
                    continue;
                }
                throw error;
            }
        }
        throw new Error('Max retry attempts reached for Shopify API request.');
    }
    /**
     * Handles rate limit events and triggers notifications if thresholds are crossed.
     */
    handleRateLimit(status) {
        const planKey = this.plan || 'standard';
        const threshold = Math.floor(ShopifyApiClient.RATE_LIMIT_THRESHOLDS[planKey] * 0.8);
        if (status.currentlyAvailable < threshold && this.onRateLimitApproaching) {
            this.onRateLimitApproaching(status);
        }
    }
    /**
     * Returns the last known throttle status.
     */
    getLastThrottleStatus() {
        return this.lastThrottleStatus;
    }
    /**
     * Allows updating the Shopify plan (affects thresholds).
     */
    setPlan(plan) {
        this.plan = plan;
    }
}
exports.ShopifyApiClient = ShopifyApiClient;
ShopifyApiClient.RATE_LIMIT_THRESHOLDS = {
    standard: 100,
    advanced: 200,
    plus: 1000,
    enterprise: 2000,
};
//# sourceMappingURL=ShopifyApiClient.js.map