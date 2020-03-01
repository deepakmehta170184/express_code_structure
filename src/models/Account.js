import { NotFoundError, ConflictError } from "../lib/errors";

const logger = require("../lib/logger");
import db from "../db";
const moment = require("moment");
module.exports = (sequelize, DataTypes, Op) => {
	const Account = sequelize.define(
		"Account",
		{
			email: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING(45),
				allowNull: false
			},
			verificationCode: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV1
			},
			verified: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: 0
			},
			reset_password_token: {
				type: DataTypes.STRING(500)
			},
			registrationCompleted: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: 0
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal("CURRENT_TIMESTAMP()")
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},
		{
			timestamps: true,
			paranoid: true
		}
	);

	Account.associate = models => {
		Account.dbModels = models;
		Account.hasOne(models.AccountProfile, {
			as: "profile",
			foreignKey: "accountId"
		});
		Account.belongsTo(models.MasterData, {
			as: "role",
			foreignKey: "roleId"
		});
		Account.belongsTo(models.MasterData, {
			as: "status",
			foreignKey: "statusId"
		});
		Account.hasOne(models.CompanyAccount, {
			as: "company",
			foreignKey: "accountId"
		});
		Account.hasMany(models.Listing, {
			as: "listings",
			foreignKey: "accountId"
		});
		Account.hasMany(models.Inquiry, {
			as: "inquiries",
			foreignKey: "accountId"
		});

		// Favorites
		Account.belongsToMany(models.Listing, {
			as: "favorites",
			through: "ListingFavorites"
		});
	};

	Account.afterCreate(function (data) {
		Account.dbModels.Notification.createSuperAdminNotifications({
			fromAccountId: data.id,
			action: "joined"
		})
	})

	Account.addAccount = async payload => {
		return new Promise((resolve, reject) => {
			Account.findOne({
				where: { email: payload.email }
			})
				.then(account => {
					if (account) {
						// An account with this Email already exists. Return an error
						logger.error(
							`An account with email: ${payload.email} already exists!`
						);
						logger.error(account);
						reject(
							new ConflictError(
								`An account with email: ${payload.email} already exists!`
							)
						);
						return;
					}

					logger.debug(
						`Account with email: ${payload.email} doesn't exist yet. Creating it!`
					);

					Account.create(payload, {
						include: [{ model: Account.dbModels.AccountProfile, as: "profile" }]
					}).then(newAccount => {
						logger.debug(
							"Sucessfully inserted new Account. Returning to Controller"
						);
						resolve(newAccount);
					});
				})
				.catch(accountErr => {
					logger.error("Error when checking for existing Account");
					logger.error(accountErr);
					reject(accountErr);
				});
		});
	};

	Account.getAccount = idOrEmail => {
		return Account.findOne({
			where: {
				[Op.or]: [{ id: idOrEmail }, { email: idOrEmail }]
			},
			attributes: {
				exclude: ["password", "verificationCode", "reset_password_token"]
			},
			include: [
				{
					model: Account.dbModels.AccountProfile,
					as: "profile"
				},
				{
					model: Account.dbModels.MasterData,
					as: "role",
					attributes: ["value", "title"]
				},
				{
					model: Account.dbModels.MasterData,
					as: "status",
					attributes: ["value", "title"]
				},
				{
					model: Account.dbModels.CompanyAccount,
					as: "company",
					include: [
						{
							model: Account.dbModels.Company,
							as: "company",
							include: [
								{
									model: Account.dbModels.MasterData,
									as: "status",
									attributes: ["id", "value", "title"]
								},
								{
									model: Account.dbModels.Plan,
									as: "plan"
								}
							]
						}
					]
				}
			]
		}).catch(err => {
			logger.error(err);
			return Promise.reject(err);
		});
	};

	Account.updateAccount = (id, payload) => {
		return new Promise((resolve, reject) => {
			Account.findByPk(id)
				.then(account => {
					if (account) {
						logger.debug(`Found Account with id: ${id}. Updating it!`);

						account
							.update(payload, {
								include: [
									{ model: Account.dbModels.AccountProfile, as: "profile" }
								]
							})
							.then(newAccount => {
								logger.debug(
									"Sucessfully updated Account. Returning to Controller"
								);
								resolve(newAccount);
							})
							.catch(updateErr => {
								logger.error(`Error when updating Account`);
								logger.error(updateErr);
								reject(updateErr);
							});
					} else {
						logger.error(`An Account doesn't exist!`);
						logger.error(account);
						reject(new NotFoundError(`An account could not be found`));
					}
				})
				.catch(accountErr => {
					logger.error("Error when checking for existing Account");
					logger.error(accountErr);
					reject(accountErr);
				});
		});
	};

	//  Total sales rep for company admin
	Account.getTotalSalesRep = async accountWhereClause => {
		return new Promise((resolve, reject) => {
			return Account.findAll({
				attributes: [
					[
						db.sequelize.fn("COUNT", db.sequelize.col(`Account.id`)),
						"salesRepCount"
					]
				],
				where: sequelize.literal(accountWhereClause),
				duplicating: false,
				include: [
					{
						model: Account.dbModels.CompanyAccount,
						as: "company",
						attributes: [],
						duplicating: false
					}
				]
			})
				.then(AccountCount => {
					if (!AccountCount) {
						logger.error(`No account sales rep found.`);
						return reject(new NotFoundError(`No account sales rep found.`));
					}

					return resolve(AccountCount);
				})
				.catch(err => {
					logger.error("No account sales rep found.");
					logger.error(err);
					return reject(err);
				});
		});
	};

	// Sales rep count for last seven days for company admin
	Account.salesRepCountSevenDays = async (whereObjSevenDays, companyId) => {
		try {
			// active sales rep count in last seven days
			const salesRepCountActive = await Account.count({
				where: whereObjSevenDays,
				include: [
					{
						model: Account.dbModels.CompanyAccount,
						as: "company",
						attributes: [],
						where: companyId,
						duplicating: false
					}
				]
			});

			return salesRepCountActive;
		} catch (err) {
			logger.error("Error trying to get sales rep count in last seven days");
			logger.error(err);
			console.log(err);
		}
	};

	Account.getCompany = async id => {
		return Account.findOne({
			where: {
				id: id
			},
			include: [
				{
					model: Account.dbModels.CompanyAccount,
					as: "company",
					include: [
						{
							model: Account.dbModels.Company,
							as: "company"
						}
					]
				}
			]
		}).catch(err => {
			logger.error(err);
			return Promise.reject(err);
		});
	};

	Account.getUserCount = async whereObj => {
		try {
			return await Account.count({
				where: whereObj,
				paranoid: false
			});
		} catch (error) {
			logger.error(error);
			return Promise.reject(error);
		}
	};
	
	return Account;
};
