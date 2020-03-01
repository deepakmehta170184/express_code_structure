import auth from "../middleware/auth";
import AccountController from "../controllers/AccountController";
import AccountValidator from "../validators/AccountValidator";
// import { imageUpload } from "../service/aws";

export default app => {
	// Create User
	app
		.route("/accounts/register")
		.post(AccountValidator.register(), AccountController.register);

	// Login
	app
		.route("/accounts/login")
		.post(AccountValidator.login(), AccountController.login);

	// LogOut
	app.route("/accounts/logout").get(auth.verifyUser, AccountController.logout);

	// Verify Email
	app.route("/accounts/verification/:code").get(AccountController.verification);

	// Get My Info
	app.route("/accounts/me").get(auth.verifyUser, AccountController.me);

	// Get My Favorites
	app
		.route("/accounts/me/favorites/:type")
		.get(auth.verifyUser, AccountController.myFavorites);

	/*
	// Get My Saved Searches
	app
		.route("/accounts/me/searches")
		.get(auth.verifyUser, AccountController.mySearches);
		*/

	// forgot password
	app
		.route("/accounts/password/forgot")
		.post(AccountValidator.forgotPassword(), AccountController.forgotPassword);

	// reset password
	app
		.route("/accounts/password/reset/:token")
		.put(
			auth.verifyUser,
			AccountValidator.resetPassword(),
			AccountController.resetPassword
		);

	// update password
	app
		.route("/accounts/password")
		.put(
			auth.verifyUser,
			AccountValidator.updatePassword(),
			AccountController.updatePassword
		);

	// update account
	app
		.route("/accounts/update")
		.put(auth.verifyUser, AccountController.updateAccount);
		
	return app;
};
