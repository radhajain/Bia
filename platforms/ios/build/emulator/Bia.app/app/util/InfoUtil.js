var application = require("application");

exports.getMessage = function (day) {
	//----TEMP-----
	// Replace with array (object?) of messages
	var message = "You missed a pill yesterday. Don't worry it happens. \n \n Continue on your pack normally. For the next 24 hours use additional protection.";
	return message;
	//-----TEMP----
}

exports.getExpectations = function (day) {
	//----TEMP-----
	// Replace with array (object?) of messages
	var message = "These pills have the highest estrogen. You might be feeling a higher sex drive!";
	return message;
	//-----TEMP----
}

exports.getRecommendations = function (day) {
	//----TEMP-----
	// Replace with array (object?) of messages
	var recommendations = "Order some more pills! You need to refill you pill pack in 8 days. \n\n";
	return recommendations;
	//-----TEMP----
}


exports.getQuote = function () {
	return {
		quote: "Girls should never be afraid to be smart",
		author: "Emma Watson"
	};
}