var application = require("application");
var observable = require("data/observable");
var pageData = new observable.Observable();
var StorageUtil = require("~/util/StorageUtil");
var ComputeUtil = require("~/util/ComputeUtil");
var InfoUtil = require("~/util/InfoUtil");
var imageModule = require("ui/image");
var frameModule = require("ui/frame");
var gestures = require("ui/gestures");

// var firebase = require("nativescript-plugin-firebase");


var pageData;
var page;

exports.pageLoaded = function (args) {

	page = args.object;
	page.bindingContext = pageData;
	pageData.set("showWarning", false);
	pageData.set("secondWarning", false);
	StorageUtil.setPillState();
	initGreeting();
	var cycleDay = ComputeUtil.getCycleDay();
	initMessage(cycleDay);
	exports.showWarning();
	addNumber(cycleDay);
	var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
		//If swipe down on the screen, go to extended page
		if (args.direction == 4) {
			frameModule.topmost().navigate({
				moduleName: 'views/extendedView/extendedView',
				animated: true,
				transition: {
					name: "slideTop",
					duration: 450,
					curve: "easeIn"
				}
			});
		}
	});

	//push data to database
	/*firebase.push(
	  '/users',
	  {
	    'first': 'Eddy',
	    'last': 'Verbruggen',
	    'birthYear': 1977,
	    'isMale': true,
	    'address': {
	      'street': 'foostreet',
	      'number': 123
	    }Orth
	  }
	).then(
	  function (result) {
	    console.log("created key: " + result.key);
	  }
	);*/


};

function addNumber(cycleDay) {
	str = "res://" + cycleDay;
	pageData.set("number", str);
}

exports.showWarning = function () {
	var minsTillPill = StorageUtil.minsTillBirthControl();
	var simpleTime = ComputeUtil.printSimpleBCTime();
	var reminderState = InfoUtil.nextPillAt();
	var tookPillToday = ComputeUtil.tookPillToday();
	if (reminderState == "normal") {
		showNormalReminder(minsTillPill, simpleTime, tookPillToday);
	} else if (reminderState == "asap") {
		showAsapReminder();
	} else if (reminderState == "two-asap") {
		showTwoAsapReminder();
	} else if (reminderState == "tomorrow") {
		showTomorrowReminder();
	}
}

showNormalReminder = function (minsTillPill, simpleTime, tookPillToday) {
	if (minsTillPill < 60 && !tookPillToday) {
		pageData.set("showWarning", true);
		var msg = "Your pill is scheduled for " + simpleTime + ". \n Did you take your pill?";
		pageData.set("pillReminder", msg);
	}
}

//TODO: when to show this??
showTomorrowReminder = function () {
	pageData.set("showWarning", true);
	var msg = "Your pill is scheduled for " + simpleTime + ". \n Did you take your pill?";
	pageData.set("pillReminder", msg);
}

showAsapReminder = function () {
	pageData.set("showWarning", true);
	var msg = "Take your pill asap. \n Did you take your pill?";
	pageData.set("pillReminder", msg);

}

showTwoAsapReminder = function () {
	pageData.set("showWarning", true);
	var msg = "You missed 2 pills. Take 2 pills today and 2 tomorrow. \n Did you take two pills today?";
	pageData.set("pillReminder", msg);
}

exports.dismiss = function () {
	//record pill taken
	var rightNow = new Date();
	StorageUtil.setlastTimePillTaken(rightNow.toISOString());
	pageData.set("showWarning", false);
}

exports.continueAlert = function () {
	pageData.set("pillReminder", "You should take your pill as soon as possible");
	pageData.set("secondWarning", true);

}


// E.g. Good Morning, Radha, where intro = "Good Morning, "
function initGreeting() {
	var intro = StorageUtil.getGreeting();
	var name = StorageUtil.getName();
	var greeting = intro + name + ".";
	pageData.set("greeting", greeting);
}

// Daily tips and recommendations preview
function initMessage(cycleDay) {
	var message = InfoUtil.getMessage(cycleDay);
	pageData.set("message", message);
}

//If tap on the arrow, go to extended page
exports.goToExtendedView = function () {
	frameModule.topmost().navigate({
		moduleName: 'views/extendedView/extendedView',
		animated: true,
		transition: {
			name: "slideTop",
			duration: 450,
			curve: "easeIn"
		}
	});
}