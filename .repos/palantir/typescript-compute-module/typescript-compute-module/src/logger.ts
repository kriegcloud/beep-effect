export interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

/**
 * Wraps a logger with an instance ID to differentiate logs from different instances if provided
 */
export const loggerToInstanceLogger = (
  logger: Logger,
  instanceId?: string
): Logger => {
  if (instanceId == null) {
    return logger;
  }
  return {
    log: (message: string) => logger.log(`[${instanceId}] ${message}`),
    error: (message: string) => logger.error(`[${instanceId}] ${message}`),
    info: (message: string) => logger.info(`[${instanceId}] ${message}`),
    warn: (message: string) => logger.warn(`[${instanceId}] ${message}`),
  };
};
