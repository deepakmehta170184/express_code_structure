const logger = require("./logger");

export class BadRequestError extends Error {
	constructor(message, error=null) {
		super(message);
		this.name = "Bad Request Error";
		this.code = 400;
		this.error = error || null;
	}
}

export class UnauthorizedError extends Error {
	constructor(message) {
		super(message);
		this.name = "Unauthorized Error";
		this.code = 401;
	}
}

export class ForbiddenError extends Error {
	constructor(message) {
		super(message);
		this.name = "Forbidden Error";
		this.code = 403;
	}
}

export class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = "Not Found Error";
		this.code = 404;

		logger.error(`Not Found Error: ${message}`);
	}
}

export class ConflictError extends Error {
	constructor(message) {
		super(message);
		this.name = "Conflict Error";
		this.code = 409;
	}
}

export class InternalError extends Error {
	constructor(message) {
		super(message);
		this.name = "Internal Server Error";
		this.code = 500;
	}
}
