const logger = require("./logger");

module.exports = function(queryInterface) {
	return {
		seedIfEmpty: (model, where, seeder) => {
			logger.debug(
				`Checking Auto-Seed for ${model.name} with where: ${JSON.stringify(
					where
				)} using seeder: ${seeder}`
			);
			const seederFile = require(seeder);

			const whereConditional = where ? { where } : {};

			return model
				.findAll(whereConditional)
				.then(results => {
					if (!results.length) {
						// No data found. Seed it!
						logger.info(`Auto-Seeding: ${seeder}`);
						return seederFile.up(queryInterface).catch(err => {
							logger.error(`Unable to run Seeder: ${seeder}`);
							logger.error(err);
						});
					}
					logger.debug(`Seeder already has results for ${seeder}. Skipping...`);
					return Promise.resolve();
				})
				.catch(err => {
					logger.error(`Error occured auto-seeding ${seeder}`);
					logger.error(err);
					return Promise.reject();
				});
		}
	};
};
