import { logger } from '../utils/logger';

export interface RateLimiterConfig {
  minDelay: number; // Minimum delay between requests in milliseconds
  maxConcurrent: number; // Maximum concurrent requests
  burstLimit: number; // Maximum requests in burst window
  burstWindow: number; // Burst window duration in milliseconds
}

export class RequestRateLimiter {
  private lastRequestTime: number = 0;
  private activeRequests: number = 0;
  private requestQueue: Array<() => void> = [];
  private requestHistory: number[] = [];
  
  private config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      minDelay: 2000, // 2 seconds minimum between requests
      maxConcurrent: 2, // Maximum 2 concurrent requests
      burstLimit: 5, // Maximum 5 requests in burst window
      burstWindow: 60000, // 1 minute burst window
      ...config,
    };

    logger.info('Rate limiter initialized:', this.config);
  }

  /**
   * Wait for the next request to be allowed
   */
  async waitForNextRequest(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      
      // Check if we're within concurrent request limit
      if (this.activeRequests >= this.config.maxConcurrent) {
        logger.debug('Concurrent request limit reached, queuing request');
        this.requestQueue.push(resolve);
        return;
      }

      // Check burst limit
      this.cleanupRequestHistory(now);
      if (this.requestHistory.length >= this.config.burstLimit) {
        const oldestRequest = this.requestHistory[0];
        const waitTime = this.config.burstWindow - (now - oldestRequest);
        
        if (waitTime > 0) {
          logger.debug(`Burst limit reached, waiting ${waitTime}ms`);
          setTimeout(() => {
            this.waitForNextRequest().then(resolve);
          }, waitTime);
          return;
        }
      }

      // Check minimum delay
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.config.minDelay) {
        const waitTime = this.config.minDelay - timeSinceLastRequest;
        logger.debug(`Minimum delay not met, waiting ${waitTime}ms`);
        
        setTimeout(() => {
          this.executeRequest(resolve);
        }, waitTime);
      } else {
        this.executeRequest(resolve);
      }
    });
  }

  /**
   * Execute a request with rate limiting
   */
  private executeRequest(resolve: () => void): void {
    const now = Date.now();
    
    this.lastRequestTime = now;
    this.activeRequests++;
    this.requestHistory.push(now);
    
    logger.debug('Request allowed:', {
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      recentRequests: this.requestHistory.length,
    });
    
    resolve();
  }

  /**
   * Mark a request as completed
   */
  completeRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    logger.debug('Request completed:', {
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
    });
    
    // Process next request in queue if any
    if (this.requestQueue.length > 0 && this.activeRequests < this.config.maxConcurrent) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        // Small delay to prevent immediate execution
        setTimeout(() => {
          this.waitForNextRequest().then(nextRequest);
        }, 100);
      }
    }
  }

  /**
   * Clean up old request history entries
   */
  private cleanupRequestHistory(now: number): void {
    const cutoff = now - this.config.burstWindow;
    this.requestHistory = this.requestHistory.filter(time => time > cutoff);
  }

  /**
   * Get current rate limiter statistics
   */
  getStats(): {
    activeRequests: number;
    queueLength: number;
    recentRequests: number;
    config: RateLimiterConfig;
  } {
    this.cleanupRequestHistory(Date.now());
    
    return {
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      recentRequests: this.requestHistory.length,
      config: this.config,
    };
  }

  /**
   * Update rate limiter configuration
   */
  updateConfig(newConfig: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Rate limiter configuration updated:', this.config);
  }

  /**
   * Reset rate limiter state
   */
  reset(): void {
    this.lastRequestTime = 0;
    this.activeRequests = 0;
    this.requestQueue = [];
    this.requestHistory = [];
    
    logger.info('Rate limiter reset');
  }

  /**
   * Add random jitter to delay
   */
  private addJitter(delay: number, jitterPercent: number = 0.1): number {
    const jitter = delay * jitterPercent * (Math.random() - 0.5) * 2;
    return Math.max(0, delay + jitter);
  }

  /**
   * Get adaptive delay based on recent success/failure rate
   */
  getAdaptiveDelay(baseDelay: number, successRate: number): number {
    // Increase delay if success rate is low
    if (successRate < 0.5) {
      return baseDelay * 2;
    } else if (successRate < 0.7) {
      return baseDelay * 1.5;
    }
    
    return baseDelay;
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RequestRateLimiter();

// Domain-specific rate limiters for different websites
export class DomainRateLimiter {
  private limiters: Map<string, RequestRateLimiter> = new Map();

  /**
   * Get rate limiter for specific domain
   */
  getLimiter(domain: string): RequestRateLimiter {
    if (!this.limiters.has(domain)) {
      // Different configs for different types of sites
      let config: Partial<RateLimiterConfig> = {};
      
      if (this.isHighTrafficSite(domain)) {
        config = {
          minDelay: 3000, // 3 seconds for high-traffic sites
          maxConcurrent: 1,
          burstLimit: 3,
        };
      } else if (this.isMediumTrafficSite(domain)) {
        config = {
          minDelay: 2000, // 2 seconds for medium-traffic sites
          maxConcurrent: 2,
          burstLimit: 5,
        };
      } else {
        config = {
          minDelay: 1500, // 1.5 seconds for smaller sites
          maxConcurrent: 2,
          burstLimit: 7,
        };
      }
      
      this.limiters.set(domain, new RequestRateLimiter(config));
      logger.info(`Created rate limiter for domain: ${domain}`, config);
    }
    
    return this.limiters.get(domain)!;
  }

  private isHighTrafficSite(domain: string): boolean {
    const highTrafficSites = [
      'allrecipes.com',
      'foodnetwork.com',
      'food.com',
      'epicurious.com',
    ];
    
    return highTrafficSites.some(site => domain.includes(site));
  }

  private isMediumTrafficSite(domain: string): boolean {
    const mediumTrafficSites = [
      'bonappetit.com',
      'seriouseats.com',
      'tasty.co',
      'delish.com',
    ];
    
    return mediumTrafficSites.some(site => domain.includes(site));
  }

  /**
   * Get statistics for all domain limiters
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [domain, limiter] of this.limiters) {
      stats[domain] = limiter.getStats();
    }
    
    return stats;
  }
}

export const domainRateLimiter = new DomainRateLimiter();
