// We must provide a minimal module declaration that doesn't pollute the global namespace.
// Otherwise, conflicts between react-native and JSDOM globals.
// See https://git.io/JJojh
declare module 'jsdom' {
  export type Document = {
    [k: string]: any;
  };
  export type DOMWindow = {
    [k: string]: any;
    document: Document;
  };
  export type CookieJar = any;
  export type VirtualConsole = any;
  export interface BaseOptions {
    referrer?: string;
    userAgent?: string;
    includeNodeLocations?: boolean;
    runScripts?: 'dangerously' | 'outside-only';
    resources?: 'usable'; //  | ResourceLoader;
    virtualConsole?: VirtualConsole;
    cookieJar?: CookieJar;
    pretendToBeVisual?: boolean;
    beforeParse?(window: DOMWindow): void;
  }
  export interface ConstructorOptions extends BaseOptions {
    url?: string;
    contentType?: string;
    storageQuota?: number;
  }
  export class JSDOM {
    constructor(html?: string, options?: ConstructorOptions);
    readonly window: DOMWindow;
    readonly virtualConsole: VirtualConsole;
    readonly cookieJar: CookieJar;
    serialize(): string;
    getInternalVMContext(): any;
    // reconfigure(settings: ReconfigureSettings): void;
  }
}
