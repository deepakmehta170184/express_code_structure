module.exports = (sequelize, DataTypes) => {
	const TokenBlackList = sequelize.define(
		"TokenBlackList",
		{
			token: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: true
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

	TokenBlackList.associate = models => {
		TokenBlackList.dbModels = models;
		TokenBlackList.belongsTo(models.Account, {
			as: "account",
			foreignKey: "accountId"
		});
	};

	TokenBlackList.addTokenBlackList = async (accountId, token) => {
		return TokenBlackList.create({
			accountId,
			token
		});
	};

	return TokenBlackList;
};
