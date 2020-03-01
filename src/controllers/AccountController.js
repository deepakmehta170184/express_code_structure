/* eslint-disable no-param-reassign */
import { validationResult } from "express-validator";
import paginate from "express-paginate";
import md5 from "md5";
// import mail from "../service/sendmail";
import TokenGenerator from "../tokenGenerator";

import BaseAPIController from "./BaseAPIController";
import { BadRequestError, UnauthorizedError } from "../lib/errors";

const logger = require("../lib/logger");

export class UserController extends BaseAPIController {
	register = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			return Promise.all([
				this._db.MasterData.findOne({
					where: { key: "accountStatus", value: "pending" }
				}).catch(err => {
					logger.error("Error getting acountStatus MasterData");
					logger.error(err);
					return this.handleErrorResponse(res, err);
				}),
				this._db.MasterData.findOne({
					where: { key: "accountRole", value: "browser" }
				}).catch(err => {
					logger.error("Error getting accountRole MasterData");
					logger.error(err);
					return this.handleErrorResponse(res, err);
				})
			])
				.then(([accountStatus, accountRole]) => {
					// Create Account object
					logger.debug("Creating Insert Object for addAccount");

					const insertAccount = {
						email: req.body.email,
						password: md5(req.body.password),
						roleId: accountRole.id,
						statusId: accountStatus.id,
						profile: {
							name: req.body.name,
							zip: req.body.zip
						}
					};

					logger.debug("Inserting Account Object:");
					logger.debug(JSON.stringify(insertAccount));

					return this._db.Account.addAccount(insertAccount)
						.then(account => {
							logger.debug("Sucessfully created new Account");
							logger.debug(account);

							// const subject = "Verification Email";
							// const message = `click here to verify your account <a>${process.env.verificationLink + account.verificationCode} </a>`;
							// let mailResponse = await mail.sendMail(subject, bodyData.accountEmail, message);

							return this.handleSuccessResponse(req, res, next, {
								status: 1,
								message: "Sucessfully created new Account"
							});
						})
						.catch(err => {
							logger.error("Got an error when attempting to addAccount");
							logger.error(err);
							return this.handleErrorResponse(res, err);
						});
				})
				.catch(dataFetchErr => {
					// Some error fetching required data.
					logger.error("Error when getting linked data for addAccount");
					logger.error(dataFetchErr);
					return this.handleErrorResponse(res, dataFetchErr);
				});
		} catch (err) {
			logger.error(
				"An unknown error in Try/Catch for add Account on Controller"
			);
			return this.handleErrorResponse(res, err);
		}
	};

	login = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			const { email } = req.body;
			return this._db.Account.findOne({
				where: { email }
			}).then(account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				if (account.password !== md5(req.body.password))
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Incorrect password!")
					);

				const accountInfo = {
					id: account.id,
					email: account.email
				};

				const tokenGenerator = new TokenGenerator(process.env.secretCode, {
					expiresIn: "24h"
				});
				const token = tokenGenerator.sign(accountInfo);
				// setTimeout(function () {
				// 	const token2 = tokenGenerator.refresh(token)
				// 	console.log("--- token ---")
				// 	console.log(jwt.decode(token, { complete: true }))
				// 	console.log(jwt.decode(token2, { complete: true }))
				// }, 3000)
				// const token = jwt.sign(accountInfo, process.env.secretCode, {
				// 	expiresIn: "12h"
				// });

				return this.handleSuccessResponse(req, res, next, {
					status: 1,
					token,
					message: "Sucessfully Logged In"
				});
			});
		} catch (error) {
			logger.error(error);
			return this.handleErrorResponse(res, error);
		}
	};

	logout = (req, res, next) => {
		try {
			const token = req.headers.authorization.replace("Bearer", "");

			return this._db.Account.findByPk(req.user.id).then(account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				return this._db.TokenBlackList.addTokenBlackList(
					account.id,
					token
				).then(() => {
					return this.handleSuccessResponse(req, res, next, {
						status: 1,
						message: "Sucessfully Logged Out"
					});
				});
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	verification = (req, res, next) => {
		try {
			if (!req.params.code) {
				return this.handleErrorResponse(
					res,
					new BadRequestError("Verification code is required")
				);
			}

			return this._db.Account.findOne({
				where: { verificationCode: req.params.code }
			}).then(account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Verification link is invalid")
					);

				// Update Account object
				logger.debug("Updating Insert Object for verification");

				const updateAccount = {
					verified: 1,
					verificationCode: null
				};

				return this._db.Account.updateAccount(account.id, updateAccount).then(
					response => {
						logger.debug(JSON.stringify(response));

						// Get updated details and return
						return this._db.Account.getAccount(account.id)
							.then(updatedAccount => {
								// Return success
								return this.handleSuccessResponse(req, res, next, {
									status: 1,
									data: updatedAccount,
									message: "Sucessfully Email verified!"
								});
							})
							.catch(getUpdatedAccountErr => {
								logger.error("Got an error when getting updated account");
								logger.error(getUpdatedAccountErr);
								return this.handleErrorResponse(res, getUpdatedAccountErr);
							});
					}
				);
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	me = (req, res, next) => {
		try {
			return this._db.Account.getAccount(req.user.id).then(response => {
				if (!response)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				return this.handleSuccessResponse(req, res, next, {
					status: 1,
					data: response
				});
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	myFavorites = (req, res, next) => {
		try {
			// Pagination
			const limit = parseInt(req.query.limit, 10) || 10;
			const page = limit ? parseInt(req.query.page, 10) : 1;
			const offset = limit ? parseInt(limit * (page - 1), 10) : 0;

			const where = {
				favorites: req.user.id
			};

			// Sorting
			const sortBy = req.query.sort;
			const sortOrder = req.query.order;

			let orderBy = "best-match";
			let order = "DESC";
			switch (sortBy) {
				case "price":
					orderBy = "price";
					order = sortOrder === "DESC" ? "DESC" : "ASC";
					break;
				case "title":
					orderBy = "title";
					order = sortOrder === "DESC" ? "DESC" : "ASC";
					break;
				case "total_time":
					orderBy = "time";
					order = sortOrder === "DESC" ? "DESC" : "ASC";
					break;
				case "year":
					orderBy = "year";
					order = sortOrder === "DESC" ? "DESC" : "ASC";
					break;
				case "created":
					orderBy = "createdAt";
					order = sortOrder === "DESC" ? "DESC" : "ASC";
					break;
				case "best-match":
				default:
					orderBy = "best-match";
					order = sortOrder === "ASC" ? "ASC" : "DESC";
					break;
			}

			return this._db.Listing.getListings(
				req.params.type,
				where,
				null,
				orderBy,
				order,
				limit,
				offset,
				req.user
			)
				.then(results => {
					const pageCount = limit ? Math.ceil(results.count / limit) : 1;

					return this.handleSuccessResponse(req, res, next, {
						status: 1,
						data: results,
						pageCount,
						pages: paginate.getArrayPages(req)(undefined, pageCount, page),
						message: `My ${req.params.type} Favorites`
					});
				})
				.catch(err => {
					logger.error("Error getting My Favorites");
					logger.error(err);
					return this.handleErrorResponse(res, err);
				});
		} catch (error) {
			return this.handleErrorResponse(res, error);
		}
	};

	forgotPassword = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			return this._db.Account.findOne({
				where: { email: req.body.email },
				attributes: ["id", "email", "verificationCode"]
			}).then(async account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				const tokenGenerator = new TokenGenerator(process.env.secretCode, {
					expiresIn: "1h"
				});
				const token = tokenGenerator.sign(account);

				logger.debug(token);

				account.reset_password_token = token;
				await account.save();

				return this.handleSuccessResponse(req, res, next, {
					status: 1,
					message: "Reset password link sent to mail!"
				});
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	resetPassword = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			return this._db.Account.findOne({
				where: { reset_password_token: req.params.token }
			}).then(async account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				account.reset_password_token = null;
				account.password = md5(req.body.password);
				await account.save();

				return this.handleSuccessResponse(req, res, next, {
					status: 1,
					message: "Password Updated!"
				});
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	updatePassword = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			logger.debug("Updating Insert Object for password");

			return this._db.Account.findOne({
				where: { email: req.user.email }
			}).then(async account => {
				if (!account)
					return this.handleErrorResponse(
						res,
						new UnauthorizedError("Account doesn't exist!")
					);

				account.password = md5(req.body.newPassword);
				await account.save();

				return this.handleSuccessResponse(req, res, next, {
					status: 1,
					message: "Password Updated!"
				});
			});
		} catch (err) {
			return this.handleErrorResponse(res, err);
		}
	};

	updateAccount = (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return this.handleErrorResponse(
					res,
					{
						err: errors.array()
					},
					422
				);
			}

			const updateAccount = {};

			if (req.body.registrationCompleted) {
				updateAccount.registrationCompleted = req.body.registrationCompleted;
			}

			if (req.body.status) {
				return this._db.MasterData.findOne({
					where: { key: "accountStatus", value: req.body.status }
				})
					.then(accountStatus => {
						updateAccount.statusId = accountStatus.id;
					})
					.catch(err => {
						logger.error("Error getting acountStatus MasterData");
						logger.error(err);
						return this.handleErrorResponse(res, err);
					});
			}

			if (req.body.role) {
				return this._db.MasterData.findOne({
					where: { key: "accountRole", value: req.body.role }
				})
					.then(accountRole => {
						updateAccount.roleId = accountRole.id;
					})
					.catch(err => {
						logger.error("Error getting accountRole MasterData");
						logger.error(err);
						return this.handleErrorResponse(res, err);
					});
			}

			return this._db.Account.updateAccount(req.user.id, updateAccount).then(
				async dbAccount => {
					logger.info(`Sucessfully updated Account.: ${dbAccount.email}`);
					logger.debug(dbAccount);

					if (req.body.profile) {
						return dbAccount
							.getProfile()
							.then(async dbProfiles => {
								logger.debug(JSON.stringify(dbProfiles));

								return dbProfiles
									.update(req.body.profile)
									.then(updatedProfile => {
										logger.debug(JSON.stringify(updatedProfile));
									})
									.catch(updateProfileErr => {
										return this.handleErrorResponse(res, updateProfileErr);
									});
							})
							.catch(profileErr => {
								logger.error(
									"Got an error when attempting to update account profile"
								);
								logger.error(profileErr);
								return this.handleErrorResponse(res, profileErr);
							});
					}

					// Get updated details and return
					return this._db.Account.getAccount(req.user.id)
						.then(updatedAccount => {
							// Return success
							return this.handleSuccessResponse(req, res, next, {
								status: 1,
								data: updatedAccount,
								message: "Sucessfully updated Account"
							});
						})
						.catch(getUpdatedAccountErr => {
							logger.error("Got an error when getting updated account");
							logger.error(getUpdatedAccountErr);
							return this.handleErrorResponse(res, getUpdatedAccountErr);
						});
				}
			);
		} catch (err) {
			logger.error(
				"An unknown error in Try/Catch for update Account on Controller"
			);
			return this.handleErrorResponse(res, err);
		}
	};
}

const controller = new UserController();
export default controller;
