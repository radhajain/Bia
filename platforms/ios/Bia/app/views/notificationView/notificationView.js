var application = require("application");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var pageData = new observable.Observable();
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
var StorageUtil = require("~/util/StorageUtil");
var ComputeUtil = require("~/util/ComputeUtil");
var platform = require("platform");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");

var page;
var pageData;

exports.pageLoaded = function (args) {
	page = args.object;
	page.bindingContext = pageData;
	pageData.set("showCustom", false);
	if (StorageUtil.getNotificationEnabled()) {
		var yesPush = page.getViewById("yesPush");
		yesPush.className = "buttonSelected";
	} else {
		var noPush = page.getViewById("noPush");
		noPush.className = "buttonSelected";
	}
}


/*********************
SET WHETHER USES PUSH NOTIFICATION*
*********************/


exports.setEnablePushNotif = function () {
	var useNotif = StorageUtil.getNotificationEnabled();
	if (!useNotif) {
		StorageUtil.setNotificationEnabled(true);
	}
	clearSelected();
	page.getViewById("yesPush").className = "buttonSelected";
}


exports.setDisablePushNotif = function () {
	var useNotif = StorageUtil.getNotificationEnabled();
	if (useNotif) {
		StorageUtil.setNotificationEnabled(false);
	}
	clearSelected();
	page.getViewById("noPush").className = "buttonSelected";
}


function clearSelected() {
	page.getViewById("yesPush").className = "buttonOption";
	page.getViewById("noPush").className = "buttonOption";

}



/*********************
UPDATE & SAVE CHANGES*
*********************/



//If update time, still shows dialog
exports.goToSettingsView = function () {

	frameModule.topmost().navigate('views/settingsView/settingsView');
}