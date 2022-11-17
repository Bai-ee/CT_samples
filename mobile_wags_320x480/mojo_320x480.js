(function() {
    "use strict";
    var win = window;
    var creatives = (win._$OGO$_ || (win._$OGO$_ = {})) &&  (win._$OGO$_.Rosetta || (win._$OGO$_.Rosetta = {})) && (win._$OGO$_.Rosetta.creatives || (win._$OGO$_.Rosetta.creatives = []));
    var Rosetta = win._$OGO$_.Rosetta;
    var require =  Rosetta.requirejs || require;

    function Creative(dmo){
        /* [START_CUSTOM_VARIABLES] */
        /* [END_CUSTOM_VARIABLES] */

        var registeredCallbacks = [], environStatuses = [],environTotals = 2, isEnvironReady = false, isCreativeReady = false;
        var R, Platform, Settings, Analytics, AnalyticsContent, TweenMax, TweenLite, TimelineLite, TimelineMax, EventForwarding, Hammer/* [INSERT_PLUGIN_VARS] */;

        var ROSETTA_VERSION = "4.30";
        var context = String(ROSETTA_VERSION + "_"  + dmo.embedId).split("_").join(".");
        var parentDiv, stage, animate, timeoutTimer, startTimer, FOF_PIXEL_DENSITY;
        var evergreenImg = "evergreen.jpg";
        var CENTER_STAGE = false;

        function init(wrapperID) {
            var subdirectory = "47401_LCH_INT";
            var creativeName = "" || subdirectory;
            var companyID = "2623";
            var isSecure = (dmo.externalURL.indexOf("https:") > -1);



            var config = {
                context: context,
                waitSeconds: 5,
                paths: {},
                bundles: {
                    "Rosetta":["core.pack","ad.pack","cnvr.usweb.pack","cnvr.mojo.pack","filters.pack","tweenmax.pack","hammer.pack","ndots.pack","rotatorslide.pack"]
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
                    return compatible;
                }
                return bundles;
            })(config.bundles.Rosetta);


            dmo.atomSuffix = dmo.atomSuffix || "";
            config.paths["Rosetta"] = dmo.externalURL + "/atom/"+ROSETTA_VERSION+"/2.1.0/?scripts=" + "wrapper_start," + config.bundles.Rosetta.join(",") + ",wrapper_end" + dmo.atomSuffix;

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
                        FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"2.1.3", exposed:false}).render().value(),
                        isSecure: R.create("var").set({name:"dtm_secure", dataType:"Boolean", defaultValue:Platform.fetch().isSecure, exposed:false}).render().value(),
                        analytics: (window["mplx"] && window["mplx"].SVEvent),
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
                        timeoutTimer = setTimeout(R.fallback, timeout*1000);
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
                    R.fallback();
                }
            }, function(e){
                log(e);
            });

            return reveal;
        }

        function createElements(){
            animate = animateElements;
            var width = R.create("var").set({name:"width", dataType:"Number", defaultValue:Platform.fetch().placementWidth, exposed:false}).render().value();
            var height = R.create("var").set({name:"height", dataType:"Number", defaultValue:Platform.fetch().placementHeight, exposed:false}).render().value();
            var borderColor = R.create("var").set({name: "border_color", dataType: "String", defaultValue: "#CCCCCC"}).render().value();

            stage = R.create("div").set({id:"stage", width: width, height: height, backgroundColor:"#FFFFFF", className: "stage"});
            parentDiv.appendChild(stage.element);
            Settings.overwrite({stage: stage});
            new EventForwarding().init({stage:stage});
            var borders = {
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:634,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:634, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:634, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:634, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
            R.applyCSSReset(".stage");

			var stageBlock = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: 1000,
					width: 320,
					height: 480,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f1_style_bar_multiply_color", defaultValue:"#FFFFFF", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "stageBlock"
				}
			}).render();

 			var triggerRotatorHit = R.create("div").set({
				css:{
					left: 0,
					top: 345,
					zIndex: 9999,
					width: 320,
					height: 88,
					pointerEvents: "auto",
					cursor: "auto",
					position: "absolute",
					// backgroundColor: "#FFFFFF",
					borderRadius: 0,
					visibility: "hidden",
					// display:"none"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "triggerRotatorHit"
				}
			}).render();

 			var f2_container = R.create("div").set({
				css:{
					left: 0,
					top: 0/*135*/,
					zIndex: 300,
					width: 320,
					height: 970,
					pointerEvents: "auto",
					cursor: "auto",
					position: "absolute",
					borderRadius: 0,
					visibility: "hidden",
					// backgroundColor:"#FF0034.5"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f2_container"
				}
				}).render().on("click", adHit);

			 			var indicator_icon_img = R.create("div").set({
							css:{
								backgroundImage: R.create("var").set({name:"indicator_icon_img", defaultValue:"indicator_icon_img.png", dataType:"String", required:false, exposed:true}).render().value(),
								backgroundSize: "contain",
								backgroundPosition: "center center",
								left: 15,
								top: 433,
								width: 25,
								height: 15,
								zIndex: 578,
								pointerEvents: "none",
								cursor: "auto",
								position: "absolute",
								visibility: "hidden",
								// background:"#FFFFFF"
							},
							rosetta:{
								parentNode:f2_container,
								tint: R.create("var").set({name:"indicator_icon_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
							},
							attr:{
								id: "indicator_icon_img"
							}
						}).render();

						var f1_headline_text_img = R.create("div").set({
							css:{
								backgroundImage: R.create("var").set({name:"f1_headline_text_img", defaultValue:"f1_headline_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
								backgroundSize: "contain",
								backgroundPosition: "center center",
								left: 0,
								top: 348,
								width: 205,
								height: 73,
								zIndex: 309,
								pointerEvents: "none",
								cursor: "auto",
								position: "absolute",
								visibility: "hidden"
							},
							rosetta:{
								parentNode:f2_container,
								tint: R.create("var").set({name:"f1_headline_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
							},
							attr:{
								id: "f1_headline_text_img"
							}
						}).render();

			var f2_style_bar_multiply_color = R.create("div").set({
				css:{
					left: 0,
					top: 409,
					zIndex: 300,
					width: 320,
					height: 24,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f2_style_bar_multiply_color", defaultValue:"#e31837", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden",
					// display:"none"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f2_style_bar_multiply_color"
				}
			}).render();

			f2_style_bar_multiply_color.style.mixBlendMode = 'multiply';

			var f2_style_bar_screen_color = R.create("div").set({
				css:{
					left: 0,
					top: 49,
					zIndex: 296,
					width: 320,
					height: 24,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f2_style_bar_screen_color", defaultValue:"#e31837", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden",
					display:"none"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f2_style_bar_screen_color"
				}
			}).render();

			var f1_style_bar_multiply_color = R.create("div").set({
				css:{
					left: 0,
					top: 346,
					zIndex: 80,
					width: 320,
					height: 24,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f1_style_bar_multiply_color", defaultValue:"#e31837", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f1_style_bar_multiply_color"
				}
			}).render();

			f1_style_bar_multiply_color.style.mixBlendMode = 'multiply';

			var f1_style_bar_screen_color = R.create("div").set({
				css:{
					left: 0,
					top: 369,
					zIndex: 85,
					width: 320,
					height: 587,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"f1_style_bar_screen_color", defaultValue:"#e31837", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage
				},
				attr:{
					id: "f1_style_bar_screen_color"
				}
			}).render();

			var bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: 1,
					width: 320,
					height: 480,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"rgba(255,255,255,0)", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					border: R.create("var").set({name:"bg_border", defaultValue:"0px solid rgba(undefined,0)", dataType:"String", required:false, exposed:true}).render().value(),
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
					zIndex: 624,
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
					zIndex: 621,
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



			var replay_icon_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"replay_icon_img", defaultValue:"replay_icon_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 13,
					top: 12,
					width: 14,
					height: 17,
					zIndex: 9999,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"replay_icon_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "replay_icon_img"
				}
			}).render();

			var logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"logo_img", defaultValue:"logo_img.png", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 509,
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

			var f1_rnd_logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_rnd_logo_img", defaultValue:"f1_rnd_logo_img_b_20180406_D.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 236,
					top: 353,
					width: 66,
					height: 69,
					zIndex: 381,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f1_rnd_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_rnd_logo_img"
				}
			}).render();

			var f2_headline1_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_headline1_text_img", defaultValue:"f2_headline1_text_img_b_20180406.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 13,
					top: 5,
					width: 268,
					height: 46,
					zIndex: 302,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f2_headline1_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_headline1_text_img"
				}
			}).render();

			var f2_headline2_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_headline2_text_img", defaultValue:"f2_headline2_text_img_b_20180406.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 92,
					top: 310,
					width: 230,
					height: 100,
					zIndex: 303,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f2_headline2_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_headline2_text_img"
				}
			}).render();

			var f3_headline_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f3_headline_text_img", defaultValue:"f3_headline_text_img_b_20180406.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 23,
					top: 10,
					width: 190,
					height: 87,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f3_headline_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f3_headline_text_img"
				}
			}).render();

			var f4_rnd_logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_rnd_logo_img", defaultValue:"f4_rnd_logo_img_b_20180406.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 92,
					top: 41,
					width: 136,
					height: 140,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f4_rnd_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_rnd_logo_img"
				}
			}).render();

			var f4_text_cont = R.create("div").set({
				css:{
					// backgroundImage: R.create("var").set({name:"f4_headline1_text_img", defaultValue:"f4_headline2_text_img_B.png", dataType:"String", required:false, exposed:true}).render().value(),
					// backgroundColor:"#FFFFFF.5",
					left: 182,
					top: 204,
					width: 105,
					height: 45,
					zIndex: 99999,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
					overflow:"hidden",
					// display:"none"
				},
				rosetta:{
					parentNode:stage,
				},
				attr:{
					id: "f4_text_cont"
				}
			}).render();


	//EVERY    COUNTS
			var f4_headline1_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_headline1_text_img", defaultValue:"f4_headline2_text_img_B.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 27,
					top: 203,
					width: 291,
					height: 88,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",

				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f4_headline1_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_headline1_text_img"
				}
			}).render();

