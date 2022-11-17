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
        var CENTER_STAGE = false;

        function init(wrapperID) {
            var subdirectory = "151428_OPS_Evian";
            var creativeName = "" || subdirectory;
            var companyID = "62932";
            var isSecure = (dmo.externalURL.indexOf("https:") > -1);



            var config = {
                context: context,
                waitSeconds: 5,
                paths: {},
                bundles: {
                    "Rosetta":["core.pack","ad.pack","cnvr.usweb.pack","cnvr.mojo.pack","filters.pack","tweenmax.pack"]
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
                        FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"4.0.2", exposed:false}).render().value(),
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
                l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:475,  pointerEvents:"none", parentNode:stage}).render(),
                r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:475, pointerEvents:"none",parentNode:stage}).render(),
                t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:475, pointerEvents:"none", parentNode:stage}).render(),
                b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:475, pointerEvents:"none", parentNode:stage}).render()
            };

            //apply CSS reset to stage class
            R.applyCSSReset(".stage");

            
			var stageBlock = R.create("div").set({
				css:{
					left: 0,
					top: 0,
					zIndex: borders.l.zIndex-1,
					width: width,
					height: height,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"#FFFFFF", dataType:"Color", required:false, exposed:true}).render().value(),
					visibility: "hidden"
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
					backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"#fac5d3", dataType:"Color", required:false, exposed:true}).render().value(),
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
					zIndex: 465,
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
					zIndex: 462,
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


		var headline_cont = R.create("div").set({
            css:{
              left: 0,
              top: 0,
              width: width,
              height: height,
              zIndex: 449,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:stage
            },
            attr:{
              id: "headline_cont"
            }
          }).render();

		var subhead_cont = R.create("div").set({
            css:{
              left: 0,
              top: 0,
              width: width,
              height: height,
              zIndex: headline_cont.zIndex+4,
              pointerEvents: "none",
              cursor: "auto",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta:{
              parentNode:stage
            },
            attr:{
              id: "subhead_cont"
            }
          }).render();

			var subhead_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"subhead_img", defaultValue:"subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 354,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:subhead_cont,
					tint: R.create("var").set({name:"subhead_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "subhead_img"
				}
			}).render();

			var subhead_img_shadow = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"subhead_img", defaultValue:"subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 1,
					top: 2,
					width: 320,
					height: 480,
					zIndex: subhead_img.zIndex-1,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:subhead_cont,
					tint: R.create("var").set({name:"subhead_img_tint", defaultValue:"#147bdb", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "subhead_img_shadow"
				}
			}).render();		

