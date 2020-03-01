require("dotenv").config({path: '.env'}); // this is important!

module.exports = {
	development: {
		username: process.env.dbusername,
		password: process.env.dbpassword,
		database: process.env.dbname,
		host: process.env.dbhost,
		dialect: "mysql"
	},
	production: {
		username: process.env.dbusername,
		password: process.env.dbpassword,
		database: process.env.dbname,
		host: process.env.dbhost,
		dialect: "mysql"
	}
};