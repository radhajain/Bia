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
	//TEMP
	var temp = new Date();
	var otherTemp = new Date();
	otherTemp.setDate(temp.getDate() - 3);
	StorageUtil.setlastTimePillTaken(otherTemp);
	//TEMP
	page = args.object;
	page.bindingContext = pageData;
	pageData.set("showWarning", false);
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
	console.log("pill state is: " + StorageUtil.getPillState());
	console.log("reminder state is: " + reminderState);
	if (reminderState == "normal") {
		showNormalReminder(minsTillPill, simpleTime, tookPillToday);
	} else if (reminderState == "asap") {
		showAsapReminder(simpleTime);
	} else if (reminderState == "two-asap") {
		showTwoAsapReminder();
	}
}

showNormalReminder = function (minsTillPill, simpleTime, tookPillToday) {
	if (minsTillPill < 60 && !tookPillToday) {
		pageData.set("showWarning", true);
		var msg = "Your pill is scheduled for " + simpleTime + ". \n Did you take your pill?";
		pageData.set("pillReminder", msg);
	}
}

showAsapReminder = function (simpleTime) {
	var BCLateTime = StorageUtil.getBirthControlTime();
	BCLateTime.setHours(BCLateTime.getHours() + InfoUtil.getLatePeriod());
	var simpleLateTime = ComputeUtil.printSimpleTime(BCLateTime.getHours(), BCLateTime.getMinutes());
	pageData.set("showWarning", true);
	var msg = "Your pill was scheduled for " + simpleTime + ". \n If you take it before " + simpleLateTime.hours + ":" + simpleLateTime.min + simpleLateTime.ampm + " you will be protected. Take it asap!";
	pageData.set("pillReminder", msg);

}

showTwoAsapReminder = function () {
	pageData.set("showWarning", true);
	var msg = "You missed 2 pills. Take 2 pills today and 2 tomorrow. Use protection for the next 7 days. \n Did you take two pills today?";
	pageData.set("pillReminder", msg);
}

exports.dismiss = function () {
	//record pill taken
	var rightNow = new Date();
	if (StorageUtil.getPillState() == "late" && ComputeUtil.tookPillDayBeforeYesterday()) {
		//Set that took pill yesterday so that doesn't dismiss pill taken today.
		var yesterday = new Date();
		yesterday.setDate(rightNow.getDate() - 1);
		StorageUtil.setlastTimePillTaken(yesterday);
	} else {
		StorageUtil.setlastTimePillTaken(rightNow);
	}
	StorageUtil.setPillState();
	pageData.set("showWarning", false);
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