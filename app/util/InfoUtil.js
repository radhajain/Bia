var application = require("application");
var StorageUtil = require("~/util/StorageUtil.js");
var ComputeUtil = require("~/util/ComputeUtil.js");

var combinedResponse = {
	ok: "You're all set!",
	late: "You are late. Remember to take your pill.",
	missed: {
		week1or2: "You missed a pill. Take it asap! \n You don't need to use additional protection.",
		week3: "You missed a pill. Take it asap! \n You don't need to use any backup birth control.",
		week4: "You missed a pill. Discard the missed pill and take your next pill at normal time tomorrow. \n \n You don't need additional protection."
	},
	missed2: {
		week1or2: "You missed two pills. Take two pills today, and two pills tomorrow. \n \n Use backup birth control for the next 7 days.",
		week3: "You missed two pills. Start a new pack and take the pill asap. \n \n Use backup birth control for the next 7 days.",
		week4: "You missed two pills. Discard your missed pills and take your next pill at normal time tomorrow. \n \n You don't need to use additional protection."
	},
	missed3: {
		week1or2: "You missed three pills. Start a new pack, and use backup birth control for the next 7 days.",
		week3: "You missed three pills. Start a new pack. \n \n Use backup birth control for the next 7 days.", //start a new pack when? today? if so- change reminder state to asap
		week4: "You missed three pills. Discard your missed pill and take your next pill at normal time tomorrow. \n \n You don't need to use additional protection."
	},
	twoToday: "Take two pills at your regular time. \n\n Use backup birth control for the next 7 days.",
	twoTomorrow: "You're all set for today. Take two pills at your regular time tomorrow. \n\n Use backup birth control for the next 7 days.",
	newPackToday: "Start a new pack at your regular time today. \n\n Use additional protection for the next 7 days."
}

var combinedReminder = {
	ok: "normal",
	late: "asap",
	twoToday: "twoToday",
	twoTomorrow: "twoTomorrow",
	newPackToday: "newPackToday",
	missed: {
		week1or2: "asap",
		week3: "asap",
		week4: "normal"
	},
	missed2: {
		week1or2: "two-asap",
		week3: "normal",
		week4: "normal"
	},
	missed3: {
		week1or2: "normal",
		week3: "normal",
		week4: "normal"
	},
	
}


var popResponse = {
	ok: "You're all set!",
	late: "You are late. Remember to take your pill.",
	missed: {
		closerToNextDose: "You missed a pill. Discard your missed pill, and take your next pill as normal. \n \n Use additional protection for 48 hours.",
		notCloserToNextDose: "You missed a pill. Take it as soon as possible and then take your next pill as normal. \n \n Use additional protection for 48 hours."
	},
}


var popReminder = {
	ok: "normal",
	late: "asap",
	missed: {
		closerToNextDose: "normal",
		notCloserToNextDose: "asap"
	}

}


var notificationText = ["Time to take your pill!", "The sunset will be clear tonight"]


exports.getNotificationText = function() {
	return notificationText;
}

exports.addNotificationOption = function(msg) {
	notificationText.push(msg);
}

exports.getMissedTwoResponse = function() {
	var week = ComputeUtil.getCycleWeek();
	if (week == 1 || week == 2) {
		if (ComputeUtil.tookPillToday()) {
			return "twoTomorrow";
		} else {
			return "twoToday";
		}
	} else if (week == 3) {
		return "newPackToday";
	} else {
		return "ok";
	}
}


//For special cases when the user misses a pill
// Used in homeView to determine when to show a warning
exports.nextPillAt = function () {
	var state = StorageUtil.getPillState();
	var week = ComputeUtil.getCycleWeek();
	if (StorageUtil.getBirthControlType() == "combined") {
		return getCombinedReminderState(state, week);
	} else {
		return getPOPReminderState(state, week);
	}
}

function getPOPReminderState(state, week) {
	var reminderState = popReminder[state];
	if (state == "ok" || state == "late") {
		return reminderState;
	} else {
		if (ComputeUtil.PopCloserDose() == "discard") {
			return reminderState["closerToNextDose"];
		} else {
			return reminderState["notCloserToNextDose"];
		}
	}
}


function getCombinedReminderState(state, week) {
	var reminderState = combinedReminder[state];
	if (state == "ok" || state == "late" || state == "twoToday" || state == "newPackToday" || state == "twoTomorrow") {
		return reminderState;
	} else {
		if (week == 1 || week == 2) {
			return reminderState["week1or2"];
		} else if (week == 3) {
			return reminderState["week3"];
		} else if (week == 4) {
			return reminderState["week4"];
		}
	}
	return reminderState;
}






exports.getLatePeriod = function () {
	var bctype = StorageUtil.getBirthControlType();
	if (bctype == "combined") {
		return 24;
	} else {
		return 3;
	}
}


exports.getMessage = function () {
	var state = StorageUtil.getPillState();
	var bcType = StorageUtil.getBirthControlType();
	if (bcType == "combined") {
		return combinedMessage(state);
	} else {
		return popMessage(state);
	}
}

function combinedMessage(state) {
	var week = ComputeUtil.getCycleWeek();
	var messageState = combinedResponse[state];
	if (state == "ok" || state == "late" || state == "twoToday" || state == "nextPackToday" || state == "twoTomorrow") {
		return messageState;
	} else {
		if (week == 1 || week == 2) {
			return messageState["week1or2"];
		} else if (week == 3) {
			return messageState["week3"];
		} else if (week == 4) {
			return messageState["week4"];
		}
	}
}

function popMessage(state) {
	var messageState = popResponse[state];
	if (state == "ok") {
		return messageState;
	} else {
		if (ComputeUtil.PopCloserDose() == "discard") {
			return messageState["closerToNextDose"];
		} else {
			return messageState["notCloserToNextDose"];
		}
	}

}

// exports.getExpectations = function (day) {
// 	//----TEMP-----
// 	// Replace with array (object?) of messages
// 	var message = "These pills have the highest estrogen. You might be feeling a higher sex drive!";
// 	return message;
// 	//-----TEMP----
// }

// exports.getRecommendations = function (day) {
// 	//----TEMP-----
// 	// Replace with array (object?) of messages
// 	var recommendations = "Order some more pills! You need to refill you pill pack in 8 days. \n\n";
// 	return recommendations;
// 	//-----TEMP----
// }


exports.getQuote = function () {
	return {
		quote: "Girls should never be afraid to be smart",
		author: "Emma Watson"
	};
}