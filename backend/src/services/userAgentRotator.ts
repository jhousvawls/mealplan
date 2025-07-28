import { logger } from '../utils/logger';

export class UserAgentRotator {
  private userAgents: string[] = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    
    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  ];

  private viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
    { width: 1600, height: 900 },
    { width: 2560, height: 1440 },
  ];

  private lastUsedIndex: number = -1;

  /**
   * Get a random user agent string
   */
  getRandomUserAgent(): string {
    let index;
    do {
      index = Math.floor(Math.random() * this.userAgents.length);
    } while (index === this.lastUsedIndex && this.userAgents.length > 1);
    
    this.lastUsedIndex = index;
    const userAgent = this.userAgents[index];
    
    logger.debug('Selected user agent:', { 
      index, 
      userAgent: userAgent.substring(0, 50) + '...' 
    });
    
    return userAgent;
  }

  /**
   * Get a random viewport size
   */
  getRandomViewport(): { width: number; height: number } {
    const viewport = this.viewports[Math.floor(Math.random() * this.viewports.length)];
    
    logger.debug('Selected viewport:', viewport);
    
    return viewport;
  }

  /**
   * Get browser type from user agent
   */
  getBrowserType(userAgent: string): string {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'safari';
    } else if (userAgent.includes('Edg')) {
      return 'edge';
    }
    return 'unknown';
  }

  /**
   * Get OS type from user agent
   */
  getOSType(userAgent: string): string {
    if (userAgent.includes('Windows')) {
      return 'windows';
    } else if (userAgent.includes('Macintosh')) {
      return 'macos';
    } else if (userAgent.includes('Linux')) {
      return 'linux';
    }
    return 'unknown';
  }

  /**
   * Get user agent statistics
   */
  getStats(): {
    totalUserAgents: number;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
  } {
    const browsers: Record<string, number> = {};
    const operatingSystems: Record<string, number> = {};

    this.userAgents.forEach(ua => {
      const browser = this.getBrowserType(ua);
      const os = this.getOSType(ua);
      
      browsers[browser] = (browsers[browser] || 0) + 1;
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
    });

    return {
      totalUserAgents: this.userAgents.length,
      browsers,
      operatingSystems,
    };
  }
}

export const userAgentRotator = new UserAgentRotator();
