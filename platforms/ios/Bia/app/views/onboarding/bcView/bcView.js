var application = require("application");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var pageData = new observable.Observable();
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
var StorageUtil = require("~/util/StorageUtil");
var ComputeUtil = require("~/util/ComputeUtil");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");

var page;
var pageData;
var currChoice;

exports.pageNavigating = function (args) {
    page = args.object;
    page.bindingContext = pageData;
    StorageUtil.setDefaultBCTime();
    pageData.set("showTimePicker", false);
    var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
        //If swipe down on the screen, go to extended page
        if (args.direction == 2) {
            exports.goToNextView();
        }
    });
}



/********************
   USER INTERACTIONS
*********************/

exports.setCombinedPill = function (args) {
    var combinedBtn = args.object;
    combinedBtn.className = "buttonSelected";
    if (currChoice !== "combined") {
        //Deselect the popBtn
        var popBtn = page.getViewById("popBtn");
        popBtn.className = "buttonOption";
        currChoice = "combined";
    }
}

exports.setPOPPill = function (args) {
    var popBtn = args.object;
    popBtn.className = "buttonSelected";
    if (currChoice !== "pop") {
        //Deselect the combinedBtn
        var combinedBtn = page.getViewById("combinedBtn");
        combinedBtn.className = "buttonOption";
        currChoice = "pop";
    }
}



exports.selectPillTime = function (args) {
    showPicker();
}

exports.onPickerLoaded = function (args) {
    //Auto load picker to the current stored birth control time
    var timePicker = args.object;
    var previousTime = StorageUtil.getBirthControlTime();
    timePicker.hour = previousTime.getHours();
    timePicker.minute = previousTime.getMinutes();
    var simpleTime = ComputeUtil.printSimpleBCTime();
    pageData.set("pillTime", simpleTime);
}

//When the user clicks "Save" for the updated BC time
//Store the new time in StorageUtilBCtime 
//Updates the button pill time
exports.setTime = function () {
    console.log("setting time...")
    var timePicker = page.getViewById("timePicker");
    var newTime = new Date();
    newTime.setHours(timePicker.hour);
    newTime.setMinutes(timePicker.minute);
    StorageUtil.setBirthControlTime(newTime);
    //Format to put in button
    var simpleTime = ComputeUtil.printSimpleTime(timePicker.hour, timePicker.minute);
    pageData.set("pillTime", simpleTime.hours + ":" + simpleTime.min + simpleTime.ampm);
    hidePicker();

}

function showPicker() {
    pageData.set("showTimePicker", true);
}

function hidePicker() {
    pageData.set("showTimePicker", false);

}



/*********************
UPDATE & SAVE CHANGES*
*********************/


exports.updateBCTime = function () {
    var timePicker = page.getViewById("timePicker");
    var newTime = new Date();
    newTime.setHours(timePicker.hour);
    newTime.setMinutes(timePicker.minute);
    console.log(newTime.toString());
    StorageUtil.setBirthControlTime(newTime);

}

exports.goToNextView = function () {
    exports.updateBCTime();
    if (currChoice == "combined") {
        StorageUtil.setBirthControlType("combined")
    } else if (currChoice == "pop") {
        StorageUtil.setBirthControlType("progesterin-only");
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
    frameModule.topmost().navigate('views/onboarding/periodView/periodView');
}