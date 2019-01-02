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

	// Date picker:
	initDatePicker();

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

	//assume pill already taken on first day user logs into app
	//this should be in the setDate function but it isn't being called
	var today = new Date();
	StorageUtil.setlastTimePillTaken(today.toISOString());
	var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
		//If swipe down on the screen, go to extended page
		if (args.direction == 2) {
			exports.goToHomeView();
		}
	});
	console.log("last time pill taken in onboarding " + StorageUtil.getlastTimePillTaken());

}



//----- TEXT FIELD INPUT -----

exports.onFocus = function (args) {
	var textField = args.object;
	if (args.object === page.getViewById("periodStart")) {
		pageData.set('showDatePicker', true);
		textField.dismissSoftInput();
	}
	var observer = page.observe(gestures.GestureTypes.tap, function (args) {
		pageData.set('showDatePicker', false);
		textField.dismissSoftInput();
	});
}


//------ STORAGE UTIL SETTING FUNCTIONS -----


exports.setDate = function () {
	var datePicker = page.getViewById("datePicker");
	pageData.set('showDatePicker', false);
	var textField = page.getViewById("periodStart");
	textField.text = datePicker.date.toDateString();
	StorageUtil.setPeriodStartDay(datePicker.date);
	textField.dismissSoftInput();
}

function setPeriodLength() {
	var periodLengthField = page.getViewById("periodLength");
	var numDays = periodLengthField.text;
	StorageUtil.setPeriodLength(numDays);
}


// ---- NAVIGATION -----

exports.goToHomeView = function () {
	// Add user inputs to StorageUtil if its not in there already
	setPeriodLength();

	//Ensure that the user has filled out all fields
	if (!StorageUtil.getPeriodStartDay() || !StorageUtil.getPeriodLength()) {
		dialogs.alert({
			title: "Not so fast!",
			message: "Please fill out all fields to continue",
			okButtonText: "Ok"
		}).then(function () {
			console.log("Dialog closed");
		});
	} else {
		StorageUtil.setOnboardingComplete();
		frameModule.topmost().navigate('views/homeView/homeView');
	}

}

//---- INITIALIZATION ------

function initDatePicker() {
	pageData.set('showDatePicker', false);
	var TODAY = new Date();
	pageData.set("maxDate", TODAY);
}