///////////////

			var headline_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"headline_img", defaultValue:"headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 271,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:headline_cont,
					tint: R.create("var").set({name:"headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "headline_img"
				}
			}).render();

			var headline_img_shadow_text = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"headline_img", defaultValue:"headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 2,
					top: 3,
					width: 320,
					height: 480,
					zIndex: headline_img.zIndex-1,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:headline_cont,
					tint: R.create("var").set({name:"headline_img_tint", defaultValue:"#147bdb", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "headline_img_shadow_text"
				}
			}).render();


			var evian_bottle_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"evian_bottle_img", defaultValue:"evian_bottle_img.png", dataType:"String", required:true, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 50001,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"evian_bottle_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "evian_bottle_img"
				}
			}).render();

			var walmart_logos_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"walmart_logos_img", defaultValue:"walmart_logos_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 4000,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"walmart_logos_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "walmart_logos_img"
				}
			}).render();

			var cta_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"cta_img", defaultValue:"cta_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 4000,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"cta_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "cta_img"
				}
			}).render();

			var gradient_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"gradient_img", defaultValue:"gradient_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 320,
					height: 480,
					zIndex: 3999,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"gradient_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "gradient_img"
				}
			}).render();

			var mountain1_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"mountain1_img", defaultValue:"mountain1_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: -64,
					top: -61,
					width: 448,
					height: 586,
					zIndex: headline_cont.zIndex+12,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"mountain1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "mountain1_img"
				}
			}).render();

			var mountain2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"mountain2_img", defaultValue:"mountain2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: -64,
					top: -61,
					width: 448,
					height: 586,
					zIndex: headline_cont.zIndex+1,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "hidden"
				},
				rosetta:{
					parentNode:stage,
					tint: R.create("var").set({name:"mountain2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "mountain2_img"
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
					zIndex: 9,
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
			var requiredArr = [evian_bottle_img, headline_cont];
			var allElementsArr = [fg_img, style_img, subhead_img, headline_img, walmart_logos_img, cta_img, gradient_img, mountain1_img, mountain2_img, bg_img, bg_color,headline_img_shadow_text,subhead_cont,subhead_img_shadow, stageBlock];
			
////////////////////

			// if(headlinePosition){
			// 	headline_text.top = 310;
			// 	headline_color_shadow_text.top = parseInt(headline_text.top) + 3;
			// 	headline_color_shadow_text.left = parseInt(headline_text.left) + 3;
			// }

////////////////////

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
			
			var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
			hit_area.on("click", adHit);
				
			//ADDING CTT JUNK VARS
            /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
            hit_area.on("click", adHit); */

            /* [END_CREATE_ELEMENTS] */
            //creativeReady()

            // All Animation goes here
            function animateElements() {

            	TweenMax.set(gradient_img.element, {autoAlpha:0})

                var all_frames = new TimelineMax()

					if(stageBlock.element){all_frames.to(stageBlock.element, 1.5, {autoAlpha:0})}; 

					if(headline_cont.element){all_frames.from(headline_cont.element, .75, {left: -350, y: 400, ease: 'Power1.easeOut'}, 0.25)};
					if(subhead_img.element){all_frames.from(subhead_cont.element, .75, {left: -350, y: 400,  ease: 'Power1.easeOut'},1.)};

					if(mountain2_img.element){all_frames.fromTo(mountain2_img.element, 1.5, {y: 400, scale: 7},{rotation:0.01, y:0, scale: 1, ease: 'Back.easeOut', easeParams:[0.5]}, 0.4)};
					if(gradient_img.element){all_frames.to(gradient_img.element, 1, {scale: 1,autoAlpha:1}, 0.5)};
					if(mountain1_img.element){all_frames.fromTo(mountain1_img.element, 1.75, {y: 0, scale: 7},{y:0, scale: 1, ease: 'Back.easeOut', easeParams:[0.5]}, 0.7)};

					if(evian_bottle_img.element){all_frames.fromTo(evian_bottle_img.element, .8, {rotation:20, scale:5, y:0, x:0, autoAlpha:0},{rotation:0, scale: 1, autoAlpha:0, y:0, x:0, ease: 'Back.easeOut', easeParams:[0.34], autoAlpha:1}, 1.5)};

					if(walmart_logos_img.element){all_frames.fromTo([walmart_logos_img.element, cta_img.element], .7, {y: 400, scale: 1},{rotation:0.01, y:0, scale: 1, ease: 'Back.easeOut', easeParams:[0.5]}, 1.7)};
					// if(cta_img.element){all_frames.from(cta_img.element, 1, {autoAlpha: 0, ease: 'Power1.easeOut'}, 1)};
					// if(gradient_img.element){all_frames.from(gradient_img.element, 1, {autoAlpha: 0, ease: 'Power0.easeNone'}, 1)};

					
				var tl = new TimelineMax()
					.add(all_frames)

				var tlDuration = tl.duration();
				tl.duration(R.create("var").set({name:"duration", defaultValue:tlDuration, dataType: "Number", exposed:true}).render().value())
                    
                /* [END_ANIMATE_ELEMENTS] */

                //CUSTOM TEXT EFFECT////////////////////

				//set how long the shadow should be
				var shadowLength = 800;
				// var shadowLength2 = 800;

				function cloneShadow(i) {
		      		var cloneElement = headline_img_shadow_text.element;
		      		var copy = cloneElement.cloneNode(true);
		            copy.id = "clone" + i;
			        copy.style.left = parseInt(cloneElement.style.left) - i + "px";
			        copy.style.top = parseInt(cloneElement.style.top) + i + "px";         
			        headline_cont.appendChild(copy);

		      		function remove(el){el.style.display = "none"; /*console.log(el)*/}
		      			setTimeout(function(){ remove(copy); }, 
		      				//delay before long shadow begins to retract
		      				(700 - i)
		      				//speed long shadow retracts at
		      				* 2.1);
			  		}


				function cloneShadow2(i) {
		      		var cloneElement2 = subhead_img_shadow.element;
		      		var copy2 = cloneElement2.cloneNode(true);
		            copy2.id = "clone2" + i;
			        copy2.style.left = parseInt(cloneElement2.style.left) - i*1.1 + "px";
			        copy2.style.top = parseInt(cloneElement2.style.top) + i + "px";         
			        subhead_cont.appendChild(copy2);

		      		function remove2(el){el.style.display = "none"; /*console.log(el)*/}
		      			setTimeout(function(){ remove2(copy2); }, 		      				
		      				//delay before long shadow begins to retract
		      				(1000 - i)
		      				//speed long shadow retracts at
		      				* 2.1);
			  		}

			  		//creates the trail length dependent on shadow length var
			  		for (var i = shadowLength; i > 0; i-- ) {
			            cloneShadow(i);
			            cloneShadow2(i)
					}
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