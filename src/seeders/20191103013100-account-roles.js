module.exports = {
	up: queryInterface => {
		return queryInterface.bulkInsert(
			"MasterData",
			[
				{
					key: "accountRole",
					value: "super-admin",
					title: "Super Admin",
					active: 1,
					order: 0
				},
				{
					key: "accountRole",
					value: "company-admin",
					title: "Company Admin",
					active: 1,
					order: 0
				},
				{
					key: "accountRole",
					value: "sales-rep",
					title: "Sales Rep",
					active: 1,
					order: 0
				},
				{
					key: "accountRole",
					value: "sales-rep-view",
					title: "Sales Rep (View Only)",
					active: 1,
					order: 0
				},
				{
					key: "accountRole",
					value: "advertiser",
					title: "Advertiser",
					active: 1,
					order: 0
				},
				{
					key: "accountRole",
					value: "browser",
					title: "Browser",
					active: 1,
					order: 0
				}
			],
			{}
		);
	},

	down: queryInterface => {
		return queryInterface.bulkDelete("MasterData", { key: "accountRole" }, {});
	}
};
