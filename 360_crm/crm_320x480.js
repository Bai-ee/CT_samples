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
            var subdirectory = "01141_LCH_LS_360";
            var creativeName = "" || subdirectory;
            var companyID = "2000";
            var isSecure = (dmo.externalURL.indexOf("https:") > -1);



            var config = {
                context: context,
                waitSeconds: 5,
                paths: {},
                bundles: {
                    "Rosetta":["core.pack","ad.pack","cnvr.advantage.pack","cnvr.usweb.pack","filters.pack","xmlpush.pack","tweenmax.pack"]
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
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:500,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:500, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:500, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:500, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
            R.applyCSSReset(".stage");


            var f1_container = R.create("div").set({
                css:{
                    left: 0,
                    top: 0,
                    zIndex: 400,
                    width: width,
                    height: height,
                    position: "absolute",
                    backgroundColor: "rgba(0,0,0,.3)",
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:stage
                },
                attr:{
                    id: "f1_container"
                }
            }).render();

            var f2_container = R.create("div").set({
                css:{
                    left: 0,
                    top: 0,
                    zIndex: 350,
                    width: width,
                    height: height,
                    position: "absolute",
                    //backgroundColor: "rgba(0,0,0,.3)",
                    visibility: "hidden",
					pointerEvents:"none",
					cursor:"auto"
                },
                rosetta:{
                    parentNode:stage
                },
                attr:{
                    id: "f2_container"
                }
            }).render();

            var panellumStage = R.create("div").set({
                css:{
                    left: 0,
                    top: 0,
                    zIndex: 300,
                    width: width,
                    height: height,
                    pointerEvents: "auto",
                    cursor: "auto",
                    position: "absolute",
                    borderRadius: 0,
                    visibility: "hidden",
                },
                rosetta:{
                    parentNode:stage
                },
                attr:{
                    id: "panellumStage"
                }
            }).render();


			var logo_line_color = R.create("div").set({
				css:{
					left: 77,
					top: 57,
					zIndex: 96,
					width: 166,
					height: 1,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"logo_line_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container
				},
				attr:{
					id: "logo_line_color"
				}
			}).render();

            var logo_line_color2 = R.create("div").set({
                css:{
                    left: 77,
                    top: 57,
                    zIndex: 303,
                    width: 166,
                    height: 1,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    backgroundColor: R.create("var").set({name:"logo_line_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
                    borderRadius: 0,
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:f2_container
                },
                attr:{
                    id: "logo_line_color2"
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
					backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					borderRadius: 0,
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container
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
					zIndex: 158,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
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
					zIndex: 156,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
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
					zIndex: 124,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "logo_img"
				}
			}).render();

            var logo_img_2 = R.create("div").set({
                css:{
                    backgroundImage: R.create("var").set({name:"logo_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    left: 0,
                    top: 0,
                    width: 320,
                    height: 480,
                    zIndex: 303,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:f2_container,
                    tint: R.create("var").set({name:"logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
                },
                attr:{
                    id: "logo_img_2"
                }
            }).render();

			var f1_pre_headline_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_pre_headline_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 94,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_pre_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_pre_headline_img"
				}
			}).render();

			var f1_headline_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_headline_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 93,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_headline_img"
				}
			}).render();

            var f1_cta1_container = R.create("div").set({
                css:{
                    left: 15,
                    top: 421.5,
                    width: 141,
                    height: 26,
                    zIndex: 92,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:f1_container
                },
                attr:{
                    id: "f1_cta1_container"
                }
            }).render();

			// var f1_cta1_img = R.create("div").set({
			// 	css:{
			// 		backgroundImage: R.create("var").set({name:"f1_cta1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
			// 		backgroundSize: "contain",
			// 		backgroundPosition: "center center",
			// 		left: 0,
			// 		top: 0,
			// 		width: 320,
			// 		height: 480,
			// 		zIndex: 92,
			// 		pointerEvents: "none",
			// 		cursor: "auto",
			// 		position: "absolute",
			// 		visibility: "hidden"
			// 	},
			// 	rosetta:{
			// 		parentNode:f1_cta1_container,
			// 		tint: R.create("var").set({name:"f1_cta1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
			// 	},
			// 	attr:{
			// 		id: "f1_cta1_img"
			// 	}
			// }).render();

            var f1_cta1_img = R.create("div").set({
                css:{
                    backgroundImage: R.create("var").set({name:"f1_cta1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    left: 0,
                    top: 0,
                    width: 141,
                    height: 26,
                    zIndex: 92,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:f1_cta1_container,
                    tint: R.create("var").set({name:"f1_cta1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
                },
                attr:{
                    id: "f1_cta1_img"
                }
            }).render();

			var f1_cta2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_cta2_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 88,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_cta2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_cta2_img"
				}
			}).render();

			var f1_gradient1_img = R.create("div").set({
				css:{
					// backgroundImage: R.create("var").set({name:"f1_gradient1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					// backgroundSize: "contain",
					// backgroundPosition: "center center",
					backgroundColor: "-moz-linear-gradient(top,  rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0) 99%, rgba(255,255,255,0) 100%)",
                    backgroundColor: "-webkit-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(255,255,255,1) 60%,rgba(255,255,255,0) 99%,rgba(255,255,255,0) 100%)",
                    backgroundColor: "linear-gradient(to bottom,  rgba(255,255,255,1) 0%,rgba(255,255,255,1) 60%,rgba(255,255,255,0) 99%,rgba(255,255,255,0) 100%)",
            		left: 0,
					top: 0,
					width: 320,
					height: 190,
					zIndex: 84,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_gradient1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_gradient1_img"
				}
			}).render();


			var f1_gradient2_img = R.create("div").set({
				css:{
					// backgroundImage: R.create("var").set({name:"f1_gradient2_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					// backgroundSize: "contain",
					// backgroundPosition: "center center",
                    backgroundColor: "moz-linear-gradient(top,  rgba(0,0,0,0) 0%, rgba(0,0,0,0) 1%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)",
                    backgroundColor: "-webkit-linear-gradient(top,  rgba(0,0,0,0) 0%,rgba(0,0,0,0) 1%,rgba(0,0,0,1) 50%,rgba(0,0,0,1) 100%)",
                    backgroundColor: "linear-gradient(to bottom,  rgba(0,0,0,0) 0%,rgba(0,0,0,0) 1%,rgba(0,0,0,1) 50%,rgba(0,0,0,1) 100%)",

                    left: 0,
					bottom: 0,
					width: 320,
					height: 100,
					zIndex: 83,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_gradient2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_gradient2_img"
				}
			}).render();
			var f1_lifestyle_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 81,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_lifestyle_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_lifestyle_img"
				}
			}).render();

            var catImgVarsArr = [
                R.create("var").set({name:"f2_more_info_img_1", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                R.create("var").set({name:"f2_more_info_img_2", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                R.create("var").set({name:"f2_more_info_img_3", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                R.create("var").set({name:"f2_more_info_img_4", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                R.create("var").set({name:"f2_more_info_img_5", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
            ];

            var catImgsArr = [];

            for (var i = 0; i < catImgVarsArr.length; i++) {

                var f2_more_info_img = R.create("div").set({
                    css:{
                        backgroundImage: catImgVarsArr[i],
                        backgroundSize: "contain",
                        backgroundPosition: "center center",
                        left: 0,
                        top: -64,
                        width: 320,
                        height: 480,
                        zIndex: 304,
                        pointerEvents: "none",
                        cursor: "auto",
                        position: "absolute",
                        visibility: "hidden",
                        opacity:0
                    },
                    rosetta:{
                        parentNode:f2_container,
                        directoryType:"shared"
                    },
                    attr:{
                        id: "f2_more_info_img_"+ (i + 1)
                    }
                }).render();

                catImgsArr.push(f2_more_info_img);
            }


			var f2_hotspot_off_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_hotspot_off_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 302,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
					display:"none"
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f2_hotspot_off_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_hotspot_off_img"
				}
			}).render();

			var f2_cta_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_cta_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 303,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f2_cta_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_cta_img"
				}
			}).render();

			var f2_gradient1_img = R.create("div").set({
				css:{
					// backgroundImage: R.create("var").set({name:"f2_gradient1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					// backgroundSize: "contain",
					// backgroundPosition: "center center",
                    backgroundColor: "-moz-linear-gradient(top,  rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0) 99%, rgba(255,255,255,0) 100%)",
                    backgroundColor: "-webkit-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(255,255,255,1) 60%,rgba(255,255,255,0) 99%,rgba(255,255,255,0) 100%)",
                    backgroundColor: "linear-gradient(to bottom,  rgba(255,255,255,1) 0%,rgba(255,255,255,1) 60%,rgba(255,255,255,0) 99%,rgba(255,255,255,0) 100%)",
					left: 0,
					top: 0,
					width: 320,
					height: 190,
					zIndex: 302,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
					opacity:.65
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f2_gradient1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_gradient1_img"
				}
			}).render();

			var f2_gradient2_img = R.create("div").set({
				css:{
					// backgroundImage: R.create("var").set({name:"f2_gradient2_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					// backgroundSize: "contain",
					// backgroundPosition: "center center",
                    backgroundColor: "moz-linear-gradient(top,  rgba(0,0,0,0) 0%, rgba(0,0,0,0) 1%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)",
                    backgroundColor: "-webkit-linear-gradient(top,  rgba(0,0,0,0) 0%,rgba(0,0,0,0) 1%,rgba(0,0,0,1) 50%,rgba(0,0,0,1) 100%)",
                    backgroundColor: "linear-gradient(to bottom,  rgba(0,0,0,0) 0%,rgba(0,0,0,0) 1%,rgba(0,0,0,1) 50%,rgba(0,0,0,1) 100%)",
					left: 0,
					bottom: 0,
					width: 320,
					height: 90,
					zIndex: 302,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
                    opacity:.65
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f2_gradient2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_gradient2_img"
				}
			}).render();

			var f2_360_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f2_360_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 301,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden",
					display:'none'
				},
				rosetta:{
					parentNode:f2_container,
					tint: R.create("var").set({name:"f2_360_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_360_img"
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
					zIndex: 3,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "bg_img"
				}
			}).render();


           var f2_back_img = R.create("div").set({
                css:{
                    backgroundImage: R.create("var").set({name:"f2_back_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    left: 0,
                    top: 0,
                    width: 320,
                    height: 480,
                    zIndex: 302,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden"
                },
                rosetta:{
                    parentNode:f2_container,
                    tint: R.create("var").set({name:"f2_back_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
                },
                attr:{
                    id: "f2_back_img"
                }
            }).render();

            var stageBlock = R.create("div").set({
                css:{
                    left: 0,
                    top: 0,
                    width: width,
                    height: height,
                    pointerEvents: "auto",
                    cursor: "auto",
                    position: "absolute",
                    borderRadius: 0,
                    visibility: "hidden",
                    backgroundColor:"#ffffff",
                    zIndex:450
                },
                rosetta:{
                    parentNode:stage
                },
                attr:{
                    id: "stageBlock"
                }
            }).render();
            stageBlock.on("click",function(){
                //console.log("here")
            });

            var loading_img = R.create("div").set({
                css:{
                    backgroundImage: R.create("var").set({name:"loading_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    left: 0,
                    top: 4,
                    width: 320,
                    height: 480,
                    zIndex: 451,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden",
                    opacity:0
                },
                rosetta:{
                    parentNode:f1_container,
                    tint: R.create("var").set({name:"loading_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
                },
                attr:{
                    id: "loading_img"
                }
            }).render();

            var loading_bg = R.create("div").set({
                css:{
                    left: 0,
                    top: 0,
                    width: width,
                    height: height,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    borderRadius: 0,
                    visibility: "hidden",
                    backgroundColor:"rgba(0,0,0,.5)",
                    zIndex:450,
                    opacity:0
                },
                rosetta:{
                    parentNode:f1_container
                },
                attr:{
                    id: "loading_bg"
                }
            }).render();

            var loading_line_bg = R.create("div").set({
                css:{
                    left: 70,
                    top: 291,
                    width: 180,
                    height: 6,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    borderRadius: 3,
                    visibility: "hidden",
                    backgroundColor:"rgba(0,0,0,1)",
                    zIndex:451,
                    opacity:0
                },
                rosetta:{
                    parentNode:f1_container
                },
                attr:{
                    id: "loading_line_bg"
                }
            }).render();

            var loading_line = R.create("div").set({
                css:{
                    left: 70,
                    top: 291,
                    width: 10,
                    height: 6,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    borderRadius: 3,
                    visibility: "hidden",
                    backgroundColor:"rgba(255,255,255,1)",
                    zIndex:452,
                    opacity:0
                },
                rosetta:{
                    parentNode:f1_container
                },
                attr:{
                    id: "loading_line"
                }
            }).render();

            var f2_360_img_lrg = R.create("div").set({
                css:{
                    backgroundImage: R.create("var").set({name:"f2_360_img_lrg", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                    left: 0,
                    top: 0,
                    // width: 320,
                    // height: 480,
                    zIndex: 301,
                    pointerEvents: "none",
                    cursor: "auto",
                    position: "absolute",
                    visibility: "hidden",
                    display:'none'
                },
                rosetta:{
                    parentNode:f2_container
                },
                attr:{
                    id: "f2_360_img_lrg"
                }
            }).render();



            var hit_area1 = R.create("div").set({id:"ad_hit1", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:401, parentNode:f1_container});
            var hit_areaPanellum = R.create("div").set({id:"hit_areaPanellum", bottom:30, left:0, width: 161, height: 30, pointerEvents: "none", cursor: "pointer", zIndex:402, parentNode:f1_container});

            var f2_hit_area_back = R.create("div").set({id:"f2_hit_area_back", width: 75, height: 35, pointerEvents: "auto", cursor: "pointer", zIndex:402, parentNode:f2_container, backgroundColor:"rgba(0,0,0,0)"});
            var f2_hit_area_close_tip = R.create("div").set({id:"f2_hit_area_close_tip", width: 50, height: 50,left:228,top:123, pointerEvents: "none", cursor: "auto", zIndex:402, parentNode:f2_container, backgroundColor:"rgba(0,0,0,0)"});
            var f2_hit_area_close_tip_2 = R.create("div").set({id:"f2_hit_area_close_tip_2", width: width, height: height,left:0,top:0, pointerEvents: "none", cursor: "auto", zIndex:401, parentNode:f2_container, backgroundColor:"rgba(0,0,0,0)"});

            var f2_hit_area = R.create("div").set({id:"f2_hit_area", width: 150, height: 35,left:85,top:416, pointerEvents: "auto", cursor: "pointer", zIndex:402, parentNode:f2_container, backgroundColor:"rgba(0,0,0,0)"});

            hit_area1.on("click", adHit);
            f2_hit_area.on("click", adHit);


            var viewPort;
            var viewPortLoaded = false;

            /* [BATCH_LOADING] */
			var requiredArr = [logo_img,logo_img_2, f1_lifestyle_img];
            var allElementsArr = [fg_img, style_img, f1_pre_headline_img, f1_headline_img, f1_cta1_img, f1_cta2_img, f1_gradient1_img, f1_gradient2_img, f1_lifestyle_img, loading_img, f2_hotspot_off_img, f2_cta_img, f2_back_img, f2_gradient1_img, f2_gradient2_img, bg_img, logo_line_color, bg_color, panellumStage, stageBlock, hit_areaPanellum, f1_container, f2_container,loading_line_bg, loading_bg, loading_line, f2_hit_area_back, f2_hit_area, f2_360_img, f2_hit_area_close_tip,logo_line_color2,f1_cta1_container,f2_hit_area_close_tip_2];



            var img = "http://dtord01web02p.dc.dotomi.net/opslocal/images/2000/01141_LCH_LS_360/320x480/360_img_2.png";
            img = "https://secure.img-cdn.mediaplex.com/0/31141/360_img.jpg";


            function additionalSettings() {
                var peterPanellum = document.createElement('script');
                var peterPanellumCSS = document.createElement('link');
                peterPanellumCSS.rel = 'stylesheet';
                peterPanellumCSS.type = 'text/css';
                peterPanellumCSS.media = 'screen';

                peterPanellumCSS.onload = function(){
                    peterPanellum.onload = function(){
                        viewPort = pannellum.viewer(panellumStage.element, {
                            "type": "equirectangular",
                            "panorama": img,
                            "autoRotate": -10,
                            "autoRotateInactivityDelay": 500,
                            "maxLevel": 16,
                            // "compass": true,
							"sceneFadeDuration":2,
							"autoLoad":true,
							"showControls":false,
							//"fallback":"https://s-usweb.dotomi.com/images/2000/01141_LCH_LS_360/320x480/f2_360_img.png",
                            /*
                             * Uncomment the next line to print the coordinates of mouse clicks
                             * to the browser's developer console, which makes it much easier
                             * to figure out where to place hot spots. Always remove it when
                             * finished, though.
                             */
                            //"hotSpotDebug": true,
                            "hotSpots": [
                                {
                                    "pitch": -21,
                                    "yaw": 7,
                                    "cssClass": "custom-hotspot",
										"id": "hotspot1",
                                    "createTooltipFunc": hotspot,
										"createTooltipArgs": {
                                            pitch : "-21",
											yaw : "7",
                                            value:"1"
										}
                                },
                                {
                                    "pitch": -26,
                                    "yaw": 87,
                                    "cssClass": "custom-hotspot",
                                    "id": "hotspot2",
                                    "createTooltipFunc": hotspot,
                                    "createTooltipArgs": {
                                        pitch : "-26",
                                        yaw : "87",
                                        value:"2"
                                    }
                                },
                                {
                                    "pitch": -13,
                                    "yaw": 164,
                                    "cssClass": "custom-hotspot",
                                    "id": "hotspot3",
                                    "createTooltipFunc": hotspot,
                                    "createTooltipArgs": {
                                        pitch : "-13",
                                        yaw : "164",
                                        value:"3"
                                    }
                                },
                                {
                                    "pitch": -25,
                                    "yaw": -134,
                                    "cssClass": "custom-hotspot",
                                    "id": "hotspot4",
                                    "createTooltipFunc": hotspot,
                                    "createTooltipArgs": {
                                        pitch : "-25",
                                        yaw : "-134",
                                        value:"4"
                                    }
                                },
                                {
                                    "pitch": -14,
                                    "yaw": 40,
                                    "cssClass": "custom-hotspot",
                                    "id": "hotspot4",
                                    "createTooltipFunc": hotspot,
                                    "createTooltipArgs": {
                                        pitch : "-14",
                                        yaw : "40",
                                        value:"5"
                                    }
                                }
                            ]
                        });


                        viewPort.on('load',function(){
                            //console.log("viewPort loaded")
                            viewPortLoaded = true;
                        });



                        function hotspot(hotSpotDiv, args) {

                            hotSpotDiv.addEventListener('mouseover', function(e) {

                                hotSpotDiv.classList.add('custom-hotspot-hover');
                                var pitcher = parseInt(args.pitch);
                                var yawner = parseInt(args.yaw);
                                var value = parseInt(args.value);
                                console.log("value",value)
                                var closeButtonArr = [f2_hit_area_close_tip, f2_hit_area_close_tip_2];

                                function activateCloseButton(){
                                    closeButtonArr.forEach(function(element) {
                                        console.log(element);
                                        element.pointerEvents = "auto";
                                        element.cursor = "pointer";
                                        element.on("click", function(){
                                            stopCloseButton();
                                            TweenMax.to(catImgsArr[value-1].element, .5, {autoAlpha:0, ease:"Power4.easeIn"})
                                            setTimeout(function(){ viewPort.startAutoRotate(); }, 500);
                                        })
                                    });
								}
                                function stopCloseButton(){
                                    closeButtonArr.forEach(function(element) {
                                        console.log(element);
                                        element.pointerEvents = "none";
                                        element.cursor = "auto";
                                    });
                                }

                                viewPort.lookAt(pitcher+9, yawner)
                                viewPort.stopAutoRotate();
                                activateCloseButton();
                                TweenMax.to(catImgsArr[value-1].element, .5, {autoAlpha:1, ease:"Power4.easeOut", delay:.25})

                            });


                        }

                    };
                }
                //logo_img.element, logo_line_color.element

                document.head.appendChild(peterPanellum);
                document.head.appendChild(peterPanellumCSS);
                // peterPanellumCSS.href = "https://s-usweb.dotomi.com/images/2000/01141_LCH_LS_360/shared/pannellum_5.css";
                // peterPanellum.src = "https://s-usweb.dotomi.com/images/2000/01141_LCH_LS_360/shared/pannellum_2.js";

                peterPanellumCSS.href = "/pannellum_5.css";
                peterPanellum.src = "/pannellum_2.js";


            };

			var megaBatch = R.create("batch")
				.require(requiredArr)
                .add(catImgsArr)
				.add(allElementsArr)
				.render({
					success: function(){
						displayLoaded([
							R.filter.success(requiredArr),
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

			// var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
			// hit_area.on("click", adHit);
            //


			//ADDING CTT JUNK VARS

            /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
            hit_area.on("click", adHit); */

            /* [END_CREATE_ELEMENTS] */
            //creativeReady()




            // All Animation goes here
            function animateElements() {
            	var clicked = false;
                hit_areaPanellum.on("click", function(){
                    console.log("start 360");
                    if(clicked == false){
                        additionalSettings();
                        clicked = true;
                        tl2.play();
					}else{
                        masterOfTime.play();
					}
                });

                f2_hit_area_back.on("click", function(){
                	console.log("back");
                    var back = new TimelineMax();
						back.to(f1_container.element, 1, {autoAlpha:1, ease:"Power4.easeOut", onComplete:reset});

					function reset(){
						masterOfTime.pause(0);
					}
                });


                //console.log("viewPortLoaded 2",viewPortLoaded)
				function viewPortChecker(){
                	if(viewPortLoaded == false){
                		console.log("fallback")
                		TweenMax.set([f2_hotspot_off_img.element, f2_360_img.element], {display:"block"})
					}else{
                        console.log("loaded")
					}
				}

				function start360(){
                    hit_areaPanellum.pointerEvents = "auto";
				}

                // f1_cta1_container

                // TweenMax.set(f1_cta1_container.element, {perspective:800, force3d:false});
                // TweenMax.set(f1_cta1_img.element, {transformStyle:"preserve-3d", force3d:false});





                var f1_loadArr = [loading_img.element, loading_line_bg.element, loading_bg.element, loading_line.element]


				var tl1 = new TimelineMax();
					tl1.to([stageBlock.element], .5, {autoAlpha:0})
                        .add(start360)
					.staggerFrom([f1_pre_headline_img.element, f1_headline_img.element,[f1_cta1_container.element,f1_cta2_img.element]], 1, {autoAlpha:0, y:20, ease:"Power4.easeOut", delay:.25}, .15)
				//------------
				// 		.fromTo([f1_cta1_img.element], 1, {y:0,rotationY:0},{ rotationY:30, ease:"Back.easeOut", force3d:false})
                 //        .to([f1_cta1_img.element], 2,{y:0,rotationY:-30, ease:"Power4.easeInOut", force3d:false},"-=.5")
                 //        .to([f1_cta1_img.element], 2,{y:0,rotationY:0, ease:"Power4.easeInOut",easeParams:[3], force3d:false},"-=.5")
				//------------
                        .fromTo([f1_cta1_container.element], .5, {y:0,rotation:0},{ rotation:2, ease:"Power4.easeOut", force3d:false})
                        .to([f1_cta1_container.element], .5,{y:0,rotation:-2, ease:"Power4.easeOut", force3d:false},"-=.25")
                        .to([f1_cta1_container.element], .5,{y:0,rotation:2, ease:"Power4.easeOut", force3d:false},"-=.25")
                        .to([f1_cta1_container.element], .5,{y:0,rotation:-2, ease:"Power4.easeOut", force3d:false},"-=.25")
                        .to([f1_cta1_container.element], .5,{y:0,rotation:0, ease:"Back.easeOut", force3d:false},"-=.25")
					// .fromTo([f1_cta1_img.element], .3, {y:0},{y:-8, ease:"Power4.easeOut"})
					// .fromTo([f1_cta1_img.element], .3, {y:-8},{y:0, ease:"Back.easeOut", easeParams:[2]})
					// .fromTo([f1_cta1_img.element], .3, {y:0},{y:-8, ease:"Power4.easeOut"})
					// .fromTo([f1_cta1_img.element], .3, {y:-8},{y:0, ease:"Back.easeOut", easeParams:[2]})


                var tl2 = new TimelineMax({paused:true});
                	tl2.to(f1_loadArr, .25, {autoAlpha:1})
                        .to(loading_line.element, 1.5, {width:180, ease:"Expo.easeInOut",force3d:false},"+=.5")
						.to(f1_container.element, 1, {autoAlpha:0, ease:"Power4.easeOut"})
                		.to(f1_lifestyle_img.element, 1, {scale:2},"-=1")
						.add(viewPortChecker, "-=1")
						.set(f1_loadArr, {autoAlpha:0})
						.set(loading_line.element, {width:10})
                        .set(f1_lifestyle_img.element, {scale:1})

				var masterOfTime = new TimelineMax({paused:true})
                    .to(f1_container.element, 1, {autoAlpha:0, ease:"Power4.easeOut"})
                    .to(f1_lifestyle_img.element, 1, {scale:2},"-=1")
                    .add(viewPortChecker, "-=1")
                    .set(f1_loadArr, {autoAlpha:0})
                    .set(loading_line.element, {width:10})
                    .set(f1_lifestyle_img.element, {scale:1})



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
