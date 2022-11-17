(function() {
    "use strict";
    var win = window;
    var creatives = (win._$OGO$_ || (win._$OGO$_ = {})) &&  (win._$OGO$_.Rosetta || (win._$OGO$_.Rosetta = {})) && (win._$OGO$_.Rosetta.creatives || (win._$OGO$_.Rosetta.creatives = []));
    var Rosetta = win._$OGO$_.Rosetta;
    var require =  Rosetta.requirejs || require;

    function Creative(dmo){
        /* [START_CUSTOM_VARIABLES] */
        /* [END_CUSTOM_VARIABLES] */

        var registeredCallbacks = [], environStatuses = [],environTotals = 3, isEnvironReady = false, isCreativeReady = false;
        var R, Platform, Settings, Analytics, AnalyticsContent, TweenMax, TweenLite, TimelineLite, TimelineMax, EventForwarding, Hammer/* [INSERT_PLUGIN_VARS] */;

        var ROSETTA_VERSION = "4.40";
        var context = String(ROSETTA_VERSION + "_"  + dmo.embedId).split("_").join(".");
        var parentDiv, stage, animate, timeoutTimer, startTimer, FOF_PIXEL_DENSITY;
        var evergreenImg = "evergreen.jpg";
        var CENTER_STAGE = false;

        function init(wrapperID) {
            var subdirectory = "52879_LCH_INT";
            var creativeName = "" || subdirectory;
            var companyID = "2412";
            var isSecure = (dmo.externalURL.indexOf("https:") > -1);



            var config = {
                context: context,
                waitSeconds: 5,
                paths: {},
                bundles: {
                    "Rosetta":["core.pack","ad.pack","cnvr.advantage.pack","cnvr.usweb.pack","filters.pack","xmlpush.pack","tweenmax.pack","alignmentgroup.pack"]
                }
            };

            config.bundles.Rosetta = (function(bundles){
                if (typeof Object.create !== 'function'){
                    var compatible = ["static.pack"];
                    for (var i=0; i<bundles.length; i++){
                        if (bundles[i].indexOf("cnvr.") > -1){
                            compatible.push(bundles[i]);
                        }
                    }
                    if (typeof dmo.rosettaBundles === "function"){compatible = dmo.rosettaBundles(compatible)} //jshint:ignore
                    try {
                        if (dmo && dmo.logEvent && typeof dmo.logEvent === "function"){
                            dmo.logEvent.call(dmo, 210, 'Object.create');
                        }
                    } catch(e){};
                    return compatible;
                }
                return bundles;
            })(config.bundles.Rosetta);


            dmo.atomSuffix = dmo.atomSuffix || "";
            config.paths["Rosetta"] = dmo.externalURL + "/atom/"+ROSETTA_VERSION+"/3.0.0/?scripts=" + "wrapper_start," + config.bundles.Rosetta.join(",") + ",wrapper_end" + dmo.atomSuffix;

            var req = require.config(config);
            req( ['require'].concat(config.bundles.Rosetta), function() {
                var Core = req("core/Core");
                Platform = req("platform/Platform");
                Settings = req("display/settings/GlobalSettings");
                Analytics = req("core/analytics/Analytics");
                AnalyticsContent = req("core/analytics/AnalyticsContent");
                EventForwarding = req("core/eventforwarding/EventForwarding");
                R = new Core();
                if (typeof dmo.rosettaLoaded === "function"){dmo.rosettaLoaded(req, R)}
                if (wrapperID){
                    Settings.overwrite({prefix: wrapperID + "_"});
                    parentDiv = document.getElementById(wrapperID);
                }
                parentDiv = parentDiv || document.body;
                Platform.overwrite({
                    isSecure:isSecure,
                    rosettaVersion:ROSETTA_VERSION,
                    placementWidth:Number(dmo.mediaWidth) || 320,
                    placementHeight:Number(dmo.mediaHeight) || 480,
                    clientID:dmo.companyId || companyID
                });
                R.setFallback(fallback);

                if (R.isCompatible === true) {
                    R.parseParameters(dmo.flashVars, 'flashvars');
                    Platform.overwrite({
                        clientID: R.create("var").set({name:"company_id", dataType:"String", defaultValue:Platform.fetch().clientID}).render().value(),
                        cacheBuster: R.create("var").set({name:"bypass_cache", dataType:"Boolean", defaultValue:false, exposed:false}).render().value(),
                        subdirectory:R.create("var").set({name:"subdirectory", dataType:"String", defaultValue:subdirectory}).render().value(),
                        FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"2.1.6", exposed:false}).render().value(),
                        isSecure: R.create("var").set({name:"dtm_secure", dataType:"Boolean", defaultValue:Platform.fetch().isSecure, exposed:false}).render().value(),
                        analytics: dmo.logEvent,
                        analyticsScope: dmo
                    });
                    if (R.create("var").set({name:"disable_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value() === false
                        && (R.environment.isRetina === true || R.create("var").set({name:"force_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value())) {
                        Settings.overwrite({pixelDensity: 2})
                    }
                    FOF_PIXEL_DENSITY =  (function(){
                        var pxDensity = R.create("var").set({name:"fof_pixel_density", dataType:"Number", exposed:false, defaultValue:Settings.fetch().pixelDensity}).render().value();
                        pxDensity = Math.round(pxDensity);
                        if (pxDensity !== 1 && pxDensity !== 2){
                            pxDensity = Settings.fetch().pixelDensity;
                        }
                        return pxDensity;
                    })();
                    startTimer = function(){
                        var timeout = R.create("var").set({name:"default_timeout", dataType:"Number", defaultValue:5, exposed:false}).render().value();
                        timeoutTimer = setTimeout(function(){
                            var timeoutInstance = {
                                event:AnalyticsContent.FALL_BACK,
                                failReason: {
                                    type:AnalyticsContent.TIMED_OUT,
                                    details: timeout
                                }
                            };
                            R.fallback(timeoutInstance)
                        }, timeout*1000);
                    };
                    if (CENTER_STAGE){
                        Analytics.fire({
                            event: AnalyticsContent.INIT,
                            instance: reveal,
                            details:creativeName
                        });
                        var pds = parentDiv.style;
                        pds.marginTop = -(Number(Platform.fetch().placementHeight) * .5) + "px";
                        pds.marginLeft = -(Number(Platform.fetch().placementWidth) * .5) + "px";
                        pds.top = "50%";
                        pds.left = "50%";
                        pds.position = "absolute";
                    }
                    evergreenImg = R.create("var").set({name:"evergreen_img", dataType:"String", defaultValue:evergreenImg}).render().value();
                    assignSelector();
                    createElements();
                } else {
                    logEnvironStatus("NOT_COMPATIBLE", true);
                    try {
                        if (dmo && dmo.logEvent && typeof dmo.logEvent === "function"){
                            if (config.bundles.Rosetta.join(",").indexOf("static.pack") === -1){
                                dmo.logEvent.call(dmo, 210, 'R.isCompatible');
                            }
                        }
                    } catch (e){}
                    R.fallback();
                }
            }, function(e){
                log(e);
            });

            return reveal;
        }

        function createElements(){
            animate = animateElements;
            logEnvironStatus("createElements", "start");

            var width = R.create("var").set({name:"width", dataType:"Number", defaultValue:Platform.fetch().placementWidth, exposed:false}).render().value();
            var height = R.create("var").set({name:"height", dataType:"Number", defaultValue:Platform.fetch().placementHeight, exposed:false}).render().value();
            var borderColor = R.create("var").set({name: "border_color", dataType: "String", defaultValue: "#CCCCCC"}).render().value();

            stage = R.create("div").set({id:"stage", width: width, height: height, backgroundColor:"#FFFFFF", className: "stage"});
            parentDiv.appendChild(stage.element);
            Settings.overwrite({stage: stage});
            new EventForwarding().init({stage:stage});
            var borders = {
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:287,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:287, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:287, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:287, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
            R.applyCSSReset(".stage");

            
			var f1_headline_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f1_headline_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 24,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.08,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f1_headline_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f1_headline_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 20,
					top: 400,
					width: 280,
					height: 29,
					zIndex: 154,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f1_headline_text",
					textContent: R.create("var").set({name:"f1_headline_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			});

			var f1_subhead_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f1_subhead_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 12,
					fontFamily: 11000,
					fontStyle: "Italic",
					lineHeight: 1.17,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 3,
					backgroundColor: R.create("var").set({name:"f1_subhead_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f1_subhead_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 20,
					top: 432,
					width: 280,
					height: 18,
					zIndex: 153,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f1_subhead_text",
					textContent: R.create("var").set({name:"f1_subhead_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			});

			var f2_headline3_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_headline3_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 36,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 0.94,
					letterSpacing: 0,
					textAlign: "right",
					verticalAlign: "bottom",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_headline3_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_headline3_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 52,
					top: 72,
					width: 226,
					height: 38,
					zIndex: 136,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_headline3_text",
					textContent: R.create("var").set({name:"f2_headline3_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_subhead3_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_subhead3_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 9,
					fontFamily: 11000,
					fontStyle: "Italic",
					lineHeight: 1.2,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "top",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_subhead3_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_subhead3_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 37,
					top: 134,
					width: 78,
					height: 58,
					zIndex: 133,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_subhead3_text",
					textContent: R.create("var").set({name:"f2_subhead3_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_cta3_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_cta3_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 10,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.2,
					letterSpacing: 0.2,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_cta3_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_cta3_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 153,
					top: 336,
					width: 130,
					height: 17,
					zIndex: 130,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_cta3_text",
					textContent: R.create("var").set({name:"f2_cta3_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				},
				data:{
					hitIndex: 3
				}
			}).render().on("click", adHit);

			var f2_headline2_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_headline2_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 36,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 0.94,
					letterSpacing: 0,
					textAlign: "left",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_headline2_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_headline2_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 42,
					top: 75,
					width: 226,
					height: 38,
					zIndex: 127,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_headline2_text",
					textContent: R.create("var").set({name:"f2_headline2_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_subhead2_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_subhead2_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 9,
					fontFamily: 11000,
					fontStyle: "Italic",
					lineHeight: 1.2,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "top",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_subhead2_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_subhead2_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 196,
					top: 124,
					width: 88,
					height: 46,
					zIndex: 124,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_subhead2_text",
					textContent: R.create("var").set({name:"f2_subhead2_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_cta2_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_cta2_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 10,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.2,
					letterSpacing: 0.2,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_cta2_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_cta2_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 40,
					top: 331,
					width: 130,
					height: 17,
					zIndex: 121,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_cta2_text",
					textContent: R.create("var").set({name:"f2_cta2_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				},
				data:{
					hitIndex: 2
				}
			}).render().on("click", adHit);

			var f2_headline1_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_headline1_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 36,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 0.94,
					letterSpacing: 0,
					textAlign: "right",
					verticalAlign: "bottom",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_headline1_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_headline1_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 50,
					top: 79,
					width: 226,
					height: 38,
					zIndex: 118,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_headline1_text",
					textContent: R.create("var").set({name:"f2_headline1_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_subhead1_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_subhead1_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 9,
					fontFamily: 11000,
					fontStyle: "Italic",
					lineHeight: 1.2,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "top",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_subhead1_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_subhead1_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 24,
					top: 284,
					width: 88,
					height: 47,
					zIndex: 115,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_subhead1_text",
					textContent: R.create("var").set({name:"f2_subhead1_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				}
			}).render();

			var f2_cta1_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_cta1_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 10,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.2,
					letterSpacing: 0.2,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_cta1_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_cta1_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 138,
					top: 346,
					width: 130,
					height: 17,
					zIndex: 112,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_cta1_text",
					textContent: R.create("var").set({name:"f2_cta1_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				},
				data:{
					hitIndex: 1
				}
			}).render().on("click", adHit);

			var f2_cta4_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_cta4_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 12,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.2,
					letterSpacing: 0.24,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_cta4_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_cta4_text_padding", defaultValue:"7px 20px 7px 20px", dataType:"String", required:false, exposed:true}).render().value(),
					left: 42,
					top: 431,
					width: 235,
					height: 34,
					zIndex: 108,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:false
				},
				attr:{
					id: "f2_cta4_text",
					textContent: R.create("var").set({name:"f2_cta4_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				},
				data:{
					hitIndex: 4
				}
			}).render().on("click", adHit);

			var logo_bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: 202,
					width: 320,
					height: 65,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"logo_bg_color", defaultValue:"#ffffff", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "logo_bg_color"
				}
			}).render();

			var f1_text_bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 388,
					zIndex: 149,
					width: 320,
					height: 92,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f1_text_bg_color", defaultValue:"#e4ac98", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f1_text_bg_color"
				}
			}).render();

			var f1_bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 65,
					zIndex: 147,
					width: 320,
					height: 414,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f1_bg_color", defaultValue:"#ffffff", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f1_bg_color"
				}
			}).render();

			var f2_bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 65,
					zIndex: 34,
					width: 320,
					height: 972,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f2_bg_color", defaultValue:"#ffffff", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f2_bg_color"
				}
			}).render();

			var bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: 2,
					width: 320,
					height: 480,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"#ffffff", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "bg_color"
				}
			}).render();

			var fg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"fg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 277,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"fg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "fg_img"
				}
			}).render();

			var style_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"style_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 274,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"style_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "style_img"
				}
			}).render();

			var logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"logo_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 207,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "logo_img"
				}
			}).render();

			var f1_cta_arrow_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_cta_arrow_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 149,
					top: 462,
					width: 23,
					height: 8,
					zIndex: 197,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_cta_arrow_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_cta_arrow_img"
				}
			}).render();

			var f1_lifestyle1_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle1_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 65,
					width: 104,
					height: 156,
					zIndex: 190,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle1_img"
				}
			}).render();

			var f1_lifestyle2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle2_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 108,
					top: 65,
					width: 104,
					height: 156,
					zIndex: 185,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle2_img"
				}
			}).render();

			var f1_lifestyle3_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle3_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 216,
					top: 65,
					width: 104,
					height: 156,
					zIndex: 172,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle3_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle3_img"
				}
			}).render();

			var f1_lifestyle4_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle4_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 226,
					width: 104,
					height: 156,
					zIndex: 168,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle4_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle4_img"
				}
			}).render();

			var f1_lifestyle5_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle5_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 108,
					top: 226,
					width: 104,
					height: 156,
					zIndex: 164,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle5_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle5_img"
				}
			}).render();

			var f1_lifestyle6_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle6_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 216,
					top: 226,
					width: 104,
					height: 156,
					zIndex: 160,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f1_lifestyle6_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle6_img"
				}
			}).render();

			var scroll_scrubber_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"scroll_scrubber_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 308,
					top: 86,
					width: 6,
					height: 26,
					zIndex: 143,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"scroll_scrubber_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "scroll_scrubber_img"
				}
			}).render();

			var scroll_bar_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"scroll_bar_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 309,
					top: 86,
					width: 3,
					height: 366,
					zIndex: 140,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"scroll_bar_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "scroll_bar_img"
				}
			}).render();

			var f2_lifestyle5_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle5_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 54,
					top: 224,
					width: 90,
					height: 135,
					zIndex: 104,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle5_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle5_img"
				}
			}).render();

			var f2_lifestyle5_bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle5_bg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 49,
					top: 218,
					width: 100,
					height: 146,
					zIndex: 95,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle5_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle5_bg_img"
				}
			}).render();

			var f2_lifestyle6_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle6_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 127,
					top: 98,
					width: 153,
					height: 230,
					zIndex: 90,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle6_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle6_img"
				}
			}).render();

			var f2_lifestyle4_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle4_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 177,
					top: 194,
					width: 90,
					height: 135,
					zIndex: 81,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle4_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle4_img"
				}
			}).render();

			var f2_lifestyle4_bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle4_bg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 172,
					top: 188,
					width: 100,
					height: 146,
					zIndex: 72,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle4_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle4_bg_img"
				}
			}).render();

			var f2_lifestyle3_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle3_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 36,
					top: 105,
					width: 146,
					height: 219,
					zIndex: 67,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle3_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle3_img"
				}
			}).render();

			var f2_lifestyle1_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 52,
					top: 128,
					width: 92,
					height: 138,
					zIndex: 58,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle1_img"
				}
			}).render();

			var f2_lifestyle1_bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle1_bg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 46,
					top: 121,
					width: 104,
					height: 152,
					zIndex: 49,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle1_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle1_bg_img"
				}
			}).render();

			var f2_lifestyle2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_lifestyle2_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 125,
					top: 106,
					width: 156,
					height: 234,
					zIndex: 44,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle2_img"
				}
			}).render();

			var bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"bg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 5,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "bg_img"
				}
			}).render();

			
			/* [BATCH_LOADING] */
			var requiredArr = [logo_img, f1_lifestyle1_img, f1_lifestyle2_img, f1_lifestyle3_img, f1_lifestyle4_img, f1_lifestyle5_img, f1_lifestyle6_img];
			var group1Array = [f1_headline_text, f1_subhead_text];
			var allElementsArr = [f2_headline3_text, f2_subhead3_text, f2_cta3_text, f2_headline2_text, f2_subhead2_text, f2_cta2_text, f2_headline1_text, f2_subhead1_text, f2_cta1_text, f2_cta4_text, fg_img, style_img, f1_cta_arrow_img, scroll_scrubber_img, scroll_bar_img, f2_lifestyle5_img, f2_lifestyle5_bg_img, f2_lifestyle6_img, f2_lifestyle4_img, f2_lifestyle4_bg_img, f2_lifestyle3_img, f2_lifestyle1_img, f2_lifestyle1_bg_img, f2_lifestyle2_img, bg_img, logo_bg_color, f1_text_bg_color, f1_bg_color, f2_bg_color, bg_color];
			
			var group1 = R.create("AlignmentGroup").set({
				verticalAlign: "middle"
			}).add(group1Array).render();
			
			function additionalSettings() {
				};
			
			var megaBatch = R.create("batch")
				.require(requiredArr)
				.add(group1Array)
				.add(allElementsArr)
				.render({
					success: function(){
						displayLoaded([
							R.filter.success(requiredArr),
							R.filter.success(group1Array),
							R.filter.success(allElementsArr)
							]);
						creativeReady();
					},
					fail: function(e){
						R.fallback(e);
					}
				});
				
			function displayLoaded(loaded){
				for(var i = 0; i < loaded.length; i++){
					for(var j = 0;  j < loaded[i].length; j++){
						if(loaded[i][j] && loaded[i][j].element){
							loaded[i][j].visibility = "";
						}
					}
				}
			};
			
			var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
			hit_area.on("click", adHit);
				
			//ADDING CTT JUNK VARS
			R.create("var").set({name:"duration", defaultValue:"", dataType:"Number", required:false, exposed:true});
			
            /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
            hit_area.on("click", adHit); */

            /* [END_CREATE_ELEMENTS] */
            //creativeReady()

            // All Animation goes here
            function animateElements() {
                var frame_1_in = new TimelineMax()
					if(logo_img.element){frame_1_in.from(logo_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_cta_arrow_img.element){frame_1_in.from(f1_cta_arrow_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle1_img.element){frame_1_in.from(f1_lifestyle1_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle2_img.element){frame_1_in.from(f1_lifestyle2_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle3_img.element){frame_1_in.from(f1_lifestyle3_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle4_img.element){frame_1_in.from(f1_lifestyle4_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle5_img.element){frame_1_in.from(f1_lifestyle5_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_lifestyle6_img.element){frame_1_in.from(f1_lifestyle6_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f1_headline_text.element){frame_1_in.from(f1_headline_text.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0.5)};
					if(f1_subhead_text.element){frame_1_in.from(f1_subhead_text.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0.5)};
					if(f1_text_bg_color.element){frame_1_in.from(f1_text_bg_color.element, 0.75, {top: 480, ease: 'Power1.easeInOut'}, 0)};
					
				var frame_1_out = new TimelineMax()
					if(f1_cta_arrow_img.element){frame_1_out.to(f1_cta_arrow_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle1_img.element){frame_1_out.to(f1_lifestyle1_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle2_img.element){frame_1_out.to(f1_lifestyle2_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle3_img.element){frame_1_out.to(f1_lifestyle3_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle4_img.element){frame_1_out.to(f1_lifestyle4_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle5_img.element){frame_1_out.to(f1_lifestyle5_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_lifestyle6_img.element){frame_1_out.to(f1_lifestyle6_img.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_headline_text.element){frame_1_out.to(f1_headline_text.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_subhead_text.element){frame_1_out.to(f1_subhead_text.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					if(f1_text_bg_color.element){frame_1_out.to(f1_text_bg_color.element, 1.25, {top: 480, ease: 'Power1.easeInOut'}, 4)};
					if(f1_bg_color.element){frame_1_out.to(f1_bg_color.element, 1.25, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3.5)};
					
				var frame_2_in = new TimelineMax()
					if(scroll_scrubber_img.element){frame_2_in.from(scroll_scrubber_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(scroll_bar_img.element){frame_2_in.from(scroll_bar_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0)};
					if(f2_headline3_text.element){frame_2_in.from(f2_headline3_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 6)};
					if(f2_subhead3_text.element){frame_2_in.from(f2_subhead3_text.element, 0.75, {left: -115, ease: 'Power1.easeInOut'}, 6)};
					if(f2_cta3_text.element){frame_2_in.from(f2_cta3_text.element, 0.75, {left: -283, ease: 'Power1.easeInOut'}, 6)};
					if(f2_subhead2_text.element){frame_2_in.from(f2_subhead2_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 3)};
					if(f2_cta2_text.element){frame_2_in.from(f2_cta2_text.element, 0.75, {left: -170, ease: 'Power1.easeInOut'}, 3)};
					if(f2_headline1_text.element){frame_2_in.from(f2_headline1_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 0)};
					if(f2_subhead1_text.element){frame_2_in.from(f2_subhead1_text.element, 0.75, {left: -112, ease: 'Power1.easeInOut'}, 0)};
					if(f2_cta1_text.element){frame_2_in.from(f2_cta1_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 0)};
					if(f2_cta4_text.element){frame_2_in.from(f2_cta4_text.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 3)};
					if(f2_lifestyle5_img.element){frame_2_in.from(f2_lifestyle5_img.element, 0.75, {left: -144, ease: 'Power1.easeInOut'}, 6)};
					if(f2_lifestyle5_bg_img.element){frame_2_in.from(f2_lifestyle5_bg_img.element, 0.75, {left: -149, ease: 'Power1.easeInOut'}, 6)};
					if(f2_lifestyle6_img.element){frame_2_in.from(f2_lifestyle6_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 6)};
					if(f2_lifestyle4_img.element){frame_2_in.from(f2_lifestyle4_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 3)};
					if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_lifestyle4_bg_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 3)};
					if(f2_lifestyle3_img.element){frame_2_in.from(f2_lifestyle3_img.element, 0.75, {left: -182, ease: 'Power1.easeInOut'}, 3)};
					if(f2_lifestyle1_img.element){frame_2_in.from(f2_lifestyle1_img.element, 0.75, {left: -144, ease: 'Power1.easeInOut'}, 0)};
					if(f2_lifestyle1_bg_img.element){frame_2_in.from(f2_lifestyle1_bg_img.element, 0.75, {left: -150, ease: 'Power1.easeInOut'}, 0)};
					if(f2_lifestyle2_img.element){frame_2_in.from(f2_lifestyle2_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 0)};
					
				var tl = new TimelineMax()
					.add(frame_1_in)
					.add(frame_1_out)
					.add(frame_2_in)

				var tlDuration = tl.duration();
				tl.duration(R.create("var").set({name:"duration", defaultValue:tlDuration, dataType: "Number", exposed:true}).render().value())
                    
                /* [END_ANIMATE_ELEMENTS] */
            }
        }

        function adHit(e) {
            //console.log("adHit");
            try{
                // prevent event bubbling
                e.stopPropagation();
            } catch(err){}

            e = e || window.event;
			var instance = R.get(e.target);
			Analytics.fire({event: "click", instance: instance,  currentInstance:instance, details:""});
			var index = 0;
			if (instance && instance.data && instance.data.hitIndex) {
				index = instance.data.hitIndex;
			}
			dmo.handleCommand.call(dmo, "click", [index]);
			
        }

        function fallback(){

            R.create("ImageIE7").set({
                src: evergreenImg,
                subdirectory: "",
                directoryType: "evergreen",
                width: Platform.fetch().placementWidth,
                height: Platform.fetch().placementHeight,
                maxWidth: Platform.fetch().placementWidth,
                maxHeight: Platform.fetch().placementHeight,
                borderWidth:1,
                borderStyle:"solid",
                borderColor:"#CCCCCC",
                boxSizing:"border-box",
                position:"absolute",
                zIndex:500,
                display:"block"
            }).complete(function (inst) {
                if (stage) {
                    // hide all elements that get created from here out
                    Settings.overwrite({display: "none"});
                    // hide all existing elements (ImageIE7 is not logged in SelectorEngine)
                    var allElements = R.get("");
                    var i = allElements.length;
                    while (--i > -1) {
                        if (allElements[i] !== stage && allElements[i].element) {
                            allElements[i].display = "none";
                        }
                    }
                    stage.appendChild(inst);
                    stage.display = "block";
                } else {
                    parentDiv.appendChild(inst.element);
                }
                inst.element.onclick = adHit;

                animate = null;

                creativeReady();
            }).render();
        }

        function assignSelector() {
            var defined = require.s.contexts[context].defined;
            var registry = require.s.contexts[context].registry;

            TweenMax = enableModule(defined,registry, "TweenMax");
            if(TweenMax){TweenMax.selector = R.selector}
            TweenLite = enableModule(defined,registry, "TweenLite");
            if (TweenLite){ Settings.overwrite({GSAPSelector: TweenLite.selector});TweenLite.selector = R.selector;}
            TimelineLite = enableModule(defined,registry, "TimelineLite");
            TimelineMax = enableModule(defined,registry, "TimelineMax");
            Hammer = enableModule(defined, registry, "Hammer");

            function enableModule(defined, registry, name){
                if (registry[name] && !defined[name]){
                    registry[name].enable();
                }
                if (defined[name]) {
                    return defined[name];
                }
            }
        }

        function log(msg) {
            if (window && window.console){
                var c = "Creative: ";
                try {
                    if (window.console.debug && typeof msg === "object"){
                        console.debug(msg);
                    } else if (window.console.log){
                        console.log(c + msg);
                    }
                } catch(e){}
            }
        }

        function registerCallback(evt, callback, scope) {
            registeredCallbacks.push({evt:evt, callback:callback, scope:scope});
            return reveal;
        }

        function checkForCallback(evt, params) {
            if (!evt){return;}
            var arr = registeredCallbacks;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].evt === evt) {
                    if (arr[i].callback) {
                        try{
                            arr[i].callback.call(arr[i].scope, params);
                        } catch(e) { log("Callback failed"); }
                    }
                }
            }
        }

        function isArray(val) {
            if (!Array.isArray) {
                Array.isArray = function (vArg) {
                    return Object.prototype.toString.call(vArg) === "[object Array]";
                };
            }
            return Array.isArray(val);
        }

        function environReady(isReady) {
            if (isEnvironReady === false){
                isEnvironReady = isReady;
                if (isReady === true) {
                    logEnvironStatus("parentEnvironment", isEnvironReady);
                }
            }
            return reveal;
        }

        function creativeReady() {
            if (isCreativeReady === false) {
                isCreativeReady = true;
                var xmlPush = require.s.contexts[context].defined['platform/advantage/XMLPush'];
                if (xmlPush) { xmlPush.init(); }
                checkForCallback("creative_ready");
                logEnvironStatus("creative", isCreativeReady);
            }
        }

        function logEnvironStatus(src, val) {
            environStatuses.push({src: src, val: val});
            if (environStatuses.length !== environTotals && !!checkEnvironStatus("parentEnvironment")){
                //Create Timer
                if (!timeoutTimer && startTimer){
                    startTimer();
                }
            }
            if (environStatuses.length === environTotals) {
                showCreative();
            }
        }

        function checkEnvironStatus(src) {
            for (var i=0; i<environStatuses.length; i++){
                if (environStatuses[i].src === src) {
                    return environStatuses[i].val;
                }
            }
            return false;
        }

        function showCreative() {
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }
            checkForCallback("creative_shown");
            if (Analytics){
                Analytics.fire({
                    event: AnalyticsContent.CREATIVE_SHOWN,
                    instance: reveal
                });
            }

            // animate the correct orientation
            if (animate) {
                animate();
            }
        }

        var reveal = {
            init: init,
            registerCallback:registerCallback,
            environmentReady:environReady,
            enviromentReady:environReady
        };
        return reveal;
    }
    creatives.push(Creative);
    return Creative;
}());