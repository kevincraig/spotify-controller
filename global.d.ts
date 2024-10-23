import CustomLogger from './customLogger';

declare global {
    var logger: CustomLogger;

    // Extend the Window interface
    interface Window {
        logger: CustomLogger;
    }
}

// This export is necessary to make this a module
export {};