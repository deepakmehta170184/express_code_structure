const { createLogger, format, transports } = require("winston");

const consoleFormat = format.combine(
	format.colorize(),
	format.timestamp(),
	format.align(),
	format.printf(info => {
		const { timestamp, level, message, ...args } = info;

		const ts = timestamp.slice(0, 19).replace("T", " ");
		return `${ts} [${level}]: ${message} ${
			Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
		}`;
	})
);

const logFormat = format.combine(
	format.uncolorize(),
	format.timestamp(),
	format.printf(info => {
		const { timestamp, level, message, ...args } = info;

		const ts = timestamp.slice(0, 19).replace("T", " ");
		return `${ts} [${level}]: ${message} ${
			Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
		}`;
	})
);

const logger = createLogger({
	transports: [
		// Console transport, for comparison
		new transports.Console({
			level: "silly",
			format: consoleFormat,
			handleExceptions: true
		}),
		new transports.File({
			dirname: "logs",
			filename: "all.log",
			level: process.env.LOG_LEVEL || "debug",
			format: logFormat,
			handleExceptions: true
		}),
		new transports.File({
			dirname: "logs",
			filename: "errors.log",
			level: "error",
			format: logFormat,
			handleExceptions: true
		})
	],
	exitOnError: false
});

module.exports = logger;

module.exports.stream = {
	write: message => {
		logger.info(message);
	}
};