//NOSE
			var f4_headline2_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_headline2_text_img", defaultValue:"f4_nose_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 3,
					top: 3,
					width: 100,
					height: 38,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f4_text_cont,
					tint: R.create("var").set({name:"f4_headline2_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_headline2_text_img"
				}
			}).render();

//ONE
			var f4_headline3_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_headline2_text_img", defaultValue:"f4_headline3_text_img_b.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 179,
					top: 207,
					width: 100,
					height: 38,
					zIndex: 300,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
					// display:"none"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f4_headline2_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_headline3_text_img"
				}
			}).render();

			var f4_subhead_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_subhead_text_img", defaultValue:"f4_subhead_text_imgb_20180406.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 39,
					top: 291,
					width: 250,
					height: 50,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f4_subhead_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_subhead_text_img"
				}
			}).render();

			var f4_cta_text_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f4_cta_text_img", defaultValue:"f4_cta_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: -273,
					top: 176,
					width: 486,
					height: 185,
					zIndex: 350,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f4_cta_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f4_cta_text_img"
				}
			}).render();

			var f1_flag_logo_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_flag_logo_img", defaultValue:"f1_flag_logo_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 32,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f1_flag_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_flag_logo_img"
				}
			}).render();

			var f1_lifestyle_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle_img", defaultValue:"f1_lifestyle_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 369,
					zIndex: 9,
					pointerEvents: "none",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"f1_lifestyle_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle_img"
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
					zIndex: 4,
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
					// R.create("var").set({name:"cat_img1", defaultValue:"http://usweb.dotomi.com/images/2623/47401_LCH_INT/shared/300x250_Frame_2@2x-80.jpg", dataType:"String", required:true, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img2", defaultValue:"http://usweb.dotomi.com/images/2623/47401_LCH_INT/shared/320x480_Frame_2@2x-80_2.jpg", dataType:"String", required:false, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img3", defaultValue:"http://usweb.dotomi.com/images/2623/47401_LCH_INT/shared/320x480_Frame_3@2x-80_2.jpg", dataType:"String", required:false, exposed:true}).render().value(),
					R.create("var").set({name:"cat_img4", defaultValue:"http://usweb.dotomi.com/images/2623/47401_LCH_INT/shared/320x480_Frame_4@2x-80_2.jpg", dataType:"String", required:false, exposed:true}).render().value()
				];
			var catImgsArr = [];
			var nDotsContainer = R.create("div").set({
				attr:{
					id: "nDotsContainer"
				},
				css:{
					name: "nDotsContainer",
					zIndex: 350,
					left: 11,
					top: 845,
					width: 5.70369537648548,
					height: 32.7036953764837,
					pointerEvents: "none",
					visibility: "hidden"
				},
				rosetta:{
					parentNode: f2_container
				}
			}).render();

			var rotatorSlideContainer = R.create("div").set({
				attr:{
					id: "rotatorSlideContainer"
				},
				css:{
					name: "rotatorSlideContainer",
					zIndex: 68,
					left: 0,
					top: 480,
					width: 320,
					height: 480,
					pointerEvents: "none",
					visibility: "hidden",
					backgroundColor: "#e31837",
				},
				rosetta:{
					parentNode: f2_container
				}
			}).render();


			/* [NDOTS_ACTIVE_STATES] */
			var nDotActive = R.create("div").set({
				css: {
					backgroundColor: R.create("var").set({name:"ndot_on_color", defaultValue:"rgba(255,255,255,1)", dataType:"Color", required:false, exposed:true}).render().value(),
					boxShadow: R.create("var").set({name:"ndot_on_shadow_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					border: R.create("var").set({name:"ndot_on_border", defaultValue:"0px solid rgba(255,255,255,1)", dataType:"String", required:false, exposed:true}).render().value(),
					borderRadius: 2.85184768824274,
					width: 5.70369537648548,
					height: 5.70369537648548,
					visibility: "hidden"
				},
				rosetta: {
					id: "nDotActive",
					parentNode: nDotsContainer
				}
			}).render();

			var nDotInactive = R.create("div").set({
				css: {
					backgroundColor: R.create("var").set({name:"ndot_off_color", defaultValue:"rgba(255,255,255,0.5)", dataType:"Color", required:false, exposed:true}).render().value(),
					boxShadow: R.create("var").set({name:"ndot_off_shadow_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					border: R.create("var").set({name:"ndot_off_border", defaultValue:"0px solid rgba(255,255,255,0.5)", dataType:"String", required:false, exposed:true}).render().value(),
					borderRadius: 2.85184768824274,
					width: 5.70369537648548,
					height: 5.70369537648548,
					visibility: "hidden"
				},
				rosetta: {
					id: "nDotInactive",
					parentNode: nDotsContainer
				}
			}).render();

			for (var i = 0; i < catImgVarsArr.length; i++) {
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
						position: "absolute",
						visibility: "hidden",
						cursor: "pointer",
						pointerEvents: "auto"
					},
					rosetta: {
						parentNode: rotatorSlideContainer,
						data: {
							hitIndex: i + 1
						}
					}
			}).render();

				catImgsArr.push(catImg);
			};

			var nDots;
			var rotatorSlide;

			function startRotator() {
				rotatorSlide = R.create("rotatorslide").set({
					id: "rotatorSlide",
					container: rotatorSlideContainer,
					direction: "vertical",
					width: 320,
					height: 480,
					zIndex: 68,
					spacing: 0,
					autoPlay: false,
					clickIndexOffset: 0,
					elements: catImgsArr,
					endOnFirst: false,
					numLoops: 1,
					onDuration: 2,
					startIndex: 0,
					transitionDuration: 0.5,
					ease: "Power1.easeOut"
				}).render().on("change_end", function(e){
					animation(e);
				});

				nDots = R.create("ndots").set({
					id: "nDots",
					container: nDotsContainer,
					activeElement: nDotActive,
					inactiveElement: nDotInactive,
					spacing: 3.29630462351452,
					direction: "vertical",
					alignment: "center",
					maxElements: rotatorSlide.numElements
				}).render().on("change_end", function(e){

				// animation(e);

				});

				nDots.controlledBy = [rotatorSlide];
				rotatorSlide.controlledBy = [nDots];
			};

			/* [BATCH_LOADING] */
			var requiredArr = [logo_img];
			var nDotsArr = [nDotActive, nDotInactive];
			var allElementsArr = [f4_text_cont,f4_headline3_text_img,triggerRotatorHit,f2_container, stageBlock,fg_img, style_img, indicator_icon_img, replay_icon_img, f1_rnd_logo_img, f1_headline_text_img, f2_headline1_text_img, f2_headline2_text_img, f3_headline_text_img, f4_rnd_logo_img, f4_headline1_text_img, f4_headline2_text_img, f4_subhead_text_img, f4_cta_text_img, f1_flag_logo_img, f1_lifestyle_img, bg_img, f2_style_bar_multiply_color, f2_style_bar_screen_color, f1_style_bar_multiply_color, f1_style_bar_screen_color, bg_color, nDotsContainer, rotatorSlideContainer];

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
						hideFailed(R.filter.removeParallel(catImgsArr,R.filter.parallel(catImgsArr)));
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

			var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
			hit_area.on("click", adHit);

			//ADDING CTT JUNK VARS
            /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
            hit_area.on("click", adHit); */

            /* [END_CREATE_ELEMENTS] */
            //creativeReady()
            var tl2;

			function animation(e){

				//ANIMATE ACCORDING TO WHAT INDEX THE ROTATOR IS ON
				var index = e.toIndex;

                switch (index) {
                    case 0:
                        f4_headline3_text_img.style.display = "none";
                        f4_headline2_text_img.style.display = "none";

                        TweenMax.set(f4_headline2_text_img.element,{y:0, autoAlpha:1});
                        TweenMax.set(f4_headline3_text_img.element,{y:-25, autoAlpha:0});

                        TweenMax.set([f4_rnd_logo_img.element,f4_headline1_text_img.element,f4_subhead_text_img.element, f4_cta_text_img.element],{autoAlpha:0});
                        TweenMax.set(f3_headline_text_img.element,{autoAlpha:0, x:-40});
                        TweenMax.set(f4_headline1_text_img.element,{autoAlpha:0});

                        TweenMax.to(f2_headline1_text_img.element,.4,{x:0, autoAlpha:1, ease:"power4.easeInOut"});
                        TweenMax.to(f2_headline2_text_img.element,.4,{x:0, autoAlpha:1, ease:"power4.easeInOut"});
                        TweenMax.to(replay_icon_img.element,.4,{autoAlpha:0});
                        TweenMax.to([f4_rnd_logo_img.element, f4_headline1_text_img.element, f4_headline2_text_img.element, f4_subhead_text_img.element, f4_cta_text_img.element],.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[0].element,.4,{autoAlpha:1});
                        TweenMax.to(catImgsArr[1].element,.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[2].element,.4,{autoAlpha:0});

                        break;
                    case 1:
                        f4_headline3_text_img.style.display = "none";
                        f4_headline2_text_img.style.display = "none";

                        TweenMax.set(f4_headline2_text_img.element,{y:0, autoAlpha:1});
                        TweenMax.set(f4_headline3_text_img.element,{y:-25, autoAlpha:0});

                        TweenMax.set([f4_rnd_logo_img.element,f4_headline1_text_img.element,f4_subhead_text_img.element, f4_cta_text_img.element],{autoAlpha:0});
                        TweenMax.set(f2_headline2_text_img.element,{autoAlpha:0, x:40});
                        TweenMax.set(f2_headline1_text_img.element,{autoAlpha:0, x:-40});
                        TweenMax.set(f4_headline1_text_img.element,{autoAlpha:0});

                        TweenMax.to([f4_rnd_logo_img.element, f4_headline1_text_img.element, f4_headline2_text_img.element, f4_subhead_text_img.element, f4_cta_text_img.element],.4,{autoAlpha:0});
                        TweenMax.to(f3_headline_text_img.element,.4,{x:0, autoAlpha:1, ease:"power4.easeInOut"});
                        TweenMax.to(replay_icon_img.element,.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[0].element,.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[1].element,.4,{autoAlpha:1});
                        TweenMax.to(catImgsArr[2].element,.4,{autoAlpha:0});

                        break;
                    case 2:
                        var tl2;
                        f4_headline3_text_img.style.display = "block";
                        f4_headline2_text_img.style.display = "block";

                        TweenMax.set(f4_headline3_text_img.element,{y:-25, autoAlpha:0});
                        TweenMax.set(f4_headline2_text_img.element,{y:0});

                        TweenMax.to([f4_headline1_text_img.element,f4_subhead_text_img.element, f4_cta_text_img.element],.4,{autoAlpha:1});
                        TweenMax.to(replay_icon_img.element,.4,{autoAlpha:1});
                        TweenMax.to(f3_headline_text_img.element,.25,{autoAlpha:0, x:-40});
                        TweenMax.to(f2_headline1_text_img.element,.25,{autoAlpha:0, x:-40});
                        TweenMax.to(f2_headline2_text_img.element,.25,{autoAlpha:0, x:40});
                        TweenMax.to(catImgsArr[0].element,.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[1].element,.4,{autoAlpha:0});
                        TweenMax.to(catImgsArr[2].element,.4,{autoAlpha:1});

                        //Animate Nose > One
                        tl2 = new TimelineMax()
                        tl2.fromTo(f4_rnd_logo_img.element,.4,{autoAlpha:0, scale:.5},{scale:1, autoAlpha:1});
                        tl2.to(f4_headline2_text_img.element,.4,{autoAlpha:1},0);
                        tl2.to(f4_headline1_text_img.element,.4,{autoAlpha:1},0);
                        tl2.to(f4_headline2_text_img.element,.4,{y:30, delay:1, autoAlpha:0});
                        tl2.to(f4_headline3_text_img.element,.4,{y:0, autoAlpha:1},"-=.3");
                        break;
                }
			};

            // All Animation goes here
            function animateElements() {

            	//SET ELEMENT PROPERTIES ON START
            	TweenMax.set(f4_headline3_text_img.element,{y:-25});
            	TweenMax.set([catImgsArr[0].element,catImgsArr[1].element,catImgsArr[2].element],{autoAlpha:0});
            	TweenMax.set(f2_headline1_text_img.element,{autoAlpha:0, x:-40});
            	TweenMax.set(f2_headline2_text_img.element,{autoAlpha:0, x:40});
				TweenMax.set(f3_headline_text_img.element,{autoAlpha:0, x:-40});
				TweenMax.set([f4_rnd_logo_img.element, f4_headline1_text_img.element, f4_headline2_text_img.element,f4_headline3_text_img.element, f4_subhead_text_img.element, f4_cta_text_img.element],{autoAlpha:0});
				TweenMax.set(replay_icon_img.element,{autoAlpha:0});
				TweenMax.set(f4_headline1_text_img.element,{autoAlpha:0});
				TweenMax.set(f1_lifestyle_img.element,{scale:1.05,autoAlpha:0});
				TweenMax.set(f2_style_bar_multiply_color.element,{y:22});
                ////////////////////////////////////////////////////

				//OPENING ANIMATION
                var open = new TimelineMax()
                	open.set(stageBlock.element, {display:"block", autoAlpha:1});
            		open.to(stageBlock.element, .25,{autoAlpha:0});
            		open.to(f1_flag_logo_img.element, .25,{autoAlpha:1});
            		open.to(f1_lifestyle_img.element, 1,{scale:1,autoAlpha:1},"-=.4");
            		open.from([f1_style_bar_multiply_color.element,f1_headline_text_img.element, indicator_icon_img.element],.75,{y:250, ease:"power4.easeInOut", onComplete:bounceFirst},"-=1");
				////////////////////////////////////////////////////

                //SET UP BOUNCE
        		var tlBounce;
				function bounceFirst(){
					// myInterval = setInterval(bounceRefresh,2500);
					TweenMax.set(indicator_icon_img.element,{autoAlpha:1});
					var duration = 1;
					tlBounce = new TimelineMax({repeat:4})
					tlBounce.to([f1_style_bar_screen_color.element, f1_style_bar_multiply_color.element, f2_container.element], duration / 4, {y:-20, ease:"Power4.easeOut", delay:1.1});
					tlBounce.to([f1_style_bar_screen_color.element, f1_style_bar_multiply_color.element, f2_container.element], duration / 2, {y:0, ease:"Bounce.easeOut", delay:duration / 4});
					// tlBounce.set(f1_style_bar_screen_color.element,{y:0, delay:2.5});
				};
				////////////////////////////////////////////////////

            	//MOUSE EVENTS/////////////////////////////////////////////
	           	triggerRotatorHit.on("click", transitionToRotator);
            	replay_icon_img.on("click", resetF1);

                var myIntervalAutoScroll;
				
				//TRANSITION TO ROTATOR
            	function transitionToRotator(){

					rotatorSlide.showIndex(0)
                    clearInterval(myIntervalAutoScroll);   
					rotatorSlide.startAutoPlay()

            		tlBounce.kill()
					TweenMax.to([f1_style_bar_screen_color.element, f1_style_bar_multiply_color.element, f2_container.element], .5, {y:0, ease:"Bounce.easeOut"});
					triggerRotatorHit.style.display = "none";
                	TweenMax.to([f1_style_bar_screen_color.element, f1_style_bar_multiply_color.element, f2_container.element,f2_container.element],.4,{top:-480, ease:"power4.easeInOut"})
					TweenMax.set([indicator_icon_img.element,f1_headline_text_img.element],{x:0, autoAlpha:0});
					TweenMax.to(f2_style_bar_multiply_color.element,.4,{y:0, delay:.4});
					f2_container.style.pointerEvents = "none";
					TweenMax.to(catImgsArr[0].element,.4,{autoAlpha:1});
					TweenMax.to(f2_headline1_text_img.element,.4,{x:0, autoAlpha:1, ease:"power4.easeInOut", delay:.3});
					TweenMax.to(f2_headline2_text_img.element,.4,{x:0, autoAlpha:1, ease:"power4.easeInOut", delay:.3});
					TweenMax.to(f1_lifestyle_img.element, 1,{scale:1.1, delay:.4});
            	}

                //AUTO TRANSITION TO ROTATOR
				myIntervalAutoScroll = setInterval(autoPlay,6000);

				// setTimeout(function( ) { rotatorSlide.startAutoPlay(); }, 6000);

                function autoPlay(){
				    // clearInterval(myIntervalAutoScroll);  	
					// rotatorSlide.startAutoPlay();
					transitionToRotator();
                }

                //RESET ANIMATION TO F1
				function resetF1(){

                    myIntervalAutoScroll = setInterval(autoPlay,6000);

					f4_headline3_text_img.style.display = "none";
					TweenMax.set(f1_headline_text_img.element,{autoAlpha:1});
	        		triggerRotatorHit.style.display = "block";
					TweenMax.to(f1_lifestyle_img.element, 1,{scale:1});
					TweenMax.to(f2_style_bar_multiply_color.element,.2,{y:23});
			        TweenMax.set(indicator_icon_img.element,{autoAlpha:0});
					TweenMax.to(f2_container.element,.74,{top:0, ease:"power4.easeInOut"})
					TweenMax.to(f1_style_bar_screen_color.element,.74,{top:368, ease:"power4.easeInOut"});
					TweenMax.to(f1_style_bar_multiply_color.element,.74,{top:346, ease:"power4.easeInOut",onComplete:bounceFirst});
					TweenMax.set([f4_headline3_text_img.element, f4_rnd_logo_img.element, f4_headline1_text_img.element, f4_headline2_text_img.element, f4_subhead_text_img.element, f4_cta_text_img.element,f4_headline2_text_img.element,f4_headline1_text_img.element,replay_icon_img.element],{autoAlpha:0});
					f2_container.style.pointerEvents = "auto";
				////////////////////////////////////////////////////
        		};

        		//HAMMER SET UP///////////////////////////////////////////////////////////////
				var myElement = triggerRotatorHit.element;//select element to apply hammer
				var mc = new Hammer(myElement);//call new hammer on element
				mc.on("pan", handleDrag);//set hammer event listener hammer on element
	   			mc.add( new Hammer.Pan({ threshold: 0 }) );
				var lastPosY = 0;//establish initial position
				var isDragging = false;//establish if dragging or not

	            function handleDrag(ev) {

                var elem = ev.target;//reference your element
                var top = elem.style.top//establish elements left propery
                var posY = ev.deltaY + lastPosY;//set new position of draggable element

                if ( ! isDragging) {
                    isDragging = true;
                    lastPosY = elem.offsetTop;
	                // console.log("draggin")
	                transitionToRotator();
                }
                if (ev.isFinal) {
	                // console.log("end draggin")
                    isDragging = false;
                }
            }
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
			var index = 0;
			Analytics.fire({event: "click", instance: instance,  currentInstance:instance, details:""});
				if (instance && instance.data && instance.data.hitIndex) {
					index = instance.data.hitIndex;
				}
			var clickOut = R.create("var").set({name:"mplx_clickOut", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value();
			window.open(clickOut);

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