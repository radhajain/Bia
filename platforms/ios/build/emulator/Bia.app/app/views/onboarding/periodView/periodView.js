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
	var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
		//If swipe down on the screen, go to extended page
		if (args.direction == 2) {
			exports.goToNextView();
		}
	});

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

//TODO: error checking here
exports.setCycleDay = function () {
	var cycleDayField = page.getViewById("pillDay");
	var cycleDay = cycleDayField.text;
	var today = new Date();
	var firstCycleDay = new Date();
	firstCycleDay.setDate(today.getDate() - (cycleDay - 1));
	StorageUtil.setFirstCycleDay(firstCycleDay);
}


// ---- NAVIGATION -----

exports.goToNextView = function () {
	exports.setCycleDay();
	if (currChoice == "yes") {
		StorageUtil.setDoesGetPeriod(true)
	} else if (currChoice == "no") {
		StorageUtil.setDoesGetPeriod(false);
	} else {
		//Ensure that the user has filled out all fields
		dialogs.alert({
			title: "Not so fast!",
			message: "Please fill out all fields to continue",
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