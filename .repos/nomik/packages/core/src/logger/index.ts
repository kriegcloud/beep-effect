import pino from 'pino';
import type { LogConfig } from '../types/config.js';

export type Logger = pino.Logger;

export function createLogger(config: Partial<LogConfig> = {}, stream?: pino.DestinationStream): Logger {
    const level = config.level ?? 'info';
    const pretty = config.pretty ?? true;

    const transport = pretty
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined;

    return pino({
        name: 'nomik',
        level,
        transport,
    }, stream);
}

let defaultLogger: Logger | undefined;

export function getLogger(): Logger {
    if (!defaultLogger) {
        defaultLogger = createLogger();
    }
    return defaultLogger;
}

export function setLogger(logger: Logger): void {
    defaultLogger = logger;
}
