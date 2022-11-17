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
                    "Rosetta":["core.pack","ad.pack","cnvr.advantage.pack","cnvr.usweb.pack","filters.pack","xmlpush.pack","tweenmax.pack","alignmentgroup.pack", "hammer.pack"]
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
                    placementWidth:Number(dmo.mediaWidth) || 300,
                    placementHeight:Number(dmo.mediaHeight) || 250,
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
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:286,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:286, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:286, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:286, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
          R.applyCSSReset(".stage");

 //CUSTOM
          var f1_lifestyle1_img = R.create("div").set({
            css:{
              backgroundImage: R.create("var").set({name:"f1_lifestyle1_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
              backgroundSize: "contain",
              backgroundPosition: "center center",
              left: 0,
              top: 48,
              width: 96,
              height: 144,
              zIndex: 194,
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

          var stageBlock = R.create("div").set({
            css:{
              backgroundColor:"#FFFFFF",
              left: 0,
              top: 0,
              width: width,
              height: height,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "visible",
              zIndex:borders.l.zIndex - 1
            },
            rosetta:{
              parentNode:stage,
            },
            attr:{
              id: "stageBlock"
            }
          }).render();

          var replay = R.create("div").set({
            css:{
              backgroundColor:"#000000",
              left: 0,
              top: 0,
              width: 20,
              height: 20,
              pointerEvents: "auto",
              cursor: "pointer",
              position: "absolute",
              visibility: "visible",
              zIndex:100
            },
            rosetta:{
              parentNode:stage,
            },
            attr:{
              id: "replay"
            }
          }).render();

          var f2_bg_color = R.create("div").set({
            css:{
              left: 0,
              top: 63,
              zIndex:f1_lifestyle1_img.zIndex + 1,
              width: 300,
              height: 972,
              pointerEvents: "auto",
              cursor: "auto",
              position: "absolute",
              backgroundColor: R.create("var").set({name:"f2_bg_color", defaultValue:"#000000.0", dataType:"Color", required:false, exposed:true}).render().value(),
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

//F2 1 INDEX
          var f2_headline1_text = R.create("div").set({
            css:{
              color: R.create("var").set({name:"f2_headline1_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
              fontSize: 32,
              fontFamily: 10740,
              fontStyle: "RegularFamily",
              lineHeight: 0.94,
              letterSpacing: 0,
              textAlign: "right",
              verticalAlign: "bottom",
              marginTop: 0,
              backgroundColor: R.create("var").set({name:"f2_headline1_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
              padding: R.create("var").set({name:"f2_headline1_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
              left: 43,
              top: 15,
              width: 220,
              height: 32,
              zIndex: 117,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
              left: 19,
              top: 229,
              width: 84,
              height: 48,
              zIndex: 114,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
              left: 131,
              top: 287,
              width: 124,
              height: 16,
              zIndex: 111,
              pointerEvents: "auto",
              cursor: "pointer",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
            },
            attr:{
              id: "f2_cta1_text",
              textContent: R.create("var").set({name:"f2_cta1_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
            },
            data:{
              hitIndex: 1
            }
          }).render().on("click", adHit);

          var f2_lifestyle1_img = R.create("div").set({
            css:{
              backgroundImage: R.create("var").set({name:"f2_lifestyle1_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
              backgroundSize: "contain",
              backgroundPosition: "center center",
              left: 43,
              top: 76,
              width: 90,
              height: 135,
              zIndex: 54,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,
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
              left: 38,
              top: 70,
              width: 100,
              height: 146,
              zIndex: 47,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,
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
              left: 119,
              top: 45,
              width: 148,
              height: 222,
              zIndex: 40,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:f2_bg_color,
              directoryType:"shared",
              tint: R.create("var").set({name:"f2_lifestyle2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
            },
            attr:{
              id: "f2_lifestyle2_img"
            }
          }).render();

/////////

			var f1_headline_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f1_headline_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 18,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.11,
					letterSpacing: 0,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f1_headline_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f1_headline_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 14,
					top: 205,
					width: 272,
					height: 23,
					zIndex: 156,
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
			}).render();

			var f2_headline3_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_headline3_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 32,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 0.94,
					letterSpacing: 0,
					textAlign: "right",
					verticalAlign: "bottom",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_headline3_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_headline3_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 46,
					top: 610,
					width: 220,
					height: 32,
					zIndex: 135,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
					left: 30,
					top: 665,
					width: 75,
					height: 56,
					zIndex: 132,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
					left: 139,
					top: 880,
					width: 132,
					height: 16,
					zIndex: 129,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
					fontSize: 32,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 0.94,
					letterSpacing: 0,
					textAlign: "left",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_headline2_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_headline2_text_padding", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					left: 35,
					top: 320,
					width: 220,
					height: 32,
					zIndex: 126,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
					left: 191,
					top: 358,
					width: 88,
					height: 43,
					zIndex: 123,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
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
					left: 31,
					top: 573,
					width: 130,
					height: 16,
					zIndex: 120,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:true
				},
				attr:{
					id: "f2_cta2_text",
					textContent: R.create("var").set({name:"f2_cta2_text", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value()
				},
				data:{
					hitIndex: 2
				}
			}).render().on("click", adHit);



			var f2_cta4_text = R.create("div").set({
				css:{
					color: R.create("var").set({name:"f2_cta4_text_color", defaultValue:"#000000", dataType:"Color", required:false, exposed:true}).render().value(),
					fontSize: 10,
					fontFamily: 10740,
					fontStyle: "RegularFamily",
					lineHeight: 1.2,
					letterSpacing: 0.2,
					textAlign: "center",
					verticalAlign: "middle",
					marginTop: 0,
					backgroundColor: R.create("var").set({name:"f2_cta4_text_bg_color", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value(),
					padding: R.create("var").set({name:"f2_cta4_text_padding", defaultValue:"7px 20px 7px 20px", dataType:"String", required:false, exposed:true}).render().value(),
					left: 67,
					top: 917,
					width: 186,
					height: 28,
					zIndex: 109,
					pointerEvents: "auto",
					cursor: "pointer",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,pixelDensity:FOF_PIXEL_DENSITY,forceLineHeight:false
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
					zIndex: 201,
					width: 300,
					height: 48,
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
					top: 198,
					zIndex: 150,
					width: 300,
					height: 52,
					pointerEvents: "none",
					cursor: "pointer",
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
					top: 48,
					zIndex: 146,
					width: 300,
					height: 202,
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

			var bg_color = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: 1,
					width: 300,
					height: 250,
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
					width: 300,
					height: 250,
					zIndex: 276,
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
					width: 300,
					height: 250,
					zIndex: 273,
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
					width: 300,
					height: 250,
					zIndex: 211,
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
					left: 139,
					top: 232,
					width: 23,
					height: 8,
					zIndex: 198,
					pointerEvents: "none",
					cursor: "none",
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



			var f1_lifestyle2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_lifestyle2_img", defaultValue:"", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 102,
					top: 48,
					width: 96,
					height: 144,
					zIndex: 181,
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
					left: 204,
					top: 48,
					width: 96,
					height: 144,
					zIndex: 176,
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



			var scroll_scrubber_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"scroll_scrubber_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 287,
					top: 59,
					width: 6,
					height: 26,
					zIndex: 300,
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
					left: 289,
					top: 59,
					width: 3,
					height: 180,
					zIndex: 299,
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
					left: 44,
          top: parseInt(f2_headline3_text.top) + 150,
					width: 90,
					height: 135,
					zIndex: 100,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
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
					left: 39,
          top: parseInt(f2_headline3_text.top) + 144,
					width: 100,
					height: 146,
					zIndex: 93,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
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
					left: 115,
          top: parseInt(f2_headline3_text.top) + 24,
					width: 156,
					height: 234,
					zIndex: 86,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
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
					left: 167,
					top: 436,
					width: 90,
					height: 135,
					zIndex: 77,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
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
					left: 161,
					top: 430,
					width: 102,
					height: 149,
					zIndex: 70,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
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
					left: 32,
					top: 344,
					width: 146,
					height: 219,
					zIndex: 63,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:f2_bg_color,
					directoryType:"shared",
					tint: R.create("var").set({name:"f2_lifestyle3_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f2_lifestyle3_img"
				}
			}).render();


			var bg_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"bg_img", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 300,
					height: 250,
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

			/* [BATCH_LOADING] */
			var requiredArr = [logo_img, f1_lifestyle1_img, f1_lifestyle2_img, f1_lifestyle3_img];
			var group1Array = [];
			var allElementsArr = [stageBlock,replay,
        f1_headline_text,
        f2_headline3_text,
        f2_subhead3_text,
        f2_cta3_text,
        f2_headline2_text,
        f2_subhead2_text,
        f2_cta2_text,
        f2_headline1_text,
        f2_subhead1_text,
        f2_cta1_text,
        f2_cta4_text,
        fg_img,
        style_img,
        f1_cta_arrow_img,
        scroll_scrubber_img,
        scroll_bar_img,
        f2_lifestyle5_img,
        f2_lifestyle5_bg_img,
        f2_lifestyle6_img,
        f2_lifestyle4_img,
        f2_lifestyle4_bg_img,
        f2_lifestyle3_img,
        f2_lifestyle1_img,
        f2_lifestyle1_bg_img,
        f2_lifestyle2_img,
        bg_img,
        logo_bg_color,
        f1_text_bg_color,
        f1_bg_color,
        f2_bg_color,
        bg_color
      ];

			// var group1 = R.create("AlignmentGroup").set({
			// 	verticalAlign: "middle"
			// }).add(group1Array).render();

			function additionalSettings() {
				};

			var megaBatch = R.create("batch")
				.require(requiredArr)
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

//CUSTOM
      var hit_area = R.create("div").set({id:"ad_hit", width: width, height: 199, pointerEvents: "none", cursor: "pointer", zIndex:0, parentNode:stage});

      //ADDING CTT JUNK VARS
			R.create("var").set({name:"duration", defaultValue:"", dataType:"Number", required:false, exposed:true});


            /* [END_CREATE_ELEMENTS] */
            //creativeReady()

            // All Animation goes here
            function animateElements() {

              TweenMax.set(f2_bg_color.element, {autoAlpha:0});

              var origScrubTop = parseInt(scroll_scrubber_img.top);
              var origF2BgTop = parseInt(f2_bg_color.top);
              // console.log("origF2BgTop",origF2BgTop)

//MOUSE EVENTS/////////////////////////////////////

              var alreadyHit = false;
              var pointers = false;

              hit_area.on("click", adHit);
              //advance to frame 2
              f1_text_bg_color.on("click", frame2Anim);
              //reset animation to frame 1
              replay.on("click", resetToFrame1);

              function pointerEvents(){
                if(!pointers){
                  console.log("PointerEventsOn")
                  hit_area.pointerEvents = "auto";
                  f2_bg_color.pointerEvents = "auto";
                  f1_text_bg_color.pointerEvents = "auto";
                  replay.pointerEvents = "auto";
                  pointers = true;
                } else {
                  console.log("PointerEventsOff")
                  hit_area.pointerEvents = "none";
                  f2_bg_color.pointerEvents = "none";
                  f1_text_bg_color.pointerEvents = "none";
                  replay.pointerEvents = "none";
                  pointers = false;
                }
              }

              hit_area.pointerEvents = "none";
              f2_bg_color.pointerEvents = "none";
              f1_text_bg_color.pointerEvents = "none";
              replay.pointerEvents = "none";

//HAMMER///////////////////////////////////////////
              var f2HeadLeft = parseInt(f2_headline3_text.left);
              var f2Sub3Left = parseInt(f2_subhead3_text.left);
              var f2Ls5Left = parseInt(f2_lifestyle5_img.left);
              var f2Ls5BGLeft = parseInt(f2_lifestyle5_bg_img.left);
              var f2Ls6Left = parseInt(f2_lifestyle6_img.left);
              var f2Cta3Left = parseInt(f2_cta3_text.left);
              var f2Cta4Left = parseInt(f2_cta4_text.left);

              // console.log("FROM ANIMATE ELEMENTS");
              // console.log(f2HeadLeft + " f2_headline3_text.left");
              // console.log(f2Sub3Left + " f2_subhead3_text.left");
              // console.log(f2Ls5Left + " f2_lifestyle5_img.left");
              // console.log(f2Ls5BGLeft + " f2_lifestyle5_bg_img.left");
              // console.log(f2Ls6Left + " f2_lifestyle6_img.left");
              // console.log(f2Cta3Left + " f2_cta3_text.left");
              // console.log(f2Cta4Left + " f2_cta4_text.left");

              function startHammer(){

                console.log("starthammer");
                var scrubberHammer = new Hammer(scroll_scrubber_img.element);
                var bgHammer = new Hammer(f2_bg_color.element);

                // set hammer type, direction, threshold & callback functions
                scrubberHammer.get('pan').set({direction:Hammer.DIRECTION_VERTICAL, threshold:0});
                bgHammer.get('pan').set({direction:Hammer.DIRECTION_VERTICAL, threshold:0});

                scrubberHammer
                  .on('panstart', onScrubStart) // starting position of scrubber
                  .on('panup pandown', onScrub) // during scrub
                  .on('panend', onScrubEnd); // end of scrub
                bgHammer
                  .on('panstart', onScrubStart) // starting position of scrubber
                  .on('panup pandown', onScrub) // during scrub
                  .on('panend', onScrubEnd); // end of scrub

                var startScrubY;
                var percentage;

                var trackTop = parseFloat(scroll_bar_img.top); // is where the scrubber will stop on left sid
                // console.log(trackTop);

                var trackHeight = parseFloat(scroll_bar_img.height); // width of the scrubber track/ width of
                // scrub bar
                // console.log("trackTop " + trackTop);
                // console.log("trackHeight " + trackHeight);

                function onScrubStart() {
                  startScrubY = parseFloat(scroll_scrubber_img.top); // where the scrubber img starts
                  console.log("scroll_scrubber_img " + scroll_scrubber_img.top);
                }

                function onScrub(e) {
                  if (startScrubY !== null && startScrubY !== undefined) {
                    /*  Note: e.deltaX representing the vertical scroll amount.
                         // It will take the startScrubY as a org point 0,
                           it'll negative when it goes to the top and positive when it goes to the bottom.
                    */

                    var distance = e.deltaY;

                    percentage = (parseFloat(scroll_scrubber_img.top) - origScrubTop)/(trackHeight- parseInt(scroll_scrubber_img.height));

                    // console.log("percentage " + percentage);

                    // console.log("percentage * height " + percentage * height);
                    // the current top position of scrubber
                    scroll_scrubber_img.top = startScrubY + distance;

                    // set lifestyle_img to pan as scrubber_img.top position changes
                    //  is offset between lifestyle_ctn and actual ad height
                    // f2_bg_color.top = "-" + ((percentage * 100) + 30);
                    // f2_bg_color.top = origF2BgTop - (percentage * (parseInt(f2_bg_color.height) - parseInt(height)));
                    f2_bg_color.top = origScrubTop - ( (percentage * (parseInt(height) + parseInt(origF2BgTop) + 474 /*< need to understand that number as its whats allowing f2_bg to scroll to the bottom when interacted with*/)));
                    // console.log("num", origScrubTop - ( (percentage * (parseInt(height) + (parseInt(origF2BgTop)*2) ))))
                    // f2_bg_color.top = 30;

                    if(parseFloat(scroll_scrubber_img.top) < origScrubTop){ // set limit on the left side
                          TweenMax.set(scroll_scrubber_img.element, {top:origScrubTop});
                          // TweenMax.set(f2_bg_color.element, {top:origF2BgTop});
                    }
                    if(parseFloat(scroll_scrubber_img.top) > 300){ // set limit on the left side

                      // console.log("FROM THE IF STATEMENT");
                      // console.log(f2HeadLeft + " f2_headline3_text.left");
                      // console.log(f2Sub3Left + " f2_subhead3_text.left");
                      // console.log(f2Ls5Left + " f2_lifestyle5_img.left");
                      // console.log(f2Ls5BGLeft + " f2_lifestyle5_bg_img.left");
                      // console.log(f2Ls6Left + " f2_lifestyle6_img.left");
                      // console.log(f2Cta3Left + " f2_cta3_text.left");
                      // console.log(f2Cta4Left + " f2_cta4_text.left");
                      // console.log(alreadyHit + " already hit from outside")

                      // if(!alreadyHit) {
                      //
                      //   f2_index_3_in = new TimelineMax()
                      //   f2_index_3_in.from(f2_headline3_text.element,0.75,  {autoAlpha:0, left: 320, ease: 'Power1.easeInOut'},0);
                      //   f2_index_3_in.from(f2_subhead3_text.element,0.75, {autoAlpha:0, left: -115, ease: 'Power1.easeInOut'},0);
                      //   f2_index_3_in.from(f2_lifestyle5_img.element,0.75,  {autoAlpha:0, left: -144, ease: 'Power1.easeInOut'}, 0);
                      //   f2_index_3_in.from(f2_lifestyle5_bg_img.element,0.75, {autoAlpha:0, left: -149, ease: 'Power1.easeInOut'}, 0);
                      //   f2_index_3_in.from(f2_lifestyle6_img.element,0.75, {autoAlpha:0, left: 320, ease: 'Power1.easeInOut'}, 0);
                      //   f2_index_3_in.from(f2_cta3_text.element,0.75, {autoAlpha:0, left: 512, ease: 'Power1.easeInOut'}, 0);
                      //   f2_index_3_in.from(f2_cta4_text.element,1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0);
                      //
                      //   alreadyHit = true;
                      //   var tl2 = new TimelineMax()
                      //     .add(f2_index_3_in)
                      //   console.log(alreadyHit + " already hit from the if")
                      //   var tl2Duration = tl2.duration();
                      //   tl2.duration(R.create("var").set({
                      //     name: "duration",
                      //     defaultValue: tl2Duration,
                      //     dataType: "Number",
                      //     exposed: true
                      //   }).render().value())
                      // }else {
                      //   alreadyHit = true;
                      //   console.log("else")
                      // }
                    }

                    if(parseFloat(scroll_scrubber_img.top) > origScrubTop + trackHeight - parseInt(scroll_scrubber_img.height)){ // set limit on the bottom
                      TweenMax.set(scroll_scrubber_img.element, {top:origScrubTop + trackHeight - parseInt(scroll_scrubber_img.height)});
                          // TweenMax.set(scroll_scrubber_img.element, {top:429});
                          // TweenMax.set(f2_bg_color.element, {top:-490});
                    }
                  } //end conditional
                } //end onScrub

                function onScrubEnd(){
                  TweenMax.to(scroll_scrubber_img.element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1, force3D:false});
                  TweenMax.to(f2_bg_color.element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1, force3D:false});
                } //end onScrubEnd
              } //end startHammer

//ANIMATE////////////////////////////////////

              replay.display = "none";
              TweenMax.to(stageBlock.element, 1, {autoAlpha: 0});
              TweenMax.set([scroll_scrubber_img.element, scroll_bar_img.element, f2_bg_color.element], {autoAlpha: 0});
              TweenMax.from(logo_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeInOut'});

              //opening animation
              var onOpen = new TimelineMax()
              if(f1_text_bg_color.element){onOpen.from(f1_text_bg_color.element, 1.75, {autoAlpha:0,ease: 'Power3.easeIn'}, 0)};
              // if(f1_lifestyle1_img.element){onOpen.staggerFrom([
					     //    f1_lifestyle6_img.element,
              //     f1_lifestyle5_img.element,
              //     f1_lifestyle4_img.element],
              //     1.5, {autoAlpha: 0, ease: 'Power1.easeInOut'}, .2, 0)};
              if(f1_lifestyle1_img.element){onOpen.staggerFrom([
                  f1_lifestyle1_img.element,
                  f1_lifestyle2_img.element,
                  f1_lifestyle3_img.element],
                  1.5, {autoAlpha: 0, ease: 'Power1.easeInOut'}, .2, 0)};
              if(f1_cta_arrow_img.element){onOpen.from(f1_cta_arrow_img.element, 2.5, {autoAlpha: 0, y:"-=20", ease:"Power3.easeInOut"}, .1)};
              if(f1_headline_text.element){onOpen.from(f1_headline_text.element, 1.3, {scale:.95, autoAlpha: 0, ease: 'Power3.easeIn', onComplete:pointerEvents}, .5)};


              var frame_2_in;
              var f2_index_3_in;
              var frame_2_reset = new TimelineMax()

              function frame2Anim(){

              pointerEvents();
              clearTimeout(f1Timeout);

              TweenMax.to(f2_bg_color.element,1,{autoAlpha: 1});


                f2_bg_color.display = "visible";
                onOpen.reverse().timeScale(2);

                // TweenMax.set([f2_headline3_text.element,f2_subhead3_text.element,f2_lifestyle5_img.element,
                //   f2_lifestyle5_bg_img.element,f2_lifestyle6_img.element,f2_cta3_text.element,f2_cta4_text.element],
                //   {autoAlpha:0})


                // f2_index_3_in.to(f2_headline3_text.element, 0.75, {left:187, ease: 'Power1.easeInOut'},0);
                // f2_index_3_in.to(f2_subhead3_text.element, 0.75, {left: 42, ease: 'Power1.easeInOut'},0);
                // f2_index_3_in.to(f2_lifestyle5_img.element, 0.75, {left: 54, ease: 'Power1.easeInOut'}, 0);
                // f2_index_3_in.to(f2_lifestyle5_bg_img.element, 0.75, {left: 39, ease: 'Power1.easeInOut'}, 0);
                // f2_index_3_in.to(f2_lifestyle6_img.element, 0.75, {left: 127, ease: 'Power1.easeInOut'}, 0);
                // f2_index_3_in.to(f2_cta3_text.element, 0.75, {left: 191, ease: 'Power1.easeInOut'}, 0);


                //includes mock autoPlay on frame2
               frame_2_in = new TimelineMax()

                // var rev = frame_2_in.reversed();
                // console.log(rev);
                //
                // if (frame_2_in.reversed()) {
                //   frame_2_in.reverse();
                //   console.log("play reverse");
                // } else {
                //   frame_2_in.play();
                //   console.log("play");
                // }

                var f2HeadLeft = parseInt(f2_headline3_text.left);
                var f2Sub3Left = parseInt(f2_subhead3_text.left);
                var f2Ls5Left = parseInt(f2_lifestyle5_img.left);
                var f2Ls5BGLeft = parseInt(f2_lifestyle5_bg_img.left);
                var f2Ls6Left = parseInt(f2_lifestyle6_img.left);
                var f2Cta3Left = parseInt(f2_cta3_text.left);
                var f2Cta4Left = parseInt(f2_cta4_text.left);

                console.log("FROM FRAME 2 ANIM");
                console.log(f2HeadLeft + " f2_headline3_text.left");
                console.log(f2Sub3Left + " f2_subhead3_text.left");
                console.log(f2Ls5Left + " f2_lifestyle5_img.left");
                console.log(f2Ls5BGLeft + " f2_lifestyle5_bg_img.left");
                console.log(f2Ls6Left + " f2_lifestyle6_img.left");
                console.log(f2Cta3Left + " f2_cta3_text.left");
                console.log(f2Cta4Left + " f2_cta4_text.left");

              if(f2_bg_color.element){frame_2_in.to(f2_bg_color.element, 2, {y: -785, ease: 'Power1.easeInOut', delay:1.75},0)};
              if(f2_bg_color.element){frame_2_in.to(scroll_scrubber_img.element, 2, {top: 215, ease: 'Power1.easeInOut'},2)};
              if(f2_bg_color.element){frame_2_in.to(f2_bg_color.element, 1.5, {y:0, ease: 'Power3.easeInOut', onComplete:startHammer},4)};
              if(f2_bg_color.element){frame_2_in.to(scroll_scrubber_img.element, 1.5, {top: 59, ease: 'Power3.easeInOut', onComplete:pointerEvents},4)};

              if(f2_headline1_text.element){frame_2_in.to([scroll_scrubber_img.element, scroll_bar_img.element], 2,{autoAlpha: 1},1.5)};

              if(f2_headline1_text.element){frame_2_in.from(f2_headline1_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 1)};
              if(f2_subhead1_text.element){frame_2_in.from(f2_subhead1_text.element, 0.75, {left: -112, ease: 'Power1.easeInOut'}, 1)};
              if(f2_cta1_text.element){frame_2_in.from(f2_cta1_text.element, 0.75, {left: 512, ease: 'Power1.easeInOut'}, 1)};
              if(f2_lifestyle1_img.element){frame_2_in.from(f2_lifestyle1_img.element, 0.75, {left: -144, ease: 'Power1.easeInOut'}, 1)};
              if(f2_lifestyle1_bg_img.element){frame_2_in.from(f2_lifestyle1_bg_img.element, 0.75, {left: -150, ease: 'Power1.easeInOut'}, 1)};
              if(f2_lifestyle2_img.element){frame_2_in.from(f2_lifestyle2_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 1)};

              if(f2_headline1_text.element){frame_2_in.to([scroll_scrubber_img.element, scroll_bar_img.element], 1,{autoAlpha: 1},3)};

              if(f2_subhead2_text.element){frame_2_in.from(f2_subhead2_text.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 2)};
              if(f2_cta2_text.element){frame_2_in.from(f2_cta2_text.element, 0.75, {left: -170, ease: 'Power1.easeInOut'}, 2)};
              if(f2_headline1_text.element){frame_2_in.from(f2_headline2_text.element, 0.75, {left: -320, ease: 'Power1.easeInOut'}, 2)};
              if(f2_lifestyle3_img.element){frame_2_in.from(f2_lifestyle3_img.element, 0.75, {left: -182, ease: 'Power1.easeInOut'}, 2)};
              if(f2_lifestyle4_img.element){frame_2_in.from(f2_lifestyle4_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 2)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_lifestyle4_bg_img.element, 0.75, {left: 320, ease: 'Power1.easeInOut'}, 2)};

              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_headline3_text.element,0.75,  {left: 320, ease: 'Power1.easeInOut'},2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_subhead3_text.element,0.75, {left: -115, ease: 'Power1.easeInOut'},2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_lifestyle5_img.element,0.75,  {left: -144, ease: 'Power1.easeInOut'},2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_lifestyle5_bg_img.element,0.75, {left: -149, ease: 'Power1.easeInOut'},2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_lifestyle6_img.element,0.75, {left: 320, ease: 'Power1.easeInOut'},2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_cta3_text.element,0.75, {left: 512, ease: 'Power1.easeInOut'}, 2.75)};
              if(f2_lifestyle4_bg_img.element){frame_2_in.from(f2_cta4_text.element,1, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 2.75)};

                // frame_2_in.set(f2_headline3_text.element,  {left: 320, ease: 'Power1.easeInOut'},0);
                // frame_2_in.set(f2_subhead3_text.element, {left: -115, ease: 'Power1.easeInOut'},0);
                // frame_2_in.set(f2_lifestyle5_img.element,  {left: -144, ease: 'Power1.easeInOut'}, 0);
                // frame_2_in.set(f2_lifestyle5_bg_img.element, {left: -149, ease: 'Power1.easeInOut'}, 0);
                // frame_2_in.set(f2_lifestyle6_img.element, {left: 320, ease: 'Power1.easeInOut'}, 0);
                // frame_2_in.set(f2_cta3_text.element, {left: 512, ease: 'Power1.easeInOut'}, 0);
                // frame_2_in.set(f2_cta4_text.element, {autoAlpha: 0, ease: 'Power1.easeInOut'}, 0);

              };

              var f1Timeout = setTimeout(frame2Anim, 5000);

              function resetToFrame1() {

                hit_area.pointerEvents = "none";
                f2_bg_color.pointerEvents = "none";

                //animate container elements off screen
                function animateOutFrame2(){
                  onOpen.play().delay(1);
                  // onOpen.seek(0);
                  frame_2_in.reverse(-3).timeScale(2);
                }

                //move container and scrubber back to position 0
                frame_2_reset = new TimelineMax()
                if(f2_bg_color.element){frame_2_reset.to(f2_bg_color.element, 1, {top:86, ease: 'Power3.easeInOut', autoAlpha:1, onComplete:animateOutFrame2,pointerEvents},0)};
                if(f2_bg_color.element){frame_2_reset.to(scroll_scrubber_img.element, 1, {top: 86, ease: 'Power3.easeInOut'},0)};
                // if(f2_bg_color.element){frame_2_reset.to([f2_bg_color.element, scroll_bar_img.element], 1, {autoAlpha:0},2)};
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
