(function() {
    /* [INSERT_BUILD_STAMP] */
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

        var ROSETTA_VERSION = "4.60";
        var context = String(ROSETTA_VERSION + "_"  + dmo.embedId).split("_").join(".");
        var parentDiv, stage, animate, timeoutTimer, startTimer, FOF_PIXEL_DENSITY;
        var evergreenImg = "evergreen.jpg";
        var CENTER_STAGE = true;

        function init(wrapperID) {
            // var subdirectory = "66057_M_INT_VisistOmaha";
            var subdirectory = "69749_M_INT_VisistOmaha";

            var creativeName = "" || subdirectory;
            var companyID = "80258";
            var isSecure = (dmo.externalURL.indexOf("https:") > -1);



            var config = {
                context: context,
                waitSeconds: 5,
                paths: {},
                bundles: {
                    "Rosetta":["core.pack","ad.pack","cnvr.usweb.pack","cnvr.bolt.pack","filters.pack","tweenmax.pack","hammer.pack","ndots.pack","rotatorslide.pack"]
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
            config.paths["Rosetta"] = dmo.externalURL + "/atom/"+ROSETTA_VERSION+"/3.1.1/?scripts=" + "wrapper_start," + config.bundles.Rosetta.join(",") + ",wrapper_end" + dmo.atomSuffix;

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
                        FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"4.1.0", exposed:false}).render().value(),
                        isSecure: R.create("var").set({name:"dtm_secure", dataType:"Boolean", defaultValue:Platform.fetch().isSecure, exposed:false}).render().value(),
                        analytics: (window["gs"] && window["gs"].Stats),
                        analyticsScope: null
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
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:396,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:396, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:396, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:396, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
            R.applyCSSReset(".stage");


	         /* [START_CUSTOM_VARIABLES] */

			var stageBlock = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: borders.l.zIndex-1,
					width: width,
					height: height,
					visibility: "hidden",
					backgroundColor:"#FFFFFF"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "stageBlock"
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
					borderRadius: R.create("var").set({name:"bg_border_radius", defaultValue:0, dataType:"Number", required:false, exposed:true}).render().value(),
					border: R.create("var").set({name:"bg_border", defaultValue:"0px solid #ffffff", dataType:"String", required:false, exposed:true}).render().value(),
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
					backgroundImage: R.create("var").set({name:"fg_img", defaultValue:"fg_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 386,
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
					backgroundImage: R.create("var").set({name:"style_img", defaultValue:"style_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 383,
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

			var headline_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"headline_img", defaultValue:"headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 324,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "headline_img"
				}
			}).render();


			var icon1_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon1_img", defaultValue:"icon1_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 29,
					top: 149,
					width: 102,
					height: 49,
					zIndex: 209,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon1_img"
				}
			}).render();

			var clickTracker = window.conversant.mobile.clickTag;
	        var landingPage = "https://www.visitomaha.com/?utm_source=Conversant&utm_medium=Mobile_Immersion&utm_campaign=2020_Digital&utm_content=Logo" /*+ Math.floor(Math.random() * 100000000000)*/;
	        var redirectUrl = (clickTracker) ? clickTracker + encodeURIComponent(landingPage) : landingPage;


			var logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"logo_img", defaultValue:"logo_img.png", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 105,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta: {
				parentNode: stage,
				data: {
				url: redirectUrl
				}
				}
				}).render().on("click", adHit);

			var icon1_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon1_text_img", defaultValue:"icon1_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 28,
					top: 210,
					width: 102,
					height: 9,
					zIndex: 198,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon1_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon1_text_img"
				}
			}).render();

			var icon2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon2_img", defaultValue:"icon2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 191,
					top: 130,
					width: 102,
					height: 68,
					zIndex: 182,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon2_img"
				}
			}).render();

			var icon2_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon2_text_img", defaultValue:"icon2_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 190,
					top: 210,
					width: 102,
					height: 9,
					zIndex: 166,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon2_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon2_text_img"
				}
			}).render();

			var icon3_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon3_img", defaultValue:"icon3_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 28,
					top: 359,
					width: 102,
					height: 51,
					zIndex: 155,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon3_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon3_img"
				}
			}).render();

			var icon3_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon3_text_img", defaultValue:"icon3_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 28,
					top: 422,
					width: 102,
					height: 9,
					zIndex: 144,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon3_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon3_text_img"
				}
			}).render();

			var icon4_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon4_img", defaultValue:"icon4_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 191,
					top: 358,
					width: 102,
					height: 51,
					zIndex: 127,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon4_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon4_img"
				}
			}).render();

			var icon4_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"icon4_text_img", defaultValue:"icon4_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 190,
					top: 422,
					width: 102,
					height: 9,
					zIndex: 110,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"icon4_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "icon4_text_img"
				}
			}).render();

