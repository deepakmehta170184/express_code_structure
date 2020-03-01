const slugifyLib = require("slugify");

// const slugify = text => {
// 	return slugifyLib(text, {
// 		replacement: "-", // replace spaces with replacement
// 		remove: /[*,+~.()'"!:@]/g, // regex to remove characters
// 		lower: true // result in lower case
// 	});
// };

// export default slugify;

function slugify(text) {
	return slugifyLib(text.trim(), {
		replacement: "-", // replace spaces with replacement
		remove: /[*,+~.()'"!:@#$%^&_/\\`]/g, // regex to remove characters
		lower: true // result in lower case
	});
}

module.exports = slugify;
