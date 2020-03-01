import jwt from "jsonwebtoken";
import db from "../db";
import { BadRequestError, NotFoundError } from "../lib/errors";

const logger = require("../lib/logger");

module.exports.hasToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization.replace("Bearer ", "");
		logger.debug(`Does User have Token: ${token}`);
		const decoded = jwt.verify(token, process.env.secretCode);
		req.user = decoded;
		next();
	} catch (err) {
		next();
	}
};

module.exports.verifyUser = async (req, res, next) => {
	try {
		const token = req.headers.authorization.replace("Bearer ", "");
		logger.debug(`Verifying User Token: ${token}`);
		logger.debug(`Checking Blacklisted Tokens`);
		const usedToken = await db.TokenBlackList.findOne({
			where: { token }
		});
		logger.debug(JSON.stringify(usedToken));
		if (usedToken) {
			return res.status(403).json({ message: "Unauthorized access." });
		}

		return jwt.verify(token, process.env.secretCode, (err, decoded) => {
			if (err) {
				return res.status(403).json({ message: "Unauthorized access." });
			}
			req.user = decoded;
			return next();
		});
	} catch {
		return res.status(401).send({
			message: "No token provided."
		});
	}
};

module.exports.verifySalesRep = async (req, res, next) => {
	try {
		const token = req.headers.authorization.replace("Bearer ", "");
		logger.debug(`Verifying Sales Rep Token: ${token}`);
		const decoded = jwt.verify(token, process.env.secretCode);
		logger.debug(`Decoded Sales Rep Token: ${JSON.stringify(decoded)}`);

		const allowed = ["sales-rep", "company-admin", "super-admin"];
		return db.Account.getAccount(decoded.email)
			.then(user => {
				if (allowed.includes(user.role.value)) {
					req.user = user;
					return next();
				}
				return res.status(403).send({
					active: 0,
					message: "User not authorized for this function"
				});
			})
			.catch(err => {
				return res.status(401).send({
					active: 0,
					message: "User with token not found",
					error: err
				});
			});
	} catch (error) {
		res.status(401).send(error);
	}
};

module.exports.verifyCompanyAdmin = async (req, res, next) => {
	try {
		const token = req.headers.authorization.replace("Bearer ", "");
		logger.debug(`Verifying Company Admin Token: ${token}`);
		const decoded = jwt.verify(token, process.env.secretCode);

		const allowed = ["company-admin", "super-admin"];
		return db.Account.getAccount(decoded.email)
			.then(user => {
				if (allowed.includes(user.role.value)) {
					req.user = user;
					return next();
				}
				return res.status(403).send({
					active: 0,
					message: "User not authorized for this function"
				});
			})
			.catch(err => {
				return res.status(401).send({
					active: 0,
					message: "User with token not found",
					error: err
				});
			});
	} catch (error) {
		res.status(401).send(error);
	}
};
module.exports.verifySuperAdmin = async (req, res, next) => {
	try {
		const token = req.headers.authorization.replace("Bearer ", "");
		logger.debug(`Verifying Super Admin Token: ${token}`);
		const decoded = jwt.verify(token, process.env.secretCode);

		return db.Account.getAccount(decoded.email)
			.then(user => {
				if (user.role.value === "super-admin") {
					req.user = user;
					return next();
				}
				return res.status(403).send({
					active: 0,
					message: "User not authorized for this function"
				});
			})
			.catch(err => {
				return res.status(401).send({
					active: 0,
					message: "User with token not found",
					error: err
				});
			});
	} catch (error) {
		res.status(401).send(error);
	}
};
