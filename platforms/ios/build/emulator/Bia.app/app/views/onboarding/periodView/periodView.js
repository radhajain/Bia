var application = require("application");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var pageData = new observable.Observable();
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");

var page;
var pageData;
var currChoice;

exports.pageNavigating = function (args) {
	page = args.object;
	page.bindingContext = pageData;

	// var pushPlugin = require("nativescript-push-notifications");
	// var pushSettings = {
	//         senderID: "276623592206", // Required: setting with the sender/project number
	//         notificationCallbackAndroid: function (stringifiedData, fcmNotification) {
	//             var notificationBody = fcmNotification && fcmNotification.getBody();
	//             _this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
	//         }
	//     };
	// pushPlugin.register(pushSettings, function (token) {
	//     alert("Device registered. Access token: " + token);
	// }, function() { });

}

exports.setGetPeriod = function (args) {
	var yesBtn = args.object;
	yesBtn.className = "buttonSelected";
	if (currChoice !== "yes") {
		var noBtn = page.getViewById("noBtn");
		noBtn.className = "buttonOption";
		currChoice = "yes";
	}
}

exports.setNoGetPeriod = function (args) {
	var noBtn = args.object;
	noBtn.className = "buttonSelected";
	if (currChoice !== "no") {
		var yesBtn = page.getViewById("yesBtn");
		yesBtn.className = "buttonOption";
		currChoice = "no";
	}
}


// ---- NAVIGATION -----

exports.goToNextView = function () {
	if (currChoice == "yes") {
		StorageUtil.setDoesGetPeriod(true)
	} else if (currChoice == "no") {
		StorageUtil.setDoesGetPeriod(false);
	} else {
		//Ensure that the user has filled out all fields
		dialogs.alert({
			title: "Not so fast!",
			message: "Please tap an option to continue",
			okButtonText: "Ok"
		}).then(function () {
			console.log("Dialog closed");
		});
	}

	if (StorageUtil.getDoesGetPeriod()) {
		frameModule.topmost().navigate('views/onboarding/periodDetailView/periodDetailView');
	} else {
		StorageUtil.setOnboardingComplete();
		frameModule.topmost().navigate('views/homeView/homeView');
	}

}