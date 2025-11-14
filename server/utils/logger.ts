/**
 * Logger Utility
 * Structured logging for server-side operations
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
	[key: string]: unknown;
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
}

class Logger {
	private minLevel: LogLevel;

	constructor(minLevel: LogLevel = 'info') {
		this.minLevel = minLevel;
	}

	/**
	 * Get numeric level value for comparison
	 */
	private getLevelValue(level: LogLevel): number {
		const levels: Record<LogLevel, number> = {
			debug: 0,
			info: 1,
			warn: 2,
			error: 3
		};
		return levels[level];
	}

	/**
	 * Check if level should be logged
	 */
	private shouldLog(level: LogLevel): boolean {
		return this.getLevelValue(level) >= this.getLevelValue(this.minLevel);
	}

	/**
	 * Format log entry
	 */
	private formatEntry(entry: LogEntry): string {
		const { timestamp, level, message, context, error } = entry;

		let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

		if (context && Object.keys(context).length > 0) {
			formatted += ` | Context: ${JSON.stringify(context)}`;
		}

		if (error) {
			formatted += ` | Error: ${error.name}: ${error.message}`;
			if (error.stack) {
				formatted += `\nStack: ${error.stack}`;
			}
		}

		return formatted;
	}

	/**
	 * Create log entry
	 */
	private createEntry(
		level: LogLevel,
		message: string,
		context?: LogContext,
		error?: Error
	): LogEntry {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message
		};

		if (context) {
			entry.context = context;
		}

		if (error) {
			entry.error = {
				name: error.name,
				message: error.message,
				stack: error.stack
			};
		}

		return entry;
	}

	/**
	 * Write log entry
	 */
	private write(entry: LogEntry): void {
		if (!this.shouldLog(entry.level)) return;

		const formatted = this.formatEntry(entry);

		// In production, you might want to send to a logging service
		// For now, we'll use console
		switch (entry.level) {
			case 'debug':
				console.debug(formatted);
				break;
			case 'info':
				console.info(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'error':
				console.error(formatted);
				break;
		}
	}

	/**
	 * Log debug message
	 */
	debug(message: string, context?: LogContext): void {
		const entry = this.createEntry('debug', message, context);
		this.write(entry);
	}

	/**
	 * Log info message
	 */
	info(message: string, context?: LogContext): void {
		const entry = this.createEntry('info', message, context);
		this.write(entry);
	}

	/**
	 * Log warning message
	 */
	warn(message: string, context?: LogContext): void {
		const entry = this.createEntry('warn', message, context);
		this.write(entry);
	}

	/**
	 * Log error message
	 */
	error(message: string, error?: Error, context?: LogContext): void {
		const entry = this.createEntry('error', message, context, error);
		this.write(entry);
	}

	/**
	 * Create child logger with additional context
	 */
	child(childContext: LogContext): Logger {
		const childLogger = new Logger(this.minLevel);
		const originalWrite = childLogger.write.bind(childLogger);

		// Override write to include parent context
		childLogger.write = (entry: LogEntry) => {
			entry.context = {
				...childContext,
				...entry.context
			};
			originalWrite(entry);
		};

		return childLogger;
	}

	/**
	 * Set minimum log level
	 */
	setLevel(level: LogLevel): void {
		this.minLevel = level;
	}
}

/**
 * Get log level from environment
 */
function getLogLevelFromEnv(): LogLevel {
	const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
	const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

	if (level && validLevels.includes(level)) {
		return level;
	}

	// Default to 'info' in production, 'debug' in development
	return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Export singleton logger instance
 */
export const logger = new Logger(getLogLevelFromEnv());

/**
 * Export Logger class for custom instances
 */
export { Logger, type LogLevel, type LogContext };
