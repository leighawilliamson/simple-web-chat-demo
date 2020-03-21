(function () {
    /**
     * Start Configuration
     */
    //** Changed for UAMS Wordpress Install. https://uamshealth.com/wp-content/gsight/ -TM **//
    var baseUrl = "/wp-content/gsight";
    var config = {
        baseUrl: baseUrl,
        //
        // Your client id in the gsight database.  This should be given to you or pre-populated.
        //
        clientId: "be6cf801-5cc6-e811-813f-127688dae9b9",
        //
        // The url to the gsight api.  This shouldnt need to change in most cases.
        //
        gsightApiUrl: "https://portal.gsight.net",
        chaosDelay: 500,
        logoUrl: baseUrl + "/img/uams-logo_health_horizontal_dark_386x50.png",
        logoAlt: "University of Arkansas for Medical Sciences (UAMS) Logo",
        logoWidth: "386px",
        //
        // Set to true to auto load css/invite.css and css/client-styles.css.
        // If you need to load them somewhere other than where it is loaded in head,
        // set this to false and you can add the <link ... /> tags to your
        // layout/design yourself.  If this field is not defined, the default is true.
        //
        autoLoadCss: true,
        //
        // Set to true to use any existing jQuery that has been loaded.
        // Set to false to load a new jquery in no conflict mode if one is already loaded.
        //
        useExistingJQuery: false,
        invite: {
            // Every user will have a X percent chance to see the invite
            //** Changed from 50 to 75 at the request of gsight in an attempt to increase results. -BP **//
            //** Changed from 75 to 50 at to decrease popups because it was pissing me off. -BP **//
            samplingPercentage: 50,
            // At least X seconds will pass before the invite dialog is triggered
            //** Changed to 15 seconds from default 30 seconds. -TM **//
            popupDelayInSeconds: 15,
            //
            // The file name in templates minus the extension.
            // Ex) if you have myTemplate.html in the templates folder, the value for this setting
            // should be "myTemplate"
            //
            template: "invite",
            header: "Welcome!",
            content: "<p>Your opinion about this website is important to us. After your visit, would you be willing to answer a few questions to help us evaluate and improve our website? If you agree to take the survey, it will pop-up when you leave the website.</p>",
            nowButton: "Yes, after I leave the website",
            laterViaReminderButton: "Yes, later via text or email",
            neverButton: "Never",
            // A cookie will be added so that this user wont see the
            // invite for X days
            daysToWait: {
                // When the user clicks "Never"
                never: 365,
                // When the user clicks "Yes, Now" or "Later, via text"
                yes: 365
            },
            //
            // Use this to set ip address ranges where the invite popup should not display.
            // ex) ipFilters: ["192.168.1.0/24"] will block 192.168.1.0 - 192.168.1.255
            // https://www.ipaddressguide.com/cidr
            //
            ipFilters: []
        },
        survey: {
            header: "<h3>Do Not Close This Window!</h3><h4>Please minimize this window until after your visit.</h4>",
            content: "<p>Return to this window to provide your feedback. The questionnaire will become available here after a moment. You can continue browsing our website by selecting the main window. Thanks again for your help.</p>",
            width: 800,
            height: 600
        },
        later: {
            template: "later",
            header: "Contact Information",
            content: "<p>Please fill out the form below so we can send you the survey.</p>",
            sendButton: "Send me the survey",
            cancelButton: "Cancel"
        }
    };
    /**
     * End Configuration - Do not change below this line unless you know what you are doing,
     * or have been instructed to do so.
     */

    if (!window.require) {
        var scr = document.createElement("script");
        scr.src = config.baseUrl + "/vendor/requirejs/require.js";
        scr.type = "text/javascript";
        scr.async = false;
        document.head.appendChild(scr);
        scr.onload = function () {
            // Some shenanigans to prevent conflicts with websites that use custom code to asyncronously load some scripts
            // that happen to check for amd, but are not loaded in a way that supports it.
            // The delay caused by asyncronous loading ends up causing an anonymous define error with requirejs.
            var oldAmd = window.define.amd;
            window.define.amd = undefined;
            configureGSight(oldAmd);
        };
    } else {
        configureGSight();
    }

    function configureGSight(oldAmd) {
        var delay = config.chaosDelay;

        // dont delay in survey popup
        if (window.gsightSurveyPopup) {
            delay = 0;
        }

        // Delay configuring gsight to give host website's potential chaos a chance to finish exploding.
        // Adjust or remove this delay via config.chaosDelay
        setTimeout(function () {
            // Hopefully the dust has settled and amd can now be re-introduced without the hurting and the biting
            // and the kicking and screaming and shoving.  If not, increase config.chaosDelay as needed.
            if (oldAmd) {
                window.define.amd = oldAmd;
            }

            define("WebsiteClient/config", function () {
                return config;
            });

            if (window.jQuery && config.useExistingJQuery) {
                console.log("Jquery detected.  Configuring module to use it.");
                define("jquery", [], function () {
                    return jQuery;
                });
            }

            var paths = {
                "ejs": "vendor/ejs/ejs.min",
                "promise-polyfill": "vendor/promise-polyfill/promise.min",
                "js-cookie": "vendor/js-cookie/js.cookie.min",
                "ua-parser-js": "vendor/ua-parser/ua-parser.min",
                "moment": "vendor/momentjs/moment.min",
                "ipaddr": "vendor/ipaddr/ipaddr.min"
            };

            var map = {};

            if (!window.jQuery || !config.useExistingJQuery) {
                console.log("Jquery not detected.  Adding to requirejs");
                paths["jquery"] = "vendor/jquery/jquery.min";
                map = {
                    "*": { "jquery": "jquery-private" },
                    "jquery-private": { "jquery": "jquery" }
                };
            }

            var gsightRequire = require.config({
                baseUrl: config.baseUrl,
                context: "gsight2Website",
                paths: paths,
                shim: {
                    "ejs": {
                        exports: "ejs"
                    },
                    "ipaddr": {
                        exports: "ipaddr"
                    }
                },
                map: map
            });

            gsightRequire(["WebsiteClient"], function (WebsiteClient) {
                var client = new WebsiteClient();
                client.run();
            });
        }, delay);
    }
})();