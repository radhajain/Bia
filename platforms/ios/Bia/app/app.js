/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require("./bundle-config");
var application = require("application");
var StorageUtil = require('~/util/StorageUtil');

if (StorageUtil.isOnboardingComplete()) {
    application.start({
        moduleName: "views/homeView/homeView"
    });
} else {
    application.start({
        moduleName: "views/onboarding/nameView/nameView"
    });
}

application.run({
    moduleName: "app-root"
});

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/