///////////////////

			var indicator_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"indicator_img", defaultValue:"indicator_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 14,
					top: 106,
					width: 130,
					height: 169,
					zIndex: 106,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"indicator_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "indicator_img"
				}
			}).render();

			var indicator_img2 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"indicator_img", defaultValue:"indicator_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 14,
					top: 106,
					width: 130,
					height: 169,
					zIndex: 106,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"indicator_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "indicator_img2"
				}
			}).render();

			var indicator_img3 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"indicator_img", defaultValue:"indicator_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 14,
					top: 106,
					width: 130,
					height: 169,
					zIndex: 106,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"indicator_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "indicator_img3"
				}
			}).render();

			var indicator_img4 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"indicator_img", defaultValue:"indicator_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 14,
					top: 106,
					width: 130,
					height: 169,
					zIndex: 106,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"indicator_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "indicator_img4"
				}
			}).render();

/////////////////////////////	

			var lifestyle_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"lifestyle_img", defaultValue:"lifestyle_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 99,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"lifestyle_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "lifestyle_img"
				}
			}).render();

			var back_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"back_img", defaultValue:"back_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 8,
					top: 9,
					width: 30,
					height: 11,
					zIndex: 1000,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"back_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "back_img"
				}
			}).render();

			var bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"bg_img", defaultValue:"bg_img.png", dataType:"String", required:false, exposed:true}).render().value(),
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

			/* [CREATING_COMPONENTS] */
			var catImgVarsArr = [
					R.create("var").set({name:"cat_img1", defaultValue:"frame_1_20200226.jpg", dataType:"String", required:true, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img2", defaultValue:"frame_2_20200226.jpg", dataType:"String", required:false, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img3", defaultValue:"frame_3_20200226.jpg", dataType:"String", required:false, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img4", defaultValue:"frame_4_20200226.jpg", dataType:"String", required:false, exposed:true}).render().value()
				];
			var catImgsArr = [];
			var catImgUrlArr = [];
			var nDotsContainer = R.create("div").set({
				attr:{
					id: "nDotsContainer"
				},
				css:{
					name: "nDotsContainer",
					zIndex: logo_img.zIndex+1,
					left: 135,
					top: 458,
					width: 46,
					height: 7,
					pointerEvents: "none",
					visibility: "hidden"
				},
				rosetta:{
					parentNode: stage
				}
			}).render();

			var rotatorSlideContainer = R.create("div").set({
				attr:{
					id: "rotatorSlideContainer"
				},
				css:{
					name: "rotatorSlideContainer",
					zIndex: 61,
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					pointerEvents: "none",
					visibility: "hidden",
					backgroundColor: R.create("var").set({name:"rotator_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				rosetta:{
					parentNode: stage
				}
			}).render();

			
			/* [NDOTS_ACTIVE_STATES] */
			var nDotActive = R.create("div").set({
				css: {
					backgroundColor: R.create("var").set({name:"ndot_on_color", defaultValue:"rgba(255,255,255,1)", dataType:"Color", required:false, exposed:true}).render().value(),
					boxShadow: R.create("var").set({name:"ndot_on_shadow_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					border: R.create("var").set({name:"ndot_on_border", defaultValue:"1px solid rgba(255,255,255,1)", dataType:"String", required:false, exposed:true}).render().value(),
					borderRadius: 3.5,
					width: 7,
					height: 7,
					visibility: "hidden"
				},
				rosetta: {
					id: "nDotActive",
					parentNode: nDotsContainer
				}
			}).render();

			var nDotInactive = R.create("div").set({
				css: {
					backgroundColor: R.create("var").set({name:"ndot_off_color", defaultValue:"rgba(undefined)", dataType:"Color", required:false, exposed:true}).render().value(),
					boxShadow: R.create("var").set({name:"ndot_off_shadow_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					border: R.create("var").set({name:"ndot_off_border", defaultValue:"1px solid rgba(255,255,255,1)", dataType:"String", required:false, exposed:true}).render().value(),
					borderRadius: 3.5,
					width: 7,
					height: 7,
					visibility: "hidden"
				},
				rosetta: {
					id: "nDotInactive",
					parentNode: nDotsContainer
				}
			}).render();

			for (var i = 0; i < catImgVarsArr.length; i++) {

				var clickTracker = window.conversant.mobile.clickTag;
				var clickArray = [
				"https://www.visitomaha.com/52weekends/families/?utm_source=Conversant&utm_medium=Mobile_Immersion&utm_campaign=2020_Digital&utm_content=Family_Fun", 
				"https://www.visitomaha.com/music-nightlife?utm_source=Conversant&utm_medium=Mobile_Immersion&utm_campaign=2020_Digital&utm_content=Music_Nightlife", 
				"https://www.visitomaha.com/food?utm_source=Conversant&utm_medium=Mobile_Immersion&utm_campaign=2020_Digital&utm_content=Food", 
				"https://www.visitomaha.com/things-to-do/arts-culture/?utm_source=Conversant&utm_medium=Mobile_Immersion&utm_campaign=2020_Digital&utm_content=Arts_Culture"
				]
				var redirectUrlRotator = (clickTracker) ? clickTracker + encodeURIComponent(clickArray[i]) : clickArray[i];

				var catImg = R.create("div").set({
					attr: {
						id: "cat_img" + (i + 1)
					},
					css: {
						name: "cat_img" + (i + 1),
						width: 320,
						height: 480,
						backgroundImage: catImgVarsArr[i],
						backgroundSize: "contain",
						backgroundPosition: "center center",
						backgroundColor: R.create("var").set({name:"cat_img_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
						border: R.create("var").set({name:"cat_img_border", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
						borderRadius: R.create("var").set({name:"cat_img_radius", defaultValue:0, dataType:"String", required:false, exposed:true}).render().value(),
						position: "absolute",
						visibility: "hidden",
						cursor: "pointer",
						pointerEvents: "auto"
					},
					rosetta: {
						parentNode: rotatorSlideContainer,
						data: {
							url: redirectUrlRotator
						}
					}
				}).render().on("click", adHit);

				catImgsArr.push(catImg);
			};

			var nDots;
			var rotatorSlide;
			
			function startRotator() {
				rotatorSlide = R.create("rotatorslide").set({
					id: "rotatorSlide",
					container: rotatorSlideContainer,
					direction: "horizontal",
					width: 320,
					height: 480,
					zIndex: 61,
					spacing: 0,
					autoPlay: true,
					clickIndexOffset: 0,
					elements: catImgsArr,
					endOnFirst: true,
					numLoops: 1,
					onDuration: 1,
					startIndex: 0,
					transitionDuration: 0,
					ease: "Power0.easeNone"
				}).render();

				nDots = R.create("ndots").set({
					id: "nDots",
					container: nDotsContainer,
					activeElement: nDotActive,
					inactiveElement: nDotInactive,
					spacing: 6,
					direction: "horizontal",
					alignment: "center",
					maxElements: rotatorSlide.numElements
				}).render();

				nDots.controlledBy = [rotatorSlide];
				rotatorSlide.controlledBy = [nDots];
			};

			/* [BATCH_LOADING] */
			var requiredArr = [logo_img];
			var nDotsArr = [nDotActive, nDotInactive];
			var allElementsArr = [stageBlock, fg_img, style_img, headline_img, icon1_img, icon1_text_img, icon2_img, icon2_text_img, icon3_img, icon3_text_img, icon4_img, icon4_text_img, indicator_img,indicator_img2, indicator_img3, indicator_img4, lifestyle_img, back_img, bg_img, bg_color, nDotsContainer, rotatorSlideContainer];
			
			function additionalSettings() {
				nDotsContainer.element.style.overflow = "";
				for (var i = 0; i < nDotsContainer.element.getElementsByTagName("*").length; i++) {
					nDotsContainer.element.getElementsByTagName("*")[i].style.overflow = "";
				}
			};
			
			var megaBatch = R.create("batch")
				.require(requiredArr)
				.add(nDotsArr)
				.require(catImgsArr, 1)
				.add(allElementsArr)
				.render({
					success: function(){
						hideFailed(R.filter.removeParallel(catImgsArr,catImgUrlArr,R.filter.parallel(catImgsArr)));
						displayLoaded([
							R.filter.success(requiredArr),
							R.filter.success(nDotsArr),
							R.filter.success(catImgsArr),
							R.filter.success(allElementsArr)
							]);
						startRotator();
						additionalSettings();
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
			
			function hideFailed(removed){
				for(var i = 0; i < removed.length; i++){
					if(removed[i] && removed[i].element){
						removed[i].display = "none";
						removed[i].parentNode = "";
					}
				}
			};
			
			// var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
			// hit_area.on("click", redirectUrl);
				
			//ADDING CTT JUNK VARS
            /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
            hit_area.on("click", adHit); */

            /* [END_CREATE_ELEMENTS] */
            //creativeReady()

            // All Animation goes here
            function animateElements() {

                 TweenMax.set(back_img.element, {autoAlpha:0});

                 // TweenMax.set(rotatorSlideContainer.element, {autoAlpha:0})

            	 const arrayOfSelectionImages = [ indicator_img, indicator_img2,indicator_img3,indicator_img4 ]
            	 const arrayOfFirstFrameElements = [ fg_img, style_img, headline_img, icon1_img, icon1_text_img, icon2_img, icon2_text_img, icon3_img, icon3_text_img, icon4_img, icon4_text_img, indicator_img,indicator_img2, indicator_img3, indicator_img4, lifestyle_img, back_img, bg_img, bg_color ];

            	 TweenMax.set(indicator_img.element, {scale:.5, autoAlpha:0})
            	 TweenMax.set(indicator_img4.element, {scale:.5, autoAlpha:0, top:304, left: 176, rotation:180})
            	 TweenMax.set(indicator_img2.element, {scale:.5, autoAlpha:0, left: 176, rotationY:180})
            	 TweenMax.set(indicator_img3.element, {scale:.5, autoAlpha:0, top:304,  rotationX:180})
            	 TweenMax.set(rotatorSlide.element, {opacity:0})
            	 TweenMax.to(stageBlock.element, .25, {autoAlpha: 0, ease: 'Power1.easeIn'});

            	function openingAnimation(){

            		logo_img.pointerEvents = "auto";

	                var frame_1_in = new TimelineMax()

						if(icon1_img.element){frame_1_in.set(logo_img.element, {autoAlpha: 1}, 0)};
						if(icon1_img.element){frame_1_in.set([rotatorSlideContainer.element, nDotsContainer.element], {autoAlpha: 0}, 0)};
						if(icon1_text_img.element){frame_1_in.from(headline_img.element, .25, {autoAlpha: 0, ease: 'Power1.easeIn'}, .2)};

						if(icon2_text_img.element){frame_1_in.from(icon1_text_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeIn'}, 0.4)};
						if(icon1_img.element){frame_1_in.from(icon1_img.element, .5, {scale:0, autoAlpha: 0, ease: 'Power1.easeIn'}, .4)};

						 if(icon2_img.element){frame_1_in.from(icon2_img.element, .5, {scale:0, autoAlpha: 0, ease: 'Power1.easeIn'}, 0.4)};
						 if(icon2_text_img.element){frame_1_in.from(icon2_text_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeIn'}, 0.6)};

						 if(icon3_img.element){frame_1_in.from(icon3_img.element, .5, {scale:0, autoAlpha: 0, ease: 'Power1.easeIn'}, 0.69)};
						 if(icon3_text_img.element){frame_1_in.from(icon3_text_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeIn'}, 1.1)};

						 if(icon4_img.element){frame_1_in.from(icon4_img.element, .5, {scale:0, autoAlpha: 0, ease: 'Power1.easeIn'}, .99)};
						 if(icon4_text_img.element){frame_1_in.from(icon4_text_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeIn'}, 1.3)};

						 if(indicator_img.element){frame_1_in.to(indicator_img.element, .4, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'}, .7)};
						 if(indicator_img.element){frame_1_in.to(indicator_img.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn'}, .81)};

						 if(indicator_img.element){frame_1_in.to(indicator_img2.element, .4, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'}, .9)};
						 if(indicator_img.element){frame_1_in.to(indicator_img2.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn'}, 1.1)};

						 if(indicator_img.element){frame_1_in.to(indicator_img3.element, .4, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'}, 1.1)};
						 if(indicator_img.element){frame_1_in.to(indicator_img3.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn'}, 1.5)};

						 if(indicator_img.element){frame_1_in.to(indicator_img4.element, .4, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'}, 1.3)};
						 if(indicator_img.element){frame_1_in.to(indicator_img4.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn'}, 1.7)};

						
					var tl = new TimelineMax()
						.add(frame_1_in)

					var tlDuration = tl.duration();
					tl.duration(R.create("var").set({name:"duration", defaultValue:tlDuration, dataType: "Number", exposed:true}).render().value())
				
				}

				openingAnimation();

             	function clickToRotator(num){

             		logo_img.pointerEvents = "none";

             	TweenMax.set([rotatorSlideContainer.element, nDotsContainer.element], {autoAlpha:1})

             	TweenMax.set(back_img.element, {autoAlpha:1});

             	back_img.on("click", reset);

             	rotatorSlide.transitionDuration = 0

				 var frame_1_out = new TimelineMax()
				 	if(headline_img.element){frame_1_out.to(rotatorSlide.element, .5, {autoAlpha: 1}, 0)};
				 	if(headline_img.element){frame_1_out.to(headline_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	// if(logo_img.element){frame_1_out.to(logo_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon1_img.element){frame_1_out.to(icon1_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon1_text_img.element){frame_1_out.to(icon1_text_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon2_img.element){frame_1_out.to(icon2_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon2_text_img.element){frame_1_out.to(icon2_text_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon3_img.element){frame_1_out.to(icon3_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon3_text_img.element){frame_1_out.to(icon3_text_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon4_img.element){frame_1_out.to(icon4_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(icon4_text_img.element){frame_1_out.to(icon4_text_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(indicator_img.element){frame_1_out.to(indicator_img.element, .5, {autoAlpha: 0, ease: 'Power1.easeOut'}, 0)};
				 	if(lifestyle_img.element){frame_1_out.to(lifestyle_img.element, .5, {autoAlpha: 0, ease: 'Power2.easeOut'}, 0)};
            		
				 var tl = new TimelineMax()
				 	// .add(frame_1_in)
				 	.add(frame_1_out)

				 	function reset(){
             			// console.log("success")
             			TweenMax.to(rotatorSlide.element, .5, {opacity:0})
             			frame_1_out.reverse()
				 		openingAnimation();
             			TweenMax.set(back_img.element, {autoAlpha:0});
             		}

             	}

             	function clickToRotator1(){
             		// console.log("hit")
             		 TweenMax.to(indicator_img.element, .2, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'});
					 TweenMax.to(indicator_img.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn', delay:.2, onComplete:clickToRotator});
					 rotatorSlide.showIndex(0);
             		 rotatorSlide.transitionDuration = 1;
             	}

             	function clickToRotator2(){
             		 TweenMax.to(indicator_img2.element, .2, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'});
					 TweenMax.to(indicator_img2.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn', delay:.2, onComplete:clickToRotator});
					 rotatorSlide.showIndex(1);
             		 rotatorSlide.transitionDuration = 1;
             	}

             	function clickToRotator3(){
             		 TweenMax.to(indicator_img3.element, .2, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'});
					 TweenMax.to(indicator_img3.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn', delay:.2, onComplete:clickToRotator});
					 rotatorSlide.showIndex(2);
             		 rotatorSlide.transitionDuration = 1;
             	}

             	function clickToRotator4(){
             		 TweenMax.to(indicator_img4.element, .2, {scale:1, autoAlpha: 1, ease: 'Power4.easeOut'});
					 TweenMax.to(indicator_img4.element, .4, {scale:0, autoAlpha: 0, ease: 'Power4.easeIn', delay:.2, onComplete:clickToRotator});
					 rotatorSlide.showIndex(3);
             		 rotatorSlide.transitionDuration = 1;
             	}

            	 arrayOfSelectionImages.forEach(function(el){

            		 icon1_img.on("click", clickToRotator1);
            		 icon2_img.on("click", clickToRotator2);
            		 icon3_img.on("click", clickToRotator3);
            		 icon4_img.on("click", clickToRotator4);

            		 icon1_text_img.on("click", clickToRotator1);
            		 icon2_text_img.on("click", clickToRotator2);
            		 icon3_text_img.on("click", clickToRotator3);
            		 icon4_text_img.on("click", clickToRotator4);
            	 })

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
			var url
			if (instance && instance.data && instance.data.url) {
				url = instance.data.url;
			}
			if (window["mraid"] && window["mraid"].open) {
				window["mraid"].open(url);
			} else {
				window.open(url, "_blank");
			};
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