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

exports.pageNavigating = function (args) {

	page = args.object;
	page.bindingContext = pageData;
	if (StorageUtil.getName()) {
		var nameText = page.getViewById("name");
		nameText.text = StorageUtil.getName();
	}
	//TODO: if swipe left, exports.goToContraceptionView()
	var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
		//If swipe down on the screen, go to extended page
		if (args.direction == 2) {
			exports.goToContraceptionView();
		}
	});

	// var pushPlugin = require("nativescript-push-notifications");
	// var pushSettings = {
	// 	senderID: "276623592206", // Required: setting with the sender/project number
	// 	notificationCallbackAndroid: function (stringifiedData, fcmNotification) {
	// 		var notificationBody = fcmNotification && fcmNotification.getBody();
	// 		_this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
	// 	}
	// };
	// pushPlugin.register(pushSettings, function (token) {
	// 	alert("Device registered. Access token: " + token);
	// }, function () {});

}


//----- TEXT FIELD INPUT -----

exports.onFocus = function (args) {
	var textField = args.object;
	var observer = page.observe(gestures.GestureTypes.tap, function (args) {
		textField.dismissSoftInput();
	});
}


//------ STORAGE UTIL SETTING FUNCTIONS -----

exports.addName = function () {
	var nameField = page.getViewById("name");
	var name = nameField.text;
	if (name !== "") {
		StorageUtil.setName(name.trim());
	}
}


// ---- NAVIGATION -----

exports.goToContraceptionView = function () {
	// Add user inputs to StorageUtil if its not in there already
	if (!StorageUtil.getName()) {
		exports.addName();
	}
	//Ensure that the user has filled out all fields
	if (!StorageUtil.getName()) {
		dialogs.alert({
			title: "Not so fast!",
			message: "Please enter your name to continue",
			okButtonText: "Ok"
		}).then(function () {
			console.log("Dialog closed");
		});
	} else {
		frameModule.topmost().navigate('views/onboarding/bcView/bcView');
	}

}