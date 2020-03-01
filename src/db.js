import Sequelize from "sequelize";
import models from "./models";

const logger = require("./lib/logger");

const db = {};

// create your instance of sequelize
const sequelize = new Sequelize(
	process.env.dbname,
	process.env.dbusername,
	process.env.dbpassword,
	{
		port: 3306,
		host: process.env.dbhost,
		logging: false,
		dialect: "mysql",
		define: {
			timestamps: false
		},
		retry: {
			max: 3, // maximum amount of tries
			timeout: 10000, // throw if no response or error within millisecond timeout, default: undefined,
			match: [
				Sequelize.ConnectionError,
				Sequelize.ConnectionRefusedError,
				Sequelize.ConnectionTimedOutError,
				Sequelize.OptimisticLockError,
				Sequelize.TimeoutError
			],
			backoffBase: 500, // Initial backoff duration in ms. Default: 100,
			backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
			report: msg => {
				logger.warn(msg);
			}, // the function used for reporting; must have a (string, object) argument signature, where string is the message that will passed in by retry-as-promised, and the object will be this configuration object + the $current property
			name: "Sequelize Database"
		},
		seederStorage: "sequelize"
	}
);

// load models
Object.keys(models).forEach(modelName => {
	const model = models[modelName];
	db[modelName] = model;
});

// invoke associations on each of the models
Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

sequelize
	.sync()
	.then(
		() => {
			logger.info("Checking to see if an tables need to be seeded...");
			// Attempt to auto-run seeders
			try {
				const queryInterface = sequelize.getQueryInterface();
				const as = require("./lib/autoSeeder")(queryInterface);

				// Account Roles
				as.seedIfEmpty(
					db.MasterData,
					{ key: "accountRole" },
					"../seeders/20191103013100-account-roles"
				)
					.then(() => {
						// Account Status
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "accountStatus" },
							"../seeders/20191103013200-account-status"
						);
					})
					.then(() => {
						// Company Profiles
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "companyProfile" },
							"../seeders/20191103013210-company-profiles"
						);
					})
					.then(() => {
						// Listing Types
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "listingType" },
							"../seeders/20191103013300-listing-types"
						);
					})
					.then(() => {
						// Listing Sales (Buy, Lease, Trade, Auction)
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "listingSale" },
							"../seeders/20191103013500-listing-sales"
						);
					})
					.then(() => {
						// Listing Levels
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "listingLevel" },
							"../seeders/20191103013600-listing-level"
						);
					})
					.then(() => {
						// Listing Status (Published, Draft, Removed, etc..)
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "listingStatus" },
							"../seeders/20191103013700-listing-status"
						);
					})
					.then(() => {
						// Aircraft Sizes (Business Jet, Small Jet, Light Jet, etc..)
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftSize" },
							"../seeders/20191103013800-aircraft-sizes"
						);
					})
					.then(() => {
						// Aircraft Types (Jet, Helicopter, Turboprop, etc..)
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftType" },
							"../seeders/20191103013900-aircraft-types"
						);
					})
					.then(() => {
						// Aircraft Conditions
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftCondition" },
							"../seeders/20191103013950-aircraft-condition"
						);
					})
					.then(() => {
						// Aircraft Refurbishments
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftRefurbishment" },
							"../seeders/20191103013951-aircraft-refurbishment"
						);
					})
					.then(() => {
						// Aircraft Lavatories
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftLavatory" },
							"../seeders/20191103013952-aircraft-lavatories"
						);
					})
					.then(() => {
						// Aircraft Galleys
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "aircraftGalley" },
							"../seeders/20191103013953-aircraft-gallies"
						);
					})
					.then(() => {
						// Inquiry Status
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "inquiryStatus" },
							"../seeders/20191103014100-inquiry-status"
						);
					})
					.then(() => {
						// Stat Types
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "statType" },
							"../seeders/20191103014200-stat-types"
						);
					})
					.then(() => {
						// Notification Types
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "notificationType" },
							"../seeders/20191103014300-notification-types"
						);
					})
					.then(() => {
						// Service Categories
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "serviceCategory" },
							"../seeders/20191103014400-service-categories"
						);
					})
					.then(() => {
						// Countries
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "country" },
							"../seeders/20191103015736-countries"
						);
					})
					.then(() => {
						// Currencies
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "currency" },
							"../seeders/20191103021122-currencies"
						);
					})
					.then(() => {
						// States
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "state" },
							"../seeders/20191103023109-states"
						);
					})
					.then(() => {
						// Airframe Maintenances
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "airframeMaintenance" },
							"../seeders/20191103025627-airframe-maintenances"
						);
					})
					.then(() => {
						// Engine Maintenances
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "engineMaintenance" },
							"../seeders/20191103025640-engine-maintenances"
						);
					})
					.then(() => {
						// APU Maintenance
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "apuMaintenance" },
							"../seeders/20191103025653-apu-maintenances"
						);
					})
					.then(() => {
						// Highlights
						return as.seedIfEmpty(
							db.Highlight,
							null,
							"../seeders/20191103025707-highlights"
						);
					})
					.then(() => {
						// Plans / Subscriptions
						return as.seedIfEmpty(
							db.Plan,
							null,
							"../seeders/20191103025750-plans"
						);
					})
					.then(() => {
						// Accounts / Users
						return as.seedIfEmpty(
							db.Account,
							null,
							"../seeders/20191104180100-users"
						);
					})
					.then(() => {
						// Companies
						return as.seedIfEmpty(
							db.Company,
							null,
							"../seeders/20191104180200-companies"
						);
					})
					.then(() => {
						// Makes & Models
						return as.seedIfEmpty(
							db.Make,
							null,
							"../seeders/20191104180551-makes-models"
						);
					})
					.then(() => {
						// Sale Listings
						return as.seedIfEmpty(
							db.ListingSale,
							null,
							"../seeders/20191105154552-sale-listings"
						);
					})
					.then(() => {
						// Promotions
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "promotionInternal" },
							"../seeders/20191121064032-promotions-internal-external"
						);
					})
					.then(() => {
						// Email Preferences
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "emailPreferences" },
							"../seeders/20191121111427-email-preferences"
						);
					})
					.then(() => {
						// Promotion Statuses
						return as.seedIfEmpty(
							db.MasterData,
							{ key: "promotionStatus" },
							"../seeders/20191126112212-promotion-status"
						);
					});
			} catch (e) {
				logger.error("Error Auto-Seeding");
				logger.error(e);
			}
		},
		err => {
			logger.error("Incorrect Sequelize Db Details Update config details");
			logger.error(err);
			process.exit(0);
		}
	)
	.catch(err => {
		logger.error("Unable to connect to Sequelize DB");
		logger.error(err);
	});

export default { ...db, sequelize, Sequelize };
