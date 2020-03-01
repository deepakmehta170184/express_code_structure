module.exports = {
	up: queryInterface => {
		return queryInterface.bulkInsert(
			"MasterData",
			[
				{
					key: "accountStatus",
					value: "pending",
					title: "Pending",
					active: 1,
					order: 0
				},
				{
					key: "accountStatus",
					value: "active",
					title: "Active",
					active: 1,
					order: 0
				},
				{
					key: "accountStatus",
					value: "inactive",
					title: "Inactive",
					active: 1,
					order: 0
				}
			],
			{}
		);
	},

	down: queryInterface => {
		return queryInterface.bulkDelete(
			"MasterData",
			{ key: "accountStatus" },
			{}
		);
	}
};
