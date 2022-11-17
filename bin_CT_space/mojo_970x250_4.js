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
    var R, Platform, Settings, Analytics, AnalyticsContent,TweenMax, TweenLite, TimelineLite, TimelineMax, EventForwarding, Hammer, Parallax/* [INSERT_PLUGIN_VARS] */;

    var ROSETTA_VERSION = "4.30";
    var context = String(ROSETTA_VERSION + "_"  + dmo.embedId).split("_").join(".");
    var parentDiv, stage, animate, timeoutTimer, startTimer, FOF_PIXEL_DENSITY;
    var evergreenImg = "evergreen.jpg";
    var CENTER_STAGE = false;

    function init(wrapperID) {
      var subdirectory = "1038CI_Space_2017_Adventure_Club";
      var creativeName = "" || subdirectory;
      var companyID = "1001";
      var isSecure = (dmo.externalURL.indexOf("https:") > -1);


      var config = {
        context: context,
        waitSeconds: 5,
        paths: {},
        bundles: {
          "Rosetta":["core.pack","tweenmax.pack","hammer.pack","ad.pack",/*,  "cnvr.usweb.pack" */"cnvr.mojo.pack","filters.pack", "video.pack","svgembed.pack","gsap.drawsvgplugin.pack", "gsap.morphsvgplugin.pack","parallax.pack"]
        }
      };

      config.bundles.Rosetta = (function(bundles){
        if (typeof Object.create != 'function'){
          var compatible = ["static.pack"];
          for (var i=0; i<bundles.length; i++){
            if (bundles[i].indexOf("cnvr.") > -1){
              compatible.push(bundles[i]);
            }
          }
          if (typeof dmo.rosettaBundles == "function"){compatible = dmo.rosettaBundles(compatible)}
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
        if (typeof dmo.rosettaLoaded == "function"){dmo.rosettaLoaded(req, R)}
        if (wrapperID){
          Settings.overwrite({prefix: wrapperID + "_"});
          parentDiv = document.getElementById(wrapperID);
        }
        parentDiv = parentDiv || document.body;
        Platform.overwrite({
          isSecure:isSecure,
          rosettaVersion:ROSETTA_VERSION,
          placementWidth:Number(dmo.mediaWidth) || 970,
          placementHeight:Number(dmo.mediaHeight) || 250,
          clientID:dmo.companyId || companyID
        });
        R.setFallback(fallback);

        if (R.isCompatible == true) {
          R.parseParameters(dmo.flashVars, 'flashvars');
          Platform.overwrite({
            clientID: R.create("var").set({name:"company_id", dataType:"String", defaultValue:Platform.fetch().clientID}).render().value(),
            cacheBuster: R.create("var").set({name:"bypass_cache", dataType:"Boolean", defaultValue:false, exposed:false}).render().value(),
            subdirectory:R.create("var").set({name:"subdirectory", dataType:"String", defaultValue:subdirectory}).render().value(),
            FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"2.0.2", exposed:false}).render().value(),
            isSecure: R.create("var").set({name:"dtm_secure", dataType:"Boolean", defaultValue:Platform.fetch().isSecure, exposed:false}).render().value(),
            analytics: (window["mplx"] && window["mplx"].SVEvent),
            analyticsScope: null
          });
          if (R.create("var").set({name:"disable_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value() == false
            && (R.environment.isRetina == true || R.create("var").set({name:"force_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value())) {
            Settings.overwrite({pixelDensity: 2})
          };
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

      stage = R.create("div").set({id:"stage", width: width, height: height, backgroundColor:"#FFFFFF"});
      parentDiv.appendChild(stage.element);
      Settings.overwrite({stage: stage});
      new EventForwarding().init({stage:stage});
      var borders = {
        l:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, left:0, top:0, zIndex:999,  pointerEvents:"none", parentNode:stage}).render(),
        r:R.create("div").set({width:"1px", height:height, backgroundColor:borderColor, right:0, top:0, zIndex:999, pointerEvents:"none",parentNode:stage}).render(),
        t:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, top:0, zIndex:999, pointerEvents:"none", parentNode:stage}).render(),
        b:R.create("div").set({width:width, height:"1px", backgroundColor:borderColor, left:0, bottom:0, zIndex:999, pointerEvents:"none", parentNode:stage}).render()
      };

      R.applyCSSReset("stage");

      var ad_choices_logo = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          zIndex: 998,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          backgroundImage: R.create("var").set({name:"f1_bg_img", defaultValue:"adChoices.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "970px 250px",
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
        },
        rosetta:{
          parentNode:stage
        },
        attr:{
          id: "f1_container"
        }
      }).render();

      var f1_container = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          zIndex: 201,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          backgroundImage: R.create("var").set({name:"f1_bg_img", defaultValue:"f1_bg_img_4.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "970px 250px",
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
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
          left: 970,
          top: 0,
          zIndex: 200,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          //backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"rgba(0,0,0,.3)", dataType:"Color", required:false, exposed:true}).render().value(),
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
        },
        rosetta:{
          parentNode:stage
        },
        attr:{
          id: "f2_container"
        }
      }).render();

      var f3_container = R.create("div").set({
        css:{
          left: 0,
          top: -1000,
          zIndex: 201,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          //backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"rgba(0,0,0,.3)", dataType:"Color", required:false, exposed:true}).render().value(),
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
        },
        rosetta:{
          parentNode:stage
        },
        attr:{
          id: "f3_container"
        }
      }).render();

      var f4_container = R.create("div").set({
        css:{
          left: 0,
          top: 1000,
          zIndex: 201,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          //backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"rgba(0,0,0,.3)", dataType:"Color", required:false, exposed:true}).render().value(),
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
        },
        rosetta:{
          parentNode:stage
        },
        attr:{
          id: "f4_container"
        }
      }).render();

      var f4_card_container = R.create("div").set({
        css:{
          left: -970,
          top: 0,
          zIndex: 200,
          width: 970,
          height: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          //backgroundColor: R.create("var").set({name:"bg_color", defaultValue:"rgba(0,0,0,.3)", dataType:"Color", required:false, exposed:true}).render().value(),
          borderRadius: 0,
          visibility: "hidden",
          overflow: "visible"
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_container"
        }
      }).render();

      //////////////////////////////////////////////////////////
      // FRAME HIT AREAS //////////////////////////////////////
      //////////////////////////////////////////////////////////

      var f3_overlay_test_bs = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 999,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 0,

          backgroundImage: R.create("var").set({name:"f1_logo_img", defaultValue:"space_adventureclub_f3.png", dataType:"String", required:true, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",

        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_overlay_test_bs"
        }
      }).render();






      var f3_diamond_2_hit_area = R.create("div").set({
        css:{
          left: 560,
          top: -24,
          width: 163,
          height: 163,
          zIndex: 106,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_diamond_2_hit_area"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond_2_hit_area.element,{rotation:45});
        }
      });

      var f3_diamond_3_hit_area = R.create("div").set({
        css:{
          left: 682,
          top: 101,
          width: 163,
          height: 163,
          zIndex: 106,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_diamond_3_hit_area"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond_3_hit_area.element,{rotation:45});
        }
      });

      var f3_diamond_1_hit_area = R.create("div").set({
        css:{
          left: 525,
          top: 163,
          width: 130,
          height: 128,
          zIndex: 106,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          backgroundColor:"rgba(0,0,0,.3)",
          opacity: 0
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_diamond_1_hit_area"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond_1_hit_area.element,{rotation:45});
        }
      });

      var f3_diamond_4_hit_area = R.create("div").set({
        css:{
          left: 804,
          top: -5,
          width: 129,
          height: 129,
          zIndex: 106,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          backgroundColor:"rgba(0,0,0,.3)",
          opacity: 0
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_diamond_4_hit_area"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond_4_hit_area.element,{rotation:45});
        }
      });

      var f3_nav_hit_area = R.create("div").set({
        css:{
          left: 425,
          bottom: 3,
          width: 120,
          height: 20,
          zIndex: 354,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_nav_hit_area"
        }
      }).render();

      var f4_nav_hit_area = R.create("div").set({
        css:{
          left: 425,
          top: 3,
          width: 120,
          height: 20,
          zIndex: 106,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_nav_hit_area"
        }
      }).render();

      var f4_close_tab_hit_area = R.create("div").set({
        css:{
          left: 840,
          top: 10,
          width: 45,
          height: 45,
          zIndex: 145,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_card_container
        },
        attr:{
          id: "f4_close_tab_hit_area"
        }
      }).render();




      var f4_hotspot_1_hit_area = R.create("div").set({
        css:{
          top:92,
          left:338,
          width:45,
          height:45,
          zIndex:133,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_hotspot_1_hit_area"
        },
        data:{
          index: 1
        }
      }).render();

      var f4_hotspot_2_hit_area = R.create("div").set({
        css:{
          top:175,
          left:560,
          width:45,
          height:45,
          zIndex:133,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_hotspot_2_hit_area"
        },
        data:{
          index: 2
        }
      }).render();

      var f4_hotspot_3_hit_area = R.create("div").set({
        css:{
          top:74,
          left:768,
          width:45,
          height:45,
          zIndex:133,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_hotspot_3_hit_area"
        },
        data:{
          index: 3
        }
      }).render();


      //////////////////////////////////////////////////////////
      // FRAME 3 HIT AREAS /////////////////////////////////////
      //////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////
      // FRAME 1 CONTENT //////////////////////////////////////
      //////////////////////////////////////////////////////////

      var f1_logo_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_logo_img", defaultValue:"f1_logo_img.png", dataType:"String", required:true, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 999,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_logo_img"
        }
      }).render();

      var f1_cloud3_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_cloud3_img", defaultValue:"f1_cloud3_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 43,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_cloud3_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cloud3_img"
        }
      }).render();

      var f1_cloud2_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_cloud2_img", defaultValue:"f1_cloud2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 44,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_cloud2_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cloud2_img"
        }
      }).render();

      var f1_cloud1_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_cloud1_img", defaultValue:"f1_cloud1_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -20,
          width: 970,
          height: 250,
          zIndex: 43,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_cloud1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cloud1_img"
        }
      }).render();



      var markerContainer = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        attr:{
          id: "markerContainer"
        },
        rosetta:{
          parentNode:f1_container
        }
      }).render();

      var markerContainer_rotate = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        attr:{
          id: "markerContainer_rotate"
        },
        rosetta:{
          parentNode:markerContainer
        }
      }).render();

      var f1_marker_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_cta_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden"
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_marker_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_marker_text_img"
        }
      }).render();

      var f1_cta_buton_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_cta_button_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 41,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden"
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_cta_buton_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cta_buton_img"
        }
      }).render();

      var f1_cta_arrow_img1 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_cta_arrow_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden",
          opacity: .75
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_cta_arrow_img", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cta_arrow_img1"
        }
      }).render();

      var f1_cta_arrow_img2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_cta_arrow_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -9,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden",
          opacity: .5
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_cta_arrow_img", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cta_arrow_img2"
        }
      }).render();

      var f1_cta_arrow_img3 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_cta_arrow_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -18,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 42,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden",
          opacity: .25
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_cta_arrow_img", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_cta_arrow_img3"
        }
      }).render();

      var f1_marker_text_img_over = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_marker_text_img", defaultValue:"f1_marker_text_img_over.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 43,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          backfaceVisibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:markerContainer_rotate,
          tint: R.create("var").set({name:"f1_marker_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_marker_text_img_over"
        }
      }).render();
      /*

			var f1_marker_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_marker_img", defaultValue:"f1_marker_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 970,
					height: 250,
					zIndex: 41,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible"
				},
				rosetta:{
					parentNode:markerContainer_rotate,
					tint: R.create("var").set({name:"f1_marker_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_marker_img"
				}
			}).render();
*/



      // var f1_marker_img = R.create("svg_embed").set({
      //     attr: {
      //         // direct source for svg element
      //         src:"f1_arrowTop.svg",
      // 		id: "f1_marker_img"
      //     },
      //     css: {
      // 		left: 417,
      // 		top: 58,
      // 		width: 120,
      // 		height: 48,
      // 		zIndex: 41,
      // 		pointerEvents: "none",
      // 		cursor: "auto",
      // 		position: "absolute",
      // 		visibility: "visible",
      // 		backfaceVisibility: "hidden"
      //     },
      //     rosetta: {
      //         gID:"f1_arrowTop", // gID refers
      //         parentNode:markerContainer_rotate
      //     }
      // }).render({
      //     success:function() {
      // 		//MorphSVGPlugin.convertToPath("circle, rect, ellipse, line, polygon, polyline");
      //     	TweenMax.set("#leftArrow",{autoAlpha:0});
      //     	console.log("svg loaded");
      //     },
      //     fail:function() {
      //         console.log("svg failed")
      //     }
      // });


      // var f1_marker2_img = R.create("svg_embed").set({
      //     attr: {
      //         // direct source for svg element
      //         src:"f1_arrowBottom.svg",
      // 		id: "f1_marker_img2"
      //     },
      //     css: {
      // 		left: 417,
      // 		top: 58,
      // 		width: 120,
      // 		height: 48,
      // 		zIndex: 40,
      // 		pointerEvents: "none",
      // 		cursor: "auto",
      // 		position: "absolute",
      // 		visibility: "visible",
      // 		backfaceVisibility: "hidden"
      //     },
      //     rosetta: {
      //         gID:"f1_arroBottom", // gID refers
      //         parentNode:markerContainer_rotate
      //     }
      // }).render({
      //     success:function() {
      // 		//MorphSVGPlugin.convertToPath("circle, rect, ellipse, line, polygon, polyline");
      //     	TweenMax.set("#leftArrow2",{autoAlpha:0});
      //     	console.log("svg loaded");
      //     },
      //     fail:function() {
      //         console.log("svg failed")
      //     }
      // });



      /*
			var f1_marker2_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_marker2_img", defaultValue:"f1_marker2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: -1,
					top: 0,
					width: 970,
					height: 250,
					zIndex: 40,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible"
				},
				rosetta:{
					parentNode:markerContainer_rotate
				}
			}).render();


*/

      /*
	var f1_cta_img = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f1_cta_img", defaultValue:"f1_cta_img_1005.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 0,
					top: 0,
					width: 970,
					height: 250,
					zIndex: 36,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible"
				},
				rosetta:{
					parentNode:f1_container,
					tint: R.create("var").set({name:"f1_cta_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
				},
				attr:{
					id: "f1_cta_img"
				}
			}).render();
*/

      var f1_headline_a_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_headline_img", defaultValue:"f1_headline1_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 35,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_headline2_a_img"
        }
      }).render();

      var f1_headline_b_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_headline_img", defaultValue:"f1_headline2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 35,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_headline2_b_img"
        }
      }).render();

      var f1_subhead_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f1_headline_img", defaultValue:"f1_subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 35,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f1_container,
          tint: R.create("var").set({name:"f1_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f1_subhead_img"
        }
      }).render();


      //////////////////////////////////////
      // FRAME 1 SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      var spritesheetContainer = R.create("div").set({
        attr: {
          id: "spritesheet_container",
        },
        css: {
          left: 80,
          backgroundColor:"rgba(0,0,0,.1)",
          top: -23,
          width: 295,
          height: 304,
          zIndex: 4,
          //  directoryType:"size",
          skipServerResize:true
        },
        rosetta: {
          parentNode:f1_container,
        }
      }).render();

      var spritesheetImage2 = R.create("div").set({
        attr: {
          id: "spritesheet_img2",
        },
        css: {
          backgroundImage: "f1_sprite_loop_stabileCrop.jpg",
          left: -10,
          top: 0,
          width: 354,
          height: 304,
          zIndex: 4,
          //  directoryType:"size",
          skipServerResize:true,
          //opacity:.35
        },
        rosetta: {
          parentNode:spritesheetContainer,
        }
      }).render({
        success: function () {
          TweenMax.set(spritesheetImage2.element, {rotationY:'+=180'})
        }
      });


      var spritesheetData2 = R.create("dataloader").set({
        src: "f1_sprite_loop_stabileCrop.json",
        //directoryType:"size"
      }).render();

      var spritesheet2 = R.create("spritesheet").set({
        image:spritesheetImage2,
        data:spritesheetData2,
        frameRate: 15,
        loop: true,
        autoplay:true
      }).render();

      //////////////////////////////////////
      // FRAME 1 SPRITE END //////////////////////////////////////
      //////////////////////////////////////

      //////////////////////////////////////////////////////////
      // FRAME 1 CONTENT //////////////////////////////////////
      //////////////////////////////////////////////////////////






      //////////////////////////////////////////////////////////
      // FRAME 2 CONTENT //////////////////////////////////////
      //////////////////////////////////////////////////////////


      var F2_ground = R.create('div').set({
        attr:{
          id:'F2_ground'
        },
        css:{
          width:1248,
          height:1250,
          top:100,
          left:0,
          zIndex:211,
          backgroundImage:'f2_ground_3.png',
          backgroundSize:'contain',
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render()/* .setAttribute("data-depth", ".4") */;

      F2_ground.element.className = "layer";

//F2 MOUNTAINS//////////////////////////////////////////////

      var F2_mt2 = R.create('div').set({
        //left mountain
        attr:{
          id:'F2_mt2'
        },
        css:{
          width:1248,
          height:700,
          top:0,
          left:0,
          zIndex:206,
          backgroundImage:'f2_trees_left_f.png',
          backgroundSize:'contain',
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render().setAttribute("data-depth", "0.5");

      F2_mt2.element.className = "layer";

      var F2_mt3 = R.create('div').set({
        //right mountain
        attr:{
          id:'F2_mt3'
        },
        css:{
          width:1248,
          height:700,
          top:0,
          left:0,
          zIndex:210,
          backgroundImage:'f2_trees_right_trimmed.png',
          backgroundSize:'contain',
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render().setAttribute("data-depth", "0.5");

      F2_mt3.element.className = "layer";

      var F2_mt1 = R.create('div').set({
        //middle mt
        attr:{
          id:'F2_mt1'
        },
        css:{
          width:1248,
          height:481,
          top:0,
          left:0,
          zIndex:202,
          backgroundImage:"f2_mountains_mid_0124.png",
          backgroundSize:'cover',
          opacity:0
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render().setAttribute("data-depth", ".2");

      F2_mt1.element.className = "layer";


      var F2_mt4 = R.create('div').set({
        //back mt
        attr:{
          id:'F2_mt4'
        },
        css:{
          width:1248,
          height:481,
          top:0,
          left:0,
          zIndex:201,
          backgroundImage:"f2_mountains_back.png",
          backgroundSize:'cover',
          opacity:0
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render().setAttribute("data-depth", ".1");

      F2_mt4.element.className = "layer";



//F2 CLOUDS//////////////////////////////////////////////


      var F2_cloudBehindMt_1 = R.create('div').set({
        attr:{
          id:'F2_cloudBehindMt_1'
        },
        css:{
          width:1248,
          height:481,
          top:100,
          left:0,
          zIndex:205,
          backgroundImage:'f2_cloudBehindMt23.png',
          backgroundSize:'contain',
          opacity:0,
          visibility:"visible"
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render()

      var F2_cloudBehindMt_2 = R.create('div').set({
        attr:{
          id:'F2_cloudBehindMt_2'
        },
        css:{
          width:1248,
          height:481,
          top:100,
          left:0,
          zIndex:205,
          backgroundImage:'f2_cloudBehindMt23.png',
          backgroundSize:'contain',
          opacity:0,
          visibility:"visible"
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render()

//F2 HIT AREAS////////////////////////////////////////////

      var F2_lookUpHit = R.create('div').set({
        attr:{
          id:'F2_lookUpHit'
        },
        css:{
          width:210,
          height:80,
          top:0,
          left:380,
          zIndex:999,
          ///backgroundColor:"rgba(0,0,0,.3)",
          opacity:1,
          visibility:"visible",
          pointerEvents:"auto",
          cursor:"pointer"
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render();



      var F2_lookDownHit = R.create('div').set({
        attr:{
          id:'F2_lookDownHit'
        },
        css:{
          width:210,
          height:80,
          bottom:0,
          left:380,
          zIndex:999,
          //backgroundColor:"rgba(0,0,0,.3)",
          opacity:1,
          visibility:"visible",
          pointerEvents:"auto",
          cursor:"pointer"
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render();

//F2 GH ELEMENTS//////////////////////////////////////////////////////////


      var f2_social_container = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 299,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:stage,
        },
        attr:{
          id: "f2_social_container"
        }
      }).render();


      var f2_social_hit = R.create("div").set({
        css:{
          right: 0,
          top: 220,
          width: 30,
          height: 30,
          zIndex: 3150,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          //backgroundColor:"rgba(0,0,0,.3)",
          //opacity: 1
        },
        rosetta:{
          parentNode:f2_social_container
        },
        attr:{
          id: "f2_social_hit"
        }
      }).render();



      var f2_social_img_yt = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_yt", defaultValue:"social_yt_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right: 30,
          top:225,
          width: 19,
          height: 19,
          zIndex: 299,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible"
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_yt_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_yt"
        }
      }).render().on("click", adHit);

      var f2_social_img_yt_hover = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_yt", defaultValue:"social_yt_hover_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right: 30,
          top:225,
          width: 19,
          height: 19,
          zIndex: 300,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_yt_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_yt_hover"
        }
      }).render().on("click", adHit);

      var f2_social_img_ig = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_ig", defaultValue:"social_ig_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right:55,
          top: 225,
          width: 19,
          height: 19,
          zIndex: 299,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible"
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_ig_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_ig"
        }
      }).render().on("click", adHit);

      var f2_social_img_ig_hover = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_ig", defaultValue:"social_ig_hover_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right:55,
          top: 225,
          width: 19,
          height: 19,
          zIndex: 300,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_ig_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_ig_hover"
        }
      }).render().on("click", adHit);

      var f2_social_img_fb = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_fb", defaultValue:"social_fb_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right:80,
          top: 225,
          width: 19,
          height: 19,
          zIndex: 299,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible"
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_fb_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_fb"
        }
      }).render().on("click", adHit);

      var f2_social_img_fb_hover = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_social_img_fb", defaultValue:"social_fb_hover_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right:80,
          top: 225,
          width: 19,
          height: 19,
          zIndex: 300,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          opacity:0

        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f2_social_container,
          tint: R.create("var").set({name:"f2_social_img_fb_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_social_img_fb_hover"
        }
      }).render().on("click", adHit);

      var f2_nav_down_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_down_img", defaultValue:"f2_nav_materials_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_down_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_down_img"
        }
      }).render();

      var f2_nav_down_arrow_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_down_arrow_img", defaultValue:"f2_nav_arrows_bottom_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_down_arrow_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_down_arrow_img"
        }
      }).render();

      var f2_nav_down_arrow_img2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_down_arrow_img2", defaultValue:"f2_nav_arrows_bottom_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -4,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:.5
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_down_arrow_img2_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_down_arrow_img2"
        }
      }).render();

      var f2_nav_up_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_up_img", defaultValue:"f2_nav_tech_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_up_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_up_img"
        }
      }).render();

      var f2_nav_up_arrow_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_up_arrow_img", defaultValue:"f2_nav_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_up_arrow_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_up_arrow_img"
        }
      }).render();

      var f2_nav_up_arrow_img2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_up_arrow_img2", defaultValue:"f2_nav_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 4,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_up_arrow_img2_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_up_arrow_img2"
        }
      }).render();

      var f2_nav_back_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_back_img", defaultValue:"f2_nav_back_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_back_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_back_img"
        }
      }).render();

      var f2_nav_backArrow_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_backArrow_img", defaultValue:"f2_nav_back_arrow_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_backArrow_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_backArrow_img"
        }
      }).render();

      var f2_nav_backArrow_img2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_nav_backArrow_img2", defaultValue:"f2_nav_back_arrow_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 4,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:0
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_nav_backArrow_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_nav_backArrow_img2"
        }
      }).render();


      var f2_headline_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_headline_img", defaultValue:"f2_headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 290,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_headline_img"
        }
      }).render();

      var f2_subhead_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_subhead_img", defaultValue:"f2_subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 290,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible"
        },
        rosetta:{
          parentNode:f2_container,
          tint: R.create("var").set({name:"f2_subhead_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_subhead_img"
        }
      }).render();



      var F2_sky = R.create('div').set({
        attr:{
          id:'F2_sky'
        },
        css:{
          width:970,
          height:590,
          bottom:0,
          left:-10,
          zIndex:200,
          opacity:1,
          backgroundImage:'f2_bg_clouds_6.png',
          backgroundSize:'contain',
          overflow:"visible"
        },
        rosetta:{
          parentNode:f2_container
        }
      }).render();

      var f2_logo_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_logo_img", defaultValue:"f2_logo_img.png", dataType:"String", required:true, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 970,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 998,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          //opacity:0
        },
        rosetta:{
          parentNode:stage,
          tint: R.create("var").set({name:"f2_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_logo_img"
        }
      }).render();

      var f2_logo_img_white = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f2_logo_img_white", defaultValue:"f2_logo_img_white2.png", dataType:"String", required:true, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 970,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 999,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:stage,
          tint: R.create("var").set({name:"f2_logo_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f2_logo_img_white"
        }
      }).render();

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // FRAME 2 END ////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // FRAME 3 START //////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////

      var f3_diamond1_overlay_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond1_overlay_img", defaultValue:"f3_diamond1_overlay_img_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -30,
          top:-30,
          width: 186,
          height: 186,
          zIndex: 124,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f3_diamond_1_hit_area,
          tint: R.create("var").set({name:"f3_diamond1_overlay_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_diamond1_overlay_img"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond1_overlay_img.element,{rotation:-45});
        }
      });

      var f3_diamond1_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond1_img", defaultValue:"f3_diamond1_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -30,
          top:-30,
          width: 186,
          height: 186,
          zIndex: 107,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:1
        },
        rosetta:{
          parentNode:f3_diamond_1_hit_area,
          tint: R.create("var").set({name:"f3_diamond1_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_diamond1_img"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond1_img.element,{rotation:45});
        }
      });

      var f3_diamond2_container_main = R.create("div").set({
        css:{
          left: 532,
          top: -53,
          width: 225,
          height: 225,
          zIndex: 105,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container,
        },
        attr:{
          id: "f3_diamond2_container_main"
        }
      }).render();

      var f3_diamond2_container = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 105,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_diamond2_container_main,
        },
        attr:{
          id: "f3_diamond2_container"
        }
      }).render();

      var f3_diamond2_overlay_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond2_overlay_img", defaultValue:"f3_diamond2_overlay_img_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 92,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          overflow:'hidden',
          opacity: 1
        },
        rosetta:{
          parentNode:f3_diamond2_container,
        },
        attr:{
          id: "f3_diamond2_overlay_img"
        }
      }).render();

      var f3_diamond2_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond2_img", defaultValue:"f3_diamond2_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 93,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          overflow:'hidden',
          opacity: 1
        },
        rosetta:{
          parentNode:f3_diamond2_container,
        },
        attr:{
          id: "f3_diamond2_img"
        }
      }).render();

      var f3_diamond3_container_main = R.create("div").set({
        css:{
          left: 656,
          top: 69,
          width: 225,
          height: 225,
          zIndex: 105,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container,
        },
        attr:{
          id: "f3_diamond3_container_main"
        }
      }).render();

      var f3_diamond3_container = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 105,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_diamond3_container_main,
        },
        attr:{
          id: "f3_diamond3_container"
        }
      }).render();

      var f3_diamond3_overlay_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond3_overlay_img", defaultValue:"f3_diamond3_overlay_img_cropped.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 91,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:1
        },
        rosetta:{
          parentNode:f3_diamond3_container
        },
        attr:{
          id: "f3_diamond3_overlay_img"
        }
      }).render();

      var f3_diamond3_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond3_img", defaultValue:"f3_diamond3_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 225,
          height: 225,
          zIndex: 80,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:1
        },
        rosetta:{
          parentNode:f3_diamond3_container
        },
        attr:{
          id: "f3_diamond3_img"
        }
      }).render();

      var f3_diamond4_overlay_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond4_overlay_img", defaultValue:"f3_diamond4_overlay_img_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -30,
          top:-30,
          width: 186,
          height: 186,
          zIndex: 67,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f3_diamond_4_hit_area,
          tint: R.create("var").set({name:"f3_diamond4_overlay_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_diamond4_overlay_img"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond4_overlay_img.element,{rotation:-45});
        }
      });

      var f3_diamond4_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_diamond4_img", defaultValue:"f3_diamond4_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -30,
          top:-30,
          width: 186,
          height: 186,
          zIndex: 66,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f3_diamond_4_hit_area,
          tint: R.create("var").set({name:"f3_diamond4_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_diamond4_img"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_diamond4_img.element,{rotation:-45});
        }
      });

      var f3_copy_block_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_copy_block_img", defaultValue:"f3_copy_block_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -250,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 51,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f3_container,
          tint: R.create("var").set({name:"f3_copy_block_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_copy_block_img"
        }
      }).render();

      var f3_line_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_line_img", defaultValue:"f3_line_img_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 50,
          width: 74,
          height: 74,
          zIndex: 57,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f3_copy_block_img,
          tint: R.create("var").set({name:"f3_line_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_line_img"
        }
      }).render();

      var f3_headline_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_headline_img", defaultValue:"f3_headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 10,
          width: 970,
          height: 250,
          zIndex: 56,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f3_copy_block_img,
          tint: R.create("var").set({name:"f3_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_headline_img"
        }
      }).render();

      var f3_subhead_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_subhead_img", defaultValue:"f3_subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 10,
          width: 970,
          height: 250,
          zIndex: 55,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f3_copy_block_img,
          tint: R.create("var").set({name:"f3_subhead_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_subhead_img"
        }
      }).render();

      var f3_cta_text = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_cta_text", defaultValue:"f3_cta_text_3.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 10,
          width: 970,
          height: 250,
          zIndex: 54,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0,
          display:"none"
        },
        rosetta:{
          parentNode:f3_copy_block_img,
        },
        attr:{
          id: "f3_cta_text"
        }
      }).render();


      var f3_hit_area = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 190,
          height: 250,
          zIndex: 66,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          //backgroundColor:"rgba(0,0,0,.3)",
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        rosetta:{
          parentNode:f3_copy_block_img
        },
        attr:{
          id: "f3_hit_area"
        }
      }).render().on("click", adHit);

      var f3_nav_back_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_nav_back_img", defaultValue:"f3_nav_back_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 348,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f3_container,
        },
        attr:{
          id: "f3_nav_back_img"
        }
      }).render();

      var f3_nav_back_arrow_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_nav_back_arrow_img", defaultValue:"f4_nav_back_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:.5
        },
        rosetta:{
          parentNode:f3_container,
        },
        attr:{
          id: "f3_nav_back_arrow_img"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_nav_back_arrow_img.element,{rotation:180});
        }
      });

      var f3_nav_back_arrow_img_2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_nav_back_arrow_img_2", defaultValue:"f4_nav_back_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -4,
          width: 970,
          height: 250,
          zIndex: 349,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:.5
        },
        rosetta:{
          parentNode:f3_container,
        },
        attr:{
          id: "f3_nav_back_arrow_img_2"
        }
      }).render({
        success:function() {
          TweenMax.set(f3_nav_back_arrow_img_2.element,{rotation:180});
        }
      });

      var f3_bg_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_bg_img", defaultValue:"f3_bg_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 37,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f3_container,
          tint: R.create("var").set({name:"f3_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_bg_img"
        }
      }).render();


      /*
	var f3_transition_cloud_10 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f3_transition_cloud_10", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 200,
					top: -400,
					width: 600,
					height: 245,
					zIndex: 337,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible",
					opacity:.7
				},
				rosetta:{
					parentNode:f2_container
				},
				attr:{
					id: "f3_transition_cloud_10"
				}
			}).render();

			var f3_transition_cloud_9 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f3_transition_cloud_9", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 200,
					top: -400,
					width: 600,
					height: 245,
					zIndex: 337,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible",
					opacity:.4
				},
				rosetta:{
					parentNode:f2_container
				},
				attr:{
					id: "f3_transition_cloud_9"
				}
			}).render();

			var f3_transition_cloud_8 = R.create("div").set({
				css:{
					backgroundImage: R.create("var").set({name:"f3_transition_cloud_8", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
					backgroundSize: "contain",
					backgroundPosition: "center center",
					left: 200,
					top: -400,
					width: 600,
					height: 245,
					zIndex: 337,
					pointerEvents: "none",
					cursor: "auto",
					position: "absolute",
					visibility: "visible",
					opacity:.5
				},
				rosetta:{
					parentNode:f2_container
				},
				attr:{
					id: "f3_transition_cloud_8"
				}
			}).render();
*/

      var f3_transition_cloud_7 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_7", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 200,
          top: -400,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:.6
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_7"
        }
      }).render();

      var f3_transition_cloud_6 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_6", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 200,
          top: -400,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:.8
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_6"
        }
      }).render();

      var f3_transition_cloud_5 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_5", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 200,
          top: -400,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_5"
        }
      }).render();

      var f3_transition_cloud_4 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_4", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -200,
          top: -600,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_4"
        }
      }).render();


      var f3_transition_cloud_3 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_3", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 500,
          top: -600,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_3"
        }
      }).render();



      var f3_transition_cloud_2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_2", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 550,
          top: -250,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_2"
        }
      }).render();


      var f3_transition_cloud_1 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_cloud_1", defaultValue:"f3_transition_cloud.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -260,
          width: 600,
          height: 245,
          zIndex: 337,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "visible",
          opacity:1
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_cloud_1"
        }
      }).render();


      var f3_transition_sky_1 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_transition_sky_1", defaultValue:"sky_middle.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          right: 0,
          top: -752,
          width: 970,
          height: 750,
          zIndex: 12,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f3_transition_sky_1"
        }
      }).render();

      //////////////////////////////////////////////////////////
      // VIDEO PLAYER //////////////////////////////////////////
      //////////////////////////////////////////////////////////

      var f3_video_hit_area = R.create("div").set({
        css:{
          left: 257,
          top: -5,
          width: 265,
          height: 260,
          zIndex: 64,
          pointerEvents: "none",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
          //opacity: 1
        },
        rosetta:{
          parentNode:f3_container
        },
        attr:{
          id: "f3_video_hit_area"
        }
      }).render();


      var f3_video_overlay_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_video_overlay_img", defaultValue:"f3_video_poster_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 175,
          top: 0,
          width: 444,
          height: 312,
          zIndex: 64,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f3_container,
          tint: R.create("var").set({name:"f3_video_overlay_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f3_video_overlay_img"
        }
      }).render();

      var videoPlayer = R.create("video-player").set({
        left:167,
        top:0,
        width:444,
        height:250,
        position:"absolute",
        zIndex:35,
        src:{
          mp4:"f3_video.mp4",
        },

        parentNode:f3_container,
        autoplay:false,
        muteOnStart:true,
        allowFullscreen:true,
        loop:false,
        // /*Custom Cue Points*/cuePoints:[{percent:.1, label:"tenth"}, {percent:.65}, {time:"0:02"}, {percent:.25, label:"same as 25"}].
        allowScrubbing:false,
        pointerEvents: "none",
        cursor: "auto",
        opacity:0,
      }).render();


      //////////////////////////////////////////////////////////
      // F3 VIDEO PLAYER ///////////////////////////////////////
      //////////////////////////////////////////////////////////


      ///////////////////////////////////////////////////////////////////////////////////////////////
      // FRAME 3 END ////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////


      ///////////////////////////////////////////////////////////////////////////////////////////////
      // FRAME 4 START //////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////

      var f4_copy_block_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_copy_block_img", defaultValue:"f4_copy_block_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: -250,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 250,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_container
        },
        attr:{
          id: "f4_copy_block_img"
        }
      }).render();


      var f4_hit_area = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 190,
          height: 250,
          zIndex: 66,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          //backgroundColor:"rgba(0,0,0,.3)",
        },
        rosetta:{
          parentNode:f4_copy_block_img
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        attr:{
          id: "f4_hit_area"
        }
      }).render().on("click", adHit);

      var f4_headline_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_headline_img", defaultValue:"f4_headline_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -10,
          width: 970,
          height: 250,
          zIndex: 251,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_copy_block_img,
          tint: R.create("var").set({name:"f4_headline_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_headline_img"
        }
      }).render();

      var f4_subhead_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_subhead_img", defaultValue:"f4_subhead_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -10,
          width: 970,
          height: 250,
          zIndex: 251,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_copy_block_img,
          tint: R.create("var").set({name:"f4_subhead_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_subhead_img"
        }
      }).render();

      var f4_line_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_line_img", defaultValue:"f3_line_img_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 40,
          width: 74,
          height: 74,
          zIndex: 251,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_copy_block_img,
          tint: R.create("var").set({name:"f4_line_img_tint", defaultValue:"#c1d7bb", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_line_img"
        }
      }).render();

      var f4_hotspot1_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hotspot1_img", defaultValue:"f4_hotspot.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          top:92,
          left:338,
          width:50,
          height:50,
          zIndex:133,
          pointerEvents:"none",
          cursor:"pointer",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_hotspot1_img"
        },
        data:{
          hitIndex: 1
        }
      }).render();

      var f4_hotspot2_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hotspot2_img", defaultValue:"f4_hotspot.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          top:175,
          left:560,
          width:50,
          height:50,
          zIndex:133,
          pointerEvents:"none",
          cursor:"pointer",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_hotspot2_img"
        },
        data:{
          index: 2
        }
      }).render();

      var f4_hotspot3_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hotspot3_img", defaultValue:"f4_hotspot.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          top:74,
          left:768,
          width:50,
          height:50,
          zIndex:133,
          pointerEvents:"none",
          cursor:"pointer",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_hotspot3_img"
        },
        data:{
          index: 3
        }
      }).render();



      var f4_nav_back_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_nav_back_img", defaultValue:"f4_nav_back_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 51,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_nav_back_img"
        }
      }).render();

      var f4_nav_back_arrow_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_nav_back_arrow_img", defaultValue:"f4_nav_back_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 350,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_nav_back_arrow_img"
        }
      }).render();

      var f4_nav_back_arrow_img2 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f3_nav_back_arrow_img_2", defaultValue:"f4_nav_back_arrows_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 4,
          width: 970,
          height: 250,
          zIndex: 349,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_container,
        },
        attr:{
          id: "f4_nav_back_arrow_img2"
        }
      }).render();

      //////////////////////////////////////////////////////////
      // FRAME 4 IMAGES ////////////////////////////////////////
      //////////////////////////////////////////////////////////

      var f4_plastic_bg_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_plastic_bg_img", defaultValue:"f4_plastic_bg_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 38,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_container,
          tint: R.create("var").set({name:"f4_plastic_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_plastic_bg_img"
        }
      }).render();

      var f4_down_bg_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_bg_img", defaultValue:"f4_down_bg_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -20,
          width: 970,
          height: 250,
          zIndex: 45,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_container,
          tint: R.create("var").set({name:"f4_down_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_bg_img"
        }
      }).render();

      var f4_hemp_bg_img_1 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_bg_img_1", defaultValue:"f4_hemp_bg_img_uncropped.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 20,
          bottom: -50,
          width: 474,
          height: 482,
          zIndex: 44,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_container,
          tint: R.create("var").set({name:"f4_hemp_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_bg_img_1"
        }
      }).render();

      var f4_bg_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_bg_img", defaultValue:"f4_bg_img_3.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 36,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_container,
          tint: R.create("var").set({name:"f4_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_bg_img"
        }
      }).render();

      var f4_transition_bg = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_bg_img", defaultValue:"f4_bg_img_3_2.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: -220,
          width: 970,
          height: 250,
          zIndex: 36,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 1
        },
        rosetta:{
          parentNode:f4_container,
          tint: R.create("var").set({name:"f4_bg_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_transition_bg"
        }
      }).render({
        success:function() {
          TweenMax.set(f4_transition_bg.element,{rotation:180});
        }
      });

      //////////////////////////////////////////////////////////
      // FRAME 4 CARD //////////////////////////////////////////
      //////////////////////////////////////////////////////////

      var f4_infocard_tab_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_infocard_tab_img", defaultValue:"f4_infocard_tab_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 115,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_infocard_tab_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_infocard_tab_img"
        }
      }).render();

      var f4_infocard_fold_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_infocard_fold_img", defaultValue:"f4_infocard_fold_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 116,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_infocard_fold_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_infocard_fold_img"
        }
      }).render();

      var f4_infocard_base_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_infocard_base_img", defaultValue:"f4_infocard_base_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 9,
          width: 970,
          height: 250,
          zIndex: 119,
          pointerEvents: "auto",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_infocard_base_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_infocard_base_img"
        }
      }).render();

      var f4_infocard_line_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_infocard_line_img", defaultValue:"f4_infocard_line_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 119,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_infocard_line_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_infocard_line_img"
        }
      }).render();

      var f4_infocard_close_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_infocard_line_img", defaultValue:"f4_infocard_close_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 119,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_infocard_close_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_infocard_close_img"
        }
      }).render();

      var f4_cotton_label_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_cotton_label_img", defaultValue:"f4_plastic_label_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 136,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_cotton_label_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_cotton_label_img"
        }
      }).render();



      var f4_cotton_icon_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_cotton_icon_img", defaultValue:"f4_plastic_icon_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 170,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_cotton_icon_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_cotton_icon_img"
        }
      }).render();

      var f4_cotton_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_cotton_text_img", defaultValue:"f4_plastic_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 125,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_cotton_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_cotton_text_img"
        }
      }).render();

      var f4_plastic_stat_number_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_plastic_stat_number_img", defaultValue:"f4_plastic_stat_number_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 127,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity:0
        },
        rosetta:{
          parentNode:f4_card_container,
        },
        attr:{
          id: "f4_plastic_stat_number_img"
        }
      }).render();

      var f4_cotton_stat_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_cotton_stat_text_img", defaultValue:"f4_plastic_stat_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 126,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_cotton_stat_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_cotton_stat_text_img"
        }
      }).render();

      var f4_down_label_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_label_img", defaultValue:"f4_down_label_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 155,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_down_label_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_label_img"
        }
      }).render();

      ///////////////////////////////////////////////////
      // DOWN NUMBER COUNT VARS ///////////////////////
      ///////////////////////////////////////////////////



      var f4_down_stat_number_10 = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_stat_number_10", defaultValue:"f4_down_stat_number_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 154,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden",
          opacity: 0
        },
        rosetta:{
          parentNode:f4_card_container,
        },
        attr:{
          id: "f4_down_stat_number_10"
        }
      }).render();

      ///////////////////////////////////////////////////
      // DOWN NUMBER COUNT VARS ///////////////////////
      ///////////////////////////////////////////////////


      var f4_down_stat_redcircle_img = R.create("div").set({
        css:{
          left: 758,
          top: 50,
          width: 970,
          height: 250,
          zIndex: 153,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_down_stat_redcircle_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_stat_redcircle_img"
        }
      }).render();


      f4_down_stat_redcircle_img.innerHTML += '<svg id="percentCircle" width="100" height="100"><circle id="circle" cx="47" cy="47" r="38" stroke="#f27177" stroke-width="6" fill="#fff5f6" /></svg>';



      var f4_down_stat_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_stat_text_img", defaultValue:"f4_down_stat_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 149,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_down_stat_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_stat_text_img"
        }
      }).render();

      var f4_down_icon_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_icon_img", defaultValue:"f4_down_icon_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 148,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_down_icon_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_icon_img"
        }
      }).render();

      var f4_down_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_down_text_img", defaultValue:"f4_down_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 142,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_down_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_down_text_img"
        }
      }).render();

      var f4_hemp_icon_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_icon_img", defaultValue:"f4_hemp_icon_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 170,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_hemp_icon_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_icon_img"
        }
      }).render();

      var f4_hemp_label_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_label_img", defaultValue:"f4_hemp_label_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 164,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_hemp_label_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_label_img"
        }
      }).render();


      var f4_hemp_stat_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_stat_text_img", defaultValue:"f4_hemp_stat_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 162,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_hemp_stat_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_stat_text_img"
        }
      }).render();

      var f4_hemp_text_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_text_img", defaultValue:"f4_hemp_text_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 161,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_hemp_text_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_text_img"
        }
      }).render();

      var f4_hemp_stat_number_img = R.create("div").set({
        css:{
          backgroundImage: R.create("var").set({name:"f4_hemp_stat_number_img", defaultValue:"f4_hemp_stat_number_img.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 161,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta:{
          parentNode:f4_card_container,
          tint: R.create("var").set({name:"f4_hemp_stat_number_img_tint", defaultValue:"", dataType:"Color", required:false, exposed:true}).render().value()
        },
        attr:{
          id: "f4_hemp_stat_number_img"
        }
      }).render();

      var scrubber_ctn = R.create('div').set({
        attr:{
          id:"scrubber_ctn"
        },
        css:{
          width:112,
          height:20,
          top:208,
          left:367,
          zIndex:130,
          pointerEvents:'none',
          //backgroundColor:"rgba(0,0,0,.3)",
        },
        rosetta:{
          parentNode:f4_card_container
        }
      }).render();

      var scrubber_bar = R.create('div').set({
        attr:{
          id:"scrubber_bar"
        },
        css:{
          width:112,
          height:1,
          background:"#5dc5c6",
          top:10,
          zIndex:122,
          // left:68
        },
        rosetta:{
          parentNode:scrubber_ctn
        }
      }).render();

      var progress_bar = R.create('div').set({
        attr:{
          id:"progress_bar"
        },
        css:{
          width:5,
          height:1,
          background:"#ffffff",
          top:10,
          zIndex:123,
          // left:68
        },
        rosetta:{
          parentNode:scrubber_ctn
        }
      }).render();



      //////////////////////////////////////
      // FRAME 4 BACKPACK SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      var backpack_Container = R.create("div").set({
        attr: {
          id: "backpack_Container",
        },
        css: {
          //backgroundColor:"rgba(0,0,0,.3)",
          left: 321,
          top: 17,
          width: 201,
          height: 201,
          zIndex: 123,
          skipServerResize:true
        },
        rosetta: {
          parentNode:f4_card_container,
        }
      }).render();

      var backpack_sprite_img = R.create("div").set({
        attr: {
          id: "backpack_sprite_img",
        },
        css: {
          backgroundImage: "backpack_sprite_v2.png",
          top: 0,
          width: 159,
          height: 201,
          zIndex: 121,
          left: 21,
          skipServerResize:true,
          //opacity:.35
        },
        rosetta: {
          parentNode:backpack_Container,
        }
      }).render({
        success: function () {
          TweenMax.set(spritesheetImage2.element, {})
        }
      });


      var backpack_sprite_data = R.create("dataloader").set({
        src: "backpack_sprite_v2.json",
        //directoryType:"size"
      }).render();

      var backpack_spritesheet = R.create("spritesheet").set({
        image:backpack_sprite_img,
        data:backpack_sprite_data,
        frameRate: 18,
        loop: false,
        autoplay:false
      }).render();


      var backpack_scrubber_handle = R.create('div').set({
        attr:{
          id:"backpack_scrubber_handle"
        },
        css:{
          width:15,
          height:15,
          borderRadius:"50%",
          background:"#ffffff",
          top:2,
          left:5,
          pointerEvents:"none",
          opacity:0,
          zIndex: 124,
        },
        rosetta:{
          parentNode:scrubber_ctn
        }
      }).render();

      //////////////////////////////////////
      // FRAME 4 BACKPACK SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      //////////////////////////////////////
      // FRAME 4 JACKET SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      var jacket_Container = R.create("div").set({
        attr: {
          id: "jacket_Container",
        },
        css: {
          //backgroundColor:"rgba(0,0,0,.3)",
          left: 321,
          top: 13,
          width: 201,
          height: 201,
          zIndex: 123,
          skipServerResize:true
        },
        rosetta: {
          parentNode:f4_card_container,
        }
      }).render();

      var jacket_sprite_img = R.create("div").set({
        attr: {
          id: "jacket_sprite_img",
        },
        css: {
          backgroundImage: "jacket_sprite_v2.png",
          top: 0,
          width: 201,
          height: 201,
          zIndex: 121,
          left: 0,
          skipServerResize:true,
          //opacity:.35
        },
        rosetta: {
          parentNode:jacket_Container,
        }
      }).render({
        success: function () {
          TweenMax.set(spritesheetImage2.element, {})
        }
      });


      var jacket_sprite_data = R.create("dataloader").set({
        src: "jacket_sprite_v2.json",
        //directoryType:"size"
      }).render();

      var jacket_spritesheet = R.create("spritesheet").set({
        image:jacket_sprite_img,
        data:jacket_sprite_data,
        frameRate: 18,
        loop: false,
        autoplay:false
      }).render();


      var jacket_scrubber_handle = R.create('div').set({
        attr:{
          id:"jacket_scrubber_handle"
        },
        css:{
          width:15,
          height:15,
          borderRadius:"50%",
          background:"#ffffff",
          top:2,
          left:5,
          pointerEvents:"none",
          opacity:0,
          zIndex: 124,
        },
        rosetta:{
          parentNode:scrubber_ctn
        }
      }).render();

      //////////////////////////////////////
      // FRAME 4 JACKET SPRITE END //////////////////////////////////////
      //////////////////////////////////////

      //////////////////////////////////////
      // FRAME 4 SHIRT SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      var shirt_Container = R.create("div").set({
        attr: {
          id: "shirt_Container",
        },
        css: {
          //backgroundColor:"rgba(0,0,0,.3)",
          left: 321,
          top: 13,
          width: 201,
          height: 201,
          zIndex: 123,
          skipServerResize:true
        },
        rosetta: {
          parentNode:f4_card_container,
        }
      }).render();

      var shirt_sprite_img = R.create("div").set({
        attr: {
          id: "shirt_sprite_img",
        },
        css: {
          backgroundImage: "shirt_sprite_v2.png",
          top: 0,
          width: 201,
          height: 201,
          zIndex: 121,
          left: 0,
          skipServerResize:true,
          //opacity:.35
        },
        rosetta: {
          parentNode:shirt_Container,
        }
      }).render({
        success: function () {
          TweenMax.set(spritesheetImage2.element, {})
        }
      });


      var shirt_sprite_data = R.create("dataloader").set({
        src: "shirt_sprite_v2.json",
        //directoryType:"size"
      }).render();

      var shirt_spritesheet = R.create("spritesheet").set({
        image:shirt_sprite_img,
        data:shirt_sprite_data,
        frameRate: 18,
        loop: false,
        autoplay:false,
        zIndex: 123,
      }).render();


      var shirt_scrubber_handle = R.create('div').set({
        attr:{
          id:"shirt_scrubber_handle"
        },
        css:{
          width:15,
          height:15,
          borderRadius:"50%",
          background:"#ffffff",
          top:2,
          left:5,
          pointerEvents:"none",
          opacity:0,
          zIndex: 124,
        },
        rosetta:{
          parentNode:scrubber_ctn
        }
      }).render();

      //////////////////////////////////////
      // FRAME 4 SHIRT SPRITE END //////////////////////////////////////
      //////////////////////////////////////

      //////////////////////////////////////
      // FRAME 4 HAMMER HANDLERS SPRITE START //////////////////////////////////////
      //////////////////////////////////////

      var allSpriteScrubberHandles = [backpack_scrubber_handle, jacket_scrubber_handle, shirt_scrubber_handle];
      var allSpriteSheets = [backpack_spritesheet, jacket_spritesheet, shirt_spritesheet];

      for(var i=0; i < allSpriteScrubberHandles.length; i++){
        allSpriteScrubberHandles[i].pointerEvents = "auto";
        allSpriteScrubberHandles[i].cursor = "pointer";
        allSpriteScrubberHandles[i].cursor = "hand";
        allSpriteScrubberHandles[i].cursor = "grab";
        allSpriteScrubberHandles[i].cursor = "-moz-grab";
        allSpriteScrubberHandles[i].cursor = "-webkit-grab";

        allSpriteScrubberHandles[0].on("mouseover", function(){
          TweenMax.to(allSpriteScrubberHandles[0].element, .25, {scale:1.3, yoyo:true, repeat:-1,  ease: "Power4.easeOut"});
          allSpriteScrubberHandles[0].on("mouseout", function(){
            TweenMax.to(allSpriteScrubberHandles[0].element, .5, {scale:1, ease: "Power4.easeOut"});
          })
        })

        allSpriteScrubberHandles[1].on("mouseover", function(){
          TweenMax.to(allSpriteScrubberHandles[1].element, .25, {scale:1.3, yoyo:true, repeat:-1,  ease: "Power4.easeOut"});
          allSpriteScrubberHandles[1].on("mouseout", function(){
            TweenMax.to(allSpriteScrubberHandles[1].element, .5, {scale:1, ease: "Power4.easeOut"});
          })
        })

        allSpriteScrubberHandles[2].on("mouseover", function(){
          TweenMax.to(allSpriteScrubberHandles[2].element, .25, {scale:1.3, yoyo:true, repeat:-1,  ease: "Power4.easeOut"});
          allSpriteScrubberHandles[2].on("mouseout", function(){
            TweenMax.to(allSpriteScrubberHandles[2].element, .5, {scale:1, ease: "Power4.easeOut"});
          })
        })
      }

      var tl = new TimelineMax();
      var startScrubX;

      var scrubberHammer3 = new Hammer(allSpriteScrubberHandles[0].element);
      scrubberHammer3.get('pan').set({direction:Hammer.DIRECTION_HORIZONTAL, threshold:0});
      scrubberHammer3.on('panstart', onScrubStart)
        .on('panleft panright', onScrub)
        .on('panend', onScrubEnd);

      var scrubberHammer2 = new Hammer(allSpriteScrubberHandles[1].element);
      scrubberHammer2.get('pan').set({direction:Hammer.DIRECTION_HORIZONTAL, threshold:0});
      scrubberHammer2.on('panstart', onScrubStart)
        .on('panleft panright', onScrub)
        .on('panend', onScrubEnd);

      var scrubberHammer1 = new Hammer(allSpriteScrubberHandles[2].element);
      scrubberHammer1.get('pan').set({direction:Hammer.DIRECTION_HORIZONTAL, threshold:0});
      scrubberHammer1.on('panstart', onScrubStart)
        .on('panleft panright', onScrub)
        .on('panend', onScrubEnd);


      var trackWidth = parseFloat(scrubber_bar.width) - parseFloat(backpack_scrubber_handle.width) - 5;
      var dist;
      function onScrubStart(e) {
        if (startScrubX === null || startScrubX === undefined) {
          for(i = 0; i< allSpriteScrubberHandles.length; i++){
            allSpriteScrubberHandles[i].cursor = "grabbing";
            allSpriteScrubberHandles[i].cursor = "-moz-grabbing";
            allSpriteScrubberHandles[i].cursor = "-webkit-grabbing";
            startScrubX = parseFloat(allSpriteScrubberHandles[i].left + dist);
            console.log("onScrubStart",startScrubX)
            console.log("(backpack_scrubber_handle.left",allSpriteScrubberHandles[i].left)
          }
        }
      }

      function onScrub(e) {
        if (startScrubX !== null && startScrubX !== undefined) {
          for(i = 0; i< allSpriteScrubberHandles.length; i++) {
            var seekTo = (parseFloat(allSpriteScrubberHandles[i].left) / (trackWidth));

            dist = e.distance;
            if (e.offsetDirection == Hammer.DIRECTION_LEFT) {
              dist *= -1;
              allSpriteSheets[i].seek(seekTo-.05);
            }else{
              allSpriteSheets[i].seek(seekTo);
            }

            allSpriteScrubberHandles[i].left = startScrubX + dist;

            progress_bar.width = startScrubX + dist + 2;

            //console.log("onScrub",startScrubX)

            TweenMax.to(allSpriteScrubberHandles[0].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1.3, force3D:false});
            TweenMax.to(allSpriteScrubberHandles[1].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1.3, force3D:false});
            TweenMax.to(allSpriteScrubberHandles[2].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1.3, force3D:false});

            if (parseFloat(allSpriteScrubberHandles[i].left) < 5) {
              allSpriteScrubberHandles[i].left = 5;
              progress_bar.width = 5;
            } else if (parseFloat(allSpriteScrubberHandles[i].left) > trackWidth) {
              allSpriteScrubberHandles[i].left = trackWidth;
              progress_bar.width = 92;
            }

            //console.log("seekTo",seekTo)
          }
        }
      }

      function onScrubEnd(e) {
        if (startScrubX !== null || startScrubX !== undefined) {
          startScrubX = null;
          for(i = 0; i< allSpriteScrubberHandles.length; i++) {
            allSpriteScrubberHandles[i].cursor = "grab";
            allSpriteScrubberHandles[i].cursor = "-moz-grab";
            allSpriteScrubberHandles[i].cursor = "-webkit-grab";

            TweenMax.to(allSpriteScrubberHandles[0].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1, force3D:false});
            TweenMax.to(allSpriteScrubberHandles[1].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1, force3D:false});
            TweenMax.to(allSpriteScrubberHandles[2].element,.25,{ease: 'Back.easeOut', easeParams:[8], scale:1, force3D:false});

            //console.log("onScrubEnd",startScrubX)

          }
        }
      }

      var hotSpotActive = false;

      function startTheShow(handler, sprite){
        for(var i=0; i < allSpriteScrubberHandles.length; i++) {
          allSpriteScrubberHandles[i].pointerEvents = "none";
        }
        //dist = 92;
        var seekTo = (parseFloat(handler.left) / trackWidth);
        var duration = (1.25 * (1 - seekTo));
        if(seekTo > 0.89){
          duration = .5;
        }
        TweenMax.to(handler.element,duration,{left:trackWidth, ease:"Linear.easeNone", delay:3,
          onUpdate:function(){
            seekTo = (parseFloat(handler.left) / trackWidth);
            sprite.seek(seekTo);
            progress_bar.width = parseFloat(handler.left);
          },
          onComplete:function(){
            TweenMax.to(handler.element,duration,{left:5, ease:"Linear.easeNone", delay:.15,
              onUpdate:function(){
                var seekTo = (parseFloat(handler.left) / trackWidth);
                sprite.seek(seekTo-.05);
                progress_bar.width = parseFloat(handler.left);
              }, onComplete:function(){
                for(var i=0; i < allSpriteScrubberHandles.length; i++) {
                  allSpriteScrubberHandles[i].pointerEvents = "auto";
                }
              }
            })
          }
        })


      }

      function openFrame4Hotspot(e){
        var inst = R.get(e.target);

        hotSpotActive = true;

        //console.log(inst.data.index)
        var hotspotValue = inst.data.index;

        if(hotspotValue === 1){
          //HEMP
          open_Frame4Hotspot.play();
          TweenMax.staggerTo(all_hemp_card_Arr,1,{autoAlpha:1, y:0, ease:"Back.easeOut", delay:.5},.15)
          startTheShow(shirt_scrubber_handle, shirt_spritesheet);

        }else if(hotspotValue === 2){
          //FEATHER
          open_Frame4Hotspot.play();
          TweenMax.staggerTo(all_down_card_Arr,1,{autoAlpha:1, y:0, ease:"Back.easeOut", delay:.5},.15)
          startTheShow(jacket_scrubber_handle, jacket_spritesheet);
          downCard.play()

        }else{
          //PLASTIC
          open_Frame4Hotspot.play();
          TweenMax.staggerTo(all_cotton_card_Arr,1,{autoAlpha:1, y:0, ease:"Back.easeOut", delay:.5},.15)
          startTheShow(backpack_scrubber_handle, backpack_spritesheet);
        }
      }

      function closeFrame4Hotspot(){
        hotSpotActive = false;
        downCard.reverse(.7)
        open_Frame4Hotspot.reverse(.98);
        TweenMax.delayedCall(.2,resetProducts);


        all_cotton_card_Arr.forEach(function(el){
          TweenMax.to(el,.5,{autoAlpha:0, y:10, ease:"Back.easeOut"})
        })

        all_down_card_Arr.forEach(function(el){
          TweenMax.to(el,.5,{autoAlpha:0, y:10, ease:"Back.easeOut"})
        })

        all_hemp_card_Arr.forEach(function(el){
          TweenMax.to(el,.5,{autoAlpha:0, y:10, ease:"Back.easeOut"})
        })

        function resetProducts(){
          dist = null;
          progress_bar.width = 5;
          backpack_spritesheet.seek(0);
          backpack_scrubber_handle.left=5;

          jacket_spritesheet.seek(0);
          jacket_scrubber_handle.left=5;

          shirt_spritesheet.seek(0);
          shirt_scrubber_handle.left=5;
        }
      }

      //////////////////////////////////////
      // FRAME 4 HAMMER HANDLERS SPRITE END //////////////////////////////////////
      //////////////////////////////////////

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // FRAME 4 END ////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////



      //////////////////////////////////////////////////////////
      // ANIMATION / UI FUNCTIONS //////////////////////////////
      //////////////////////////////////////////////////////////

      function mouseOverVideo(){
        TweenMax.to([f3_video_overlay_img.element],.3,{opacity:0})
        TweenMax.to(videoPlayer.element,.3,{opacity:.65})
        videoPlayer.play();
      }

      function mouseOutVideo(){
        TweenMax.to([f3_video_overlay_img.element],.3,{opacity:1})
        TweenMax.to(videoPlayer.element,.3,{opacity:0})
        videoPlayer.pause();
        videoPlayer.mute();
      }

      function clickVideoOverlay(){
        TweenMax.to(f3_video_overlay_img.element,.3,{opacity:0},0)
        TweenMax.to(videoPlayer.element,.3,{opacity:1},0)
        videoPlayer.unmute();
      }

      function diamond2_hover_ON(){
        //TweenMax.to(f3_hotspot1_img.element,.3,{scale:1, rotation:90},0);
        TweenMax.to([f3_diamond2_container.element], .75, {rotationY:180, ease:"Back.easeOut"});
        TweenMax.to([f3_diamond2_overlay_img.element], .5, {opacity:1});
        TweenMax.to([f3_diamond2_img.element], .5, {opacity:0});
      }

      function diamond2_hover_OFF(){
        //TweenMax.to(f3_hotspot1_img.element,.3,{scale:1, rotation:45},0)
        TweenLite.to([f3_diamond2_container.element], .75, {rotationY:0, ease:"Back.easeOut"});
        TweenMax.to([f3_diamond2_overlay_img.element], .5, {opacity:0});
        TweenMax.to([f3_diamond2_img.element], .5, {opacity:1});
        //TweenMax.to(f3_hotspot1_img.element,.3,{scale:1.25,ease:"Power4.easeInOut"})
      }

      function diamond3_hover_ON(){
        //TweenMax.to(f3_hotspot2_img.element,.3,{scale:1, rotation:90},0)
        TweenMax.to([f3_diamond3_container.element], .75, {rotationY:180, ease:"Back.easeOut"});
        TweenMax.to([f3_diamond3_overlay_img.element], .5, {opacity:1});
        TweenMax.to([f3_diamond3_img.element], .5, {opacity:0});
      }

      function diamond3_hover_OFF(){
        //TweenMax.to(f3_hotspot2_img.element,.3,{scale:1, rotation:45},0)
        TweenLite.to([f3_diamond3_container.element], .75, {rotationY:0, ease:"Back.easeOut"});
        TweenMax.to([f3_diamond3_overlay_img.element], .5, {opacity:0});
        TweenMax.to([f3_diamond3_img.element], .5, {opacity:1});
        //TweenMax.to(f3_hotspot2_img.element,.3,{scale:1.25,ease:"Power4.easeInOut"})
      }

      var diamond4_Arr = [f3_diamond4_overlay_img.element, f3_diamond4_img.element];
      var diamond1_Arr = [f3_diamond1_overlay_img.element, f3_diamond1_img.element];

      function diamond1_hover_ON(){
        //TweenMax.to([f3_hotspot2_img.element,f3_hotspot1_img.element],.3,{rotation:90},0);
        TweenMax.to(f3_diamond1_img.element, .75, {scale:1.3, ease:"Power4.easeOut"});
        TweenMax.to(f3_diamond1_overlay_img.element, .75, {autoAlpha:1, ease:"Power4.easeOut"});
      }

      function diamond1_hover_OFF(){
        //TweenMax.to([f3_hotspot2_img.element,f3_hotspot1_img.element],.3,{rotation:45},0)
        TweenMax.to(diamond1_Arr, .75, { ease:"Power4.easeOut"});
        TweenMax.to(f3_diamond1_img.element, .75, {scale:1, ease:"Power4.easeOut"});
        TweenMax.to([f3_diamond1_overlay_img.element], .75, {autoAlpha:0});
      }

      function diamond4_hover_ON(){
        //TweenMax.to([f3_hotspot2_img.element,f3_hotspot1_img.element],.3,{rotation:90},0);
        TweenMax.to(f3_diamond4_img.element, .75, {scale:1.3, ease:"Power4.easeOut"});
        TweenMax.to(f3_diamond4_overlay_img.element, .75, {autoAlpha:1, ease:"Power4.easeOut"});
      }

      function diamond4_hover_OFF(){
        //TweenMax.to([f3_hotspot2_img.element,f3_hotspot1_img.element],.3,{rotation:45},0)
        TweenMax.to(f3_diamond4_img.element, .75, {scale:1, ease:"Power4.easeOut"});
        TweenMax.to([f3_diamond4_overlay_img.element], .75, {autoAlpha:0});
        TweenMax.to(diamond4_Arr, .75, {y:0, ease:"Power4.easeOut"});
      }



      var frame3_passive_control = setTimeout(function(){frame3_passive_animations()}, 1500);

      function frame3_passive_animations(){
        //TweenMax.to(f3_hotspot1_img.element,1,{scale:1.15, yoyo: true, ease: "Power4. easeInOut", repeat:-1})
        //TweenMax.to(f3_hotspot2_img.element,1,{scale:1.15, yoyo: true, ease: "Power4. easeInOut", repeat:-1,delay:.25})
      }

      var frame3_passive_control = setTimeout(function(){frame4_passive_animations()}, 1500);

      function frame4_passive_animations(){
        TweenMax.to(f4_down_bg_img.element,2,{scale:.98,rotation:2, yoyo: true, ease: "Rough. easeInOut", repeat:-1, force3D:true},.75)
      }

      var all_diamond_Arr = [f3_diamond_2_hit_area.element, f3_diamond_3_hit_area.element];
      var all_materials_Arr = [f4_hotspot1_img.element, f4_hotspot2_img.element, f4_hotspot3_img.element];


      //////////////////////////////////////////////////////////
      // FRAME 4 HOTSPOTS //////////////////////////////////////
      //////////////////////////////////////////////////////////

      var backpack_scrub_Arr = [scrubber_ctn.element, backpack_scrubber_handle.element],
        jacket_scrub_Arr = [scrubber_ctn.element, jacket_scrubber_handle.element],
        shirt_scrub_Arr = [scrubber_ctn.element, shirt_scrubber_handle.element];

      var all_cotton_card_Arr = [f4_cotton_label_img.element, backpack_Container.element, backpack_scrub_Arr, f4_cotton_icon_img.element, f4_cotton_text_img.element, f4_infocard_line_img.element, f4_cotton_stat_text_img.element, f4_plastic_stat_number_img.element, f4_infocard_close_img.element];
      var all_down_card_Arr = [f4_down_label_img.element, jacket_Container.element, jacket_scrub_Arr , f4_down_icon_img.element, f4_down_text_img.element, f4_infocard_line_img.element, f4_down_stat_redcircle_img.element, f4_down_stat_text_img.element, f4_infocard_close_img.element];
      var all_hemp_card_Arr = [f4_hemp_label_img.element, shirt_Container.element, shirt_scrub_Arr, f4_hemp_icon_img.element, f4_hemp_text_img.element, f4_infocard_line_img.element, f4_hemp_stat_text_img.element, f4_hemp_stat_number_img.element, f4_infocard_close_img.element];
      var all_cards_Arr = [all_cotton_card_Arr, all_down_card_Arr, all_hemp_card_Arr]


      var open_Frame4Hotspot = new TimelineMax({paused:true})
        .to(f4_card_container.element,.6,{x:970, ease:"Back.easeOut", easeParams:[.75]})
        .to(f4_infocard_base_img.element,.5,{x:10, ease:"Back.easeOut", easeParams:[1.5]},"-=.4")
        .to(f4_infocard_base_img.element,.5,{x:0,y:-9, ease:"Power4.easeOut", easeParams:[1]},"-=.2")
        .to(f4_infocard_fold_img.element,.5,{autoAlpha:1},"-=.3")


      var svg = document.getElementById("percentCircle");
      var circle = svg.getElementById("circle");

      var downCard = new TimelineMax({paused:true})
        .set(circle, {drawSVG:"0% 0%", stroke: "#f27177", rotation:-90, transformOrigin:"50% 50%", ease:"Linear.easeInOut"})
        .set(f4_down_stat_number_10.element,{autoAlpha:0})
        .to(circle, 1.5, {drawSVG:"0% 100%", stroke: "#f27177", ease:"Power4.easeInOut", delay:2})
        .to(f4_down_stat_number_10.element,.5,{autoAlpha:1})



      // VIDEO
      f3_video_hit_area.on("mouseover", mouseOverVideo);
      f3_video_hit_area.on("mouseout", mouseOutVideo);
      f3_video_hit_area.on("click", clickVideoOverlay);

      // DIAMOND 1
      f3_diamond_1_hit_area.on("mouseover", diamond1_hover_ON);
      f3_diamond_1_hit_area.on("mouseout", diamond1_hover_OFF);

      // DIAMOND 2
      f3_diamond_2_hit_area.on("mouseover", diamond2_hover_ON);
      f3_diamond_2_hit_area.on("mouseout", diamond2_hover_OFF);

      // DIAMOND 3
      f3_diamond_3_hit_area.on("mouseover", diamond3_hover_ON);
      f3_diamond_3_hit_area.on("mouseout", diamond3_hover_OFF);

      // DIAMOND 4
      f3_diamond_4_hit_area.on("mouseover", diamond4_hover_ON);
      f3_diamond_4_hit_area.on("mouseout", diamond4_hover_OFF);


      function scaleUpHotspot(id){
        TweenMax.to(id.element, .3, {scale:1.1, yoyo:true, repeat:-1})
      }
      function scaleDownHotspot(id){
        TweenMax.to(id.element, .3, {scale:1.0, yoyo:false})
      }

      // FRAME 4 HOTSPOTS
      f4_hotspot_1_hit_area.on("click", openFrame4Hotspot);
      f4_hotspot_2_hit_area.on("click", openFrame4Hotspot);
      f4_hotspot_3_hit_area.on("click", openFrame4Hotspot);

      f4_hotspot_1_hit_area.on("mouseover", function(){
        scaleUpHotspot(f4_hotspot1_img);
      });
      f4_hotspot_2_hit_area.on("mouseover", function(){
        scaleUpHotspot(f4_hotspot2_img);
      });
      f4_hotspot_3_hit_area.on("mouseover", function(){
        scaleUpHotspot(f4_hotspot3_img);
      });

      f4_hotspot_1_hit_area.on("mouseout", function(){
        scaleDownHotspot(f4_hotspot1_img);
      });
      f4_hotspot_2_hit_area.on("mouseout", function(){
        scaleDownHotspot(f4_hotspot2_img);
      });
      f4_hotspot_3_hit_area.on("mouseout", function(){
        scaleDownHotspot(f4_hotspot3_img);
      });


      f4_close_tab_hit_area.on("click", closeFrame4Hotspot);

      var f2_back_hit_area = R.create("div").set({
        css:{
          //backgroundImage: R.create("var").set({name:"f2_back_hit_area", defaultValue:"_dev_down_arrow.png", dataType:"String", required:false, exposed:true}).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: 0,
          bottom: 0,
          width: 100,
          height: 50,
          zIndex: 65,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          backgroundColor:"rgba(0,0,0,.3)",
        },
        rosetta:{
          parentNode:f2_container
        },
        attr:{
          id: "f2_back_hit_area"
        }
      }).render({
        success:function() {
          //TweenMax.set(f2_back_hit_area.element,{rotation:-90});
        }
      });


      var f1_hit_area = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 970,
          height: 250,
          zIndex: 65,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "hidden",
          //backgroundColor:"rgba(0,0,0,.3)",
        },
        rosetta:{
          parentNode:f1_container
        },
        attr:{
          id: "f1_hit_area"
        }
      }).render({
        success:function() {
          TweenMax.set(f1_hit_area.element,{rotation:0});
        }
      });

      var f1_hit_area2 = R.create("div").set({
        css:{
          left: 0,
          top: 0,
          width: 200,
          height: 70,
          zIndex: 66,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          visibility: "visible",
          //backgroundColor:"rgba(0,0,0,.3)",
        },
        rosetta:{
          parentNode:f1_container
        },
        data: {
          url:"http://www.conversantmedia.com"
        },
        attr:{
          id: "f1_hit_area2"
        }
      }).render().on("click", adHit);

      var stageBlock = R.create('div').set({
        attr:{
          id:'stageBlock'
        },
        css:{
          width:970,
          height:250,
          top:0,
          left:0,
          zIndex:99999,
          opacity:1,
          backgroundColor:"rgba(255,255,255,1)",
          pointerEvents:"auto",
        },
        rosetta:{
          parentNode:stage
        }
      }).render()




      /* [BATCH_LOADING] */
      var requiredArr = [f1_logo_img, f2_logo_img];
      var allElementsArr = [f3_diamond1_overlay_img, f3_diamond1_img, f3_diamond2_overlay_img, f3_diamond2_img, f3_diamond3_overlay_img, f3_diamond3_img, f3_diamond4_overlay_img, f3_diamond4_img, f3_video_overlay_img, f3_line_img, f3_headline_img, f3_subhead_img, f3_copy_block_img, f3_bg_img, videoPlayer, f3_container, f3_video_hit_area,  f3_diamond_2_hit_area, f3_diamond2_container, f3_diamond2_container_main, f3_diamond_3_hit_area, f3_diamond3_container, f3_diamond3_container_main, f3_diamond_1_hit_area, f3_diamond_4_hit_area, f3_nav_back_img, f2_container, /*f2_hit_area_up, f2_hit_area_down,*/ f3_nav_hit_area, f3_cta_text, f4_container, f4_nav_hit_area,  f4_nav_back_img, f4_copy_block_img, f4_headline_img, f4_subhead_img, f4_line_img, f4_bg_img, f4_down_bg_img, f4_hotspot1_img, f4_hotspot2_img, f4_hotspot3_img, f4_hemp_bg_img_1, f4_card_container, f4_infocard_tab_img, f4_infocard_fold_img, f4_infocard_base_img, f4_close_tab_hit_area, f4_cotton_label_img, f4_cotton_icon_img, f4_cotton_text_img, f4_cotton_stat_text_img, f4_down_label_img, f4_down_stat_number_10, f4_down_stat_redcircle_img, f4_down_stat_text_img, f4_down_icon_img, f4_down_text_img, f4_hemp_icon_img, f4_hemp_label_img, f4_hemp_stat_text_img, f4_hemp_text_img, f4_hotspot_1_hit_area, f4_hotspot_2_hit_area, f4_hotspot_3_hit_area, f1_container, f1_hit_area,f1_hit_area2,f3_hit_area,f4_hit_area, f2_back_hit_area, f3_transition_cloud_1, f3_transition_cloud_2, f3_transition_cloud_3, f3_transition_cloud_4, f3_transition_cloud_5, f3_transition_cloud_6, f3_transition_cloud_7, f3_transition_sky_1, f4_transition_bg, f1_cloud2_img, f1_cloud1_img, f1_marker_text_img, f1_headline_a_img, f1_headline_b_img, markerContainer,F2_lookDownHit, F2_cloudBehindMt_1, F2_cloudBehindMt_2, F2_lookUpHit, F2_ground, F2_mt1, F2_mt2, F2_mt3, F2_sky, f2_social_img_yt, f2_social_img_ig, f2_social_img_fb, f2_headline_img, f2_subhead_img, f2_nav_up_img ,stageBlock, markerContainer_rotate, f1_cta_buton_img, f1_cta_arrow_img1, f1_cta_arrow_img2, f1_cta_arrow_img3, f1_subhead_img, f2_social_img_yt_hover, f2_social_img_ig_hover, f2_social_img_fb_hover, f2_nav_backArrow_img, f2_nav_down_arrow_img, f2_nav_up_arrow_img, f3_nav_back_arrow_img, f3_nav_back_arrow_img_2, f3_overlay_test_bs, f4_infocard_line_img, f4_plastic_stat_number_img, f4_plastic_bg_img, f4_infocard_close_img, f4_nav_back_arrow_img, f4_nav_back_arrow_img2, f2_nav_down_arrow_img2, f2_nav_up_arrow_img2, f2_nav_backArrow_img2, F2_mt4, ad_choices_logo, f2_logo_img_white];

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



      /* [END_CREATE_ELEMENTS] */
      //creativeReady()


      // All Animation goes here
      function animateElements() {
        console.log('f2_parallax');
        var f2_parallax = new Parallax(f2_container.element);
        // console.debug(f2_parallax);
        // f2_parallax.disable();
        //

        // window.removeEventListener('deviceorientation', f2_parallax.onDeviceOrientation);
        // window.removeEventListener('mousemove', f2_parallax.onMouseMove);
        // window.removeEventListener('resize', f2_parallax.onWindowResize);

        function block_stage(){
          stageBlock.pointerEvents = "auto";
        }

        function unblock_stage(){
          stageBlock.pointerEvents = "none";
        }

        unblock_stage(); //comment out before launch

        setTimeout(function(){ unblock_stage() }, 5000);

        TweenMax.set(f3_video_hit_area.element,{rotation:45})
        TweenMax.set([f3_diamond2_container_main.element,f3_diamond3_container_main.element], {perspective:800});
        //TweenMax.set(markerContainer.element, {perspective:200});
        //TweenMax.set(markerContainer_rotate.element, {rotationY:10});
        TweenMax.set([f3_diamond2_container.element, f3_diamond2_img.element, f3_diamond2_overlay_img.element,f3_diamond3_container.element, f3_diamond3_img.element, f3_diamond3_overlay_img.element, markerContainer_rotate.element], {transformStyle:"preserve-3d"});
        TweenMax.set([f3_diamond2_overlay_img.element,f3_diamond3_overlay_img.element], {rotationY:-180, opacity:0});

        //frame 3 set
        TweenMax.set(all_diamond_Arr,{autoAlpha:0})
        TweenMax.set(f3_diamond_1_hit_area.element,{autoAlpha:0, y:150,})
        TweenMax.set(f3_diamond_4_hit_area.element,{autoAlpha:0, y:-150})
        TweenMax.set(all_materials_Arr,{autoAlpha:0})
        TweenMax.set(all_cotton_card_Arr,{autoAlpha:0,y:10})
        TweenMax.set(all_down_card_Arr,{autoAlpha:0,y:10})
        TweenMax.set(all_hemp_card_Arr,{autoAlpha:0,y:10})

        // Frame 1 ///////////////////////////////
        ///////////////////////////////
        ///////////////////////////////
        console.log("here")
        TweenMax.to(stageBlock.element,.5,{backgroundColor:"rgba(255,255,255,0)"})


        var tlFloatC1= new TimelineMax({repeat: -1});
        var tlFloatC2= new TimelineMax({repeat: -1});
        var tlFloatC3= new TimelineMax({repeat: -1});
        var tlFloatC4= new TimelineMax({repeat: -1});
        var tlFloatMC= new TimelineMax();
        var tlFloatM2= new TimelineMax({repeat: -1});
        //var tlBounceArrow = new TimelineMax({repeat:-1, repeatDelay:5});



        function floatItem(tl, time, item, xCoor) {
          tl.fromTo(item, time, {x:0}, {x:xCoor, ease: "Sine.easeInOut"})
            .fromTo(item, time, {x:xCoor}, {x:0, ease: "Sine.easeInOut"})
        }


        floatItem(tlFloatC1, 6, f1_cloud1_img.element, 60, null);
        floatItem(tlFloatC2, 6, f1_cloud2_img.element, 60, null);
        floatItem(tlFloatC3, 6, f1_cloud3_img.element, 60, null);



        var allArrows = [f1_cta_arrow_img1.element, f1_cta_arrow_img2.element, f1_cta_arrow_img3.element];
        // var f1_animation_complete = false;

        // animate_arrows.staggerTo(allArrows, .5, {autoAlpha:"-=.4", yoyo:true, repeat:7, ease: "Power4.easeOut"},-.05)
        //    	.to([f1_container.element,f2_container.element],1.25,{x:-75,repeat:1, yoyo:true, ease:"Sine.easeInOut"}, "-=2.5")
        // 		.add(addF1Hover)
        // 		.to(allArrows, .2, {autoAlpha:"+=.4"},9.75)
        // 		.staggerTo(allArrows, .5, {autoAlpha:"-=.4", yoyo:true, repeat:6, ease: "Power4.easeOut"},-.05)
        //    	.to([f1_container.element,f2_container.element],1.25,{x:-75,repeat:1, yoyo:true, ease:"Sine.easeInOut"}, "-=2.5", 10)
        //    	.add('killAnimation')
        //console.log("f1_animation_complete",f1_animation_complete)

        //FRAME 1 ARROW ANIMATION
        var animate_arrows_2 = new TimelineMax({paused:true, repeat:4});
        animate_arrows_2.staggerTo(allArrows, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},-.1)
        animate_arrows_2.staggerTo(allArrows, .25, {autoAlpha:"-=.25",  ease: "Power4.easeOut"},-.1,"-=.15")

        function playF1arrows(){animate_arrows_2.play(0);}
        function stopF1arrows(){
          animate_arrows_2.pause();
          TweenMax.to(f1_cta_arrow_img1.element, .5, {autoAlpha:.75, ease: "Power4.easeOut"})
          TweenMax.to(f1_cta_arrow_img2.element, .5, {autoAlpha:.5, ease: "Power4.easeOut"})
          TweenMax.to(f1_cta_arrow_img3.element, .5, {autoAlpha:.25, ease: "Power4.easeOut"})

        }

        //FRAME 1 INTRO ANIMATION
        var animate_arrows = new TimelineMax({paused:true});
        animate_arrows.add(playF1arrows)
          .to([f1_container.element,f2_container.element],1.25,{x:-75,repeat:1, yoyo:true, ease:"Sine.easeInOut"}, "+=.5")
          .add(addF1Hover)
          .to([f1_container.element,f2_container.element],1.25,{x:-75,repeat:1, yoyo:true, ease:"Sine.easeInOut"}, "+=6")

        function playF1Anim(){animate_arrows.play(0);}
        //function pauseF1Anim(){animate_arrows.pause(0);}
        function killF1Anim(){animate_arrows.kill(null, [f1_container.element,f2_container.element]);}

        // var f1_nav_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        // f1_nav_arrow_tl.to(f1_cta_arrow_img3.element, .25, {autoAlpha:.5, ease:"Power4.easeOut"})
        //     .to(f1_cta_arrow_img2.element, .25, {autoAlpha:.75, ease: "Power4.easeOut"},"-=.25")
        //     .to(f1_cta_arrow_img1.element, .25, {autoAlpha:1, ease: "Power4.easeOut"},"-=.25")
        //

        var tlF1 = new TimelineMax({ delay:2})
        tlF1.from(f1_headline_a_img.element, 1.5, {autoAlpha:0, x: -60, ease: "Power4.easeOut"})
          .from(f1_headline_b_img.element, 1.5, {autoAlpha:0, x: 20, ease: "Power4.easeOut"}, .33)
          .from(f1_subhead_img.element, 1.5, {autoAlpha:0, y: 20, ease: "Power4.easeOut"}, .8)
          //.from(f1_cta_img.element, .8, {autoAlpha:0, x: -10, ease: "Power4.easeOut"}, 2.2)
          //.from(f1_cta_arrow_img.element, .8, {autoAlpha:0, x: -10, ease: "Power4.easeOut"}, 2.2)
          .from(markerContainer_rotate.element, 1, {autoAlpha:0,x:-10, ease: "Back.easeOut", easeParams:[1]}, 1.2)
          .add(playF1Anim)

        function addF1Hover(){
          // console.log("f1_animation_complete",f1_animation_complete)
          f1_container.on("mouseover", function(){
            overrideF1Animation();
            playF1arrows();
            console.log("addF1Hover")
          })
          f1_container.on("mouseout", stopF1arrows);
          //f1_animation_complete = true;
        }
        // function removeF1Hover(){
        //     stopF1arrows();
        // }

        function overrideF1Animation(){
          //if(f1_animation_complete == false){
          killF1Anim();
          //console.log("animation killed")
          //}
        }

        f1_hit_area.on("mousedown", function(){
          setResetF2();
          overrideF1Animation();
          if(f2_back_hit_area.pointerEvents=="none"){
            f2_back_hit_area.pointerEvents="auto";
          }
          if(F2_lookUpHit.pointerEvents=="none"){
            F2_lookUpHit.pointerEvents="auto";
          }
          if(F2_lookDownHit.pointerEvents=="none"){
            F2_lookDownHit.pointerEvents="auto";
          }
          nav_to_frame2.play();
          block_stage();
          setTimeout(function(){ startFrame2() }, 1500);
        })


        //Version 2


        // Frame 1 ////////////////////
        ///////////////////////////////
        ///////////////////////////////

        // Frame 2 ////////////////////
        ///////////////////////////////
        ///////////////////////////////

        //F2 PARALLAX/////////////////////////////////////////////



        //F2 ELEMENT SETTINGS/////////////////////////////////////

        function setResetF2() {
          TweenMax.to(f2_container.element, .5,{top:0})
          //F2 all UI and copy
          TweenMax.to([f2_nav_back_img.element,f2_nav_backArrow_img.element, f2_nav_backArrow_img2.element, f2_headline_img.element, f2_subhead_img.element],.5,{autoAlpha:0})
          //F2 nav arrows
          TweenMax.to([f2_nav_up_img.element,f2_nav_up_arrow_img.element, f2_nav_up_arrow_img2.element],.5,{autoAlpha:0, y:-60})
          TweenMax.to([f2_nav_down_img.element,f2_nav_down_arrow_img.element, f2_nav_down_arrow_img2.element],.5,{autoAlpha:0, y:20})
          // F2 ground / sky
          TweenMax.to(F2_ground.element,.5,{top:0, left:-95})
          //F2 foreground mountains left and right
          TweenMax.to(F2_mt2.element,.5,{top:145,left:-300/* webkitFilter:"blur(" + 0.75 + "px)" */},0)
          TweenMax.to(F2_mt3.element,.5,{top:140,left:-125/* webkitFilter:"blur(" + 0.75 + "px)" */},0)
          //F2 background mountains
          TweenMax.to(F2_mt1.element,.5,{opacity:1,top:0, left:-180, top:38},0)
          TweenMax.to(F2_mt4.element,.5,{opacity:1,top:0, left:-180, top:75},0)
          //F2 clouds
          TweenMax.to(F2_cloudBehindMt_1.element,.5,{top:100, left:-1000, opacity:.75, scale:1.5},0)
          TweenMax.to(F2_cloudBehindMt_2.element,.5,{top:100, left:-200, opacity:.75, scale:1.5},0)
        }


        setResetF2();
        function startFrame2(){
          //F2 INITIATE PARALLAX AND ALL UI ELEMENTS///////////////
          function initiateParallax(){
            var initiateParallax_2Ftl = new TimelineMax()
              .to(F2_mt4.element,1,{top:-75},0)
              .to(F2_mt1.element,1,{top:-50},0)
              .to(F2_ground.element,1,{autoAlpha:1,top:0, delay:.3},0)
              .to(F2_mt2.element,1,{top:-175},0)
              .to(F2_mt3.element,1,{top:-120},0)
              .set([f3_nav_back_img.element,f3_nav_back_arrow_img.element, f3_nav_back_arrow_img_2.element, f4_nav_back_img.element],{autoAlpha:0})

          }
          //F2 OPENING TITLE SEQUENCE////////////////////////////////////
          var tl_titleSeq_f2 = new TimelineMax()
            .add(initiateParallax)
            .to([f2_nav_up_arrow_img.element, f2_nav_down_arrow_img.element, f2_nav_backArrow_img.element,],.5,{autoAlpha:.75, y:0, ease:"Sine.easeOut", easeParams:[2]}, 0)
            .to([f2_nav_up_arrow_img2.element, f2_nav_down_arrow_img2.element, f2_nav_backArrow_img2.element],.5,{autoAlpha:.5, y:0, ease:"Sine.easeOut", easeParams:[2]}, 0)
            //.to([ ],1,{autoAlpha:.5},0)
            .to([f2_nav_up_img.element, f2_nav_down_img.element],.5,{autoAlpha:1, y:0, ease:"Sine.easeOut", easeParams:[2]}, 0)
            .to([f2_nav_back_img.element,f2_headline_img.element,f2_subhead_img.element],1,{autoAlpha:1}, 0)
            .to([F2_cloudBehindMt_1.element,F2_cloudBehindMt_2.element],1,{top:50,ease:"SineInOut"},0)
            .add(unblock_stage)
        }

        var animate_top_arrows_f2 = new TimelineMax();
        var animate_bot_arrows_f2 = new TimelineMax();

        var f2_nav_back_arrows = [f2_nav_backArrow_img.element, f2_nav_backArrow_img2.element];
        var allArrows_top_f2 = [f2_nav_up_arrow_img.element, f2_nav_up_arrow_img2.element];
        var allArrows_bot_f2 = [f2_nav_down_arrow_img.element, f2_nav_down_arrow_img2.element];


        // animate_top_arrows_f2.to(allArrows_top_f2, .1, {autoAlpha:.5, ease:"Power4.easeOut"})
        // 	.staggerTo(allArrows_top_f2, .5, {autoAlpha:1, yoyo:true, repeat:-1, delay: .4, ease: "Power4.easeOut"},-.15)

        F2_lookUpHit.on("mousedown", function(){
          f2_nav_up_arrow_tl.pause(0);
          f2_nav_down_arrow_tl.pause(0);
          F2_lookUpHit.pointerEvents="none";
          F2_lookDownHit.pointerEvents="none";

          console.log("F2_lookDownHit");
          TweenMax.set([f2_nav_down_img.element, f2_nav_up_img.element, f2_social_container.element, f2_nav_up_arrow_img.element, f2_nav_up_arrow_img2.element, f2_nav_down_arrow_img.element, f2_nav_down_arrow_img2.element,f2_nav_backArrow_img.element, f2_nav_backArrow_img2.element, f2_nav_back_img.element],{autoAlpha:0});

          TweenMax.staggerTo(clouds1,1.5,{y:-150, delay:1.2}, .2);
          TweenMax.staggerTo(clouds2,1.75,{y:-50}, .2);


          setTimeout(function(){
            nav_to_frame3.play();
          }, 100);
          setTimeout(function(){
            build_frame3.play();
            TweenMax.to([f3_nav_back_arrow_img.element, f3_nav_back_img.element],.5,{autoAlpha:.75},0)
            TweenMax.to([f3_nav_back_arrow_img_2.element],.5,{autoAlpha:.5},.5)

            F2_lookDownHit.pointerEvents="auto";

            setTimeout(function(){
              f3_video_hit_area.pointerEvents="auto";
              f3_nav_hit_area.pointerEvents="auto";
            }, 500);
          }, 3000);
        })


        F2_lookDownHit.on("mousedown", function(){
          f2_nav_up_arrow_tl.pause(0);
          f2_nav_down_arrow_tl.pause(0);
          F2_lookUpHit.pointerEvents="none";
          F2_lookDownHit.pointerEvents="none";
          TweenMax.set([f2_nav_down_img.element, f2_nav_up_img.element, f2_social_container.element, f2_nav_up_arrow_img.element, f2_nav_up_arrow_img2.element, f2_nav_down_arrow_img.element, f2_nav_down_arrow_img2.element,f2_nav_backArrow_img.element, f2_nav_backArrow_img2.element,f2_nav_back_img.element],{autoAlpha:0});

          setTimeout(function(){
            nav_to_frame4.play();
          }, 100);
          setTimeout(function(){
            build_frame4.play();
            TweenMax.to([f4_nav_back_arrow_img.element, f4_nav_back_img.element],.5,{autoAlpha:.75},0);
            TweenMax.to([f4_nav_back_arrow_img2.element],.5,{autoAlpha:.5},0);

            F2_lookUpHit.pointerEvents="auto";

            setTimeout(function(){
              f4_nav_hit_area.pointerEvents="auto";
            }, 500);
          }, 3000);
        })

        f2_back_hit_area.on("mousedown", function(){
          // f2_container.pointerEvents="none";
          TweenMax.to(f2_headline_img.element,.25,{autoAlpha:0})
          f2_back_hit_area.pointerEvents="none";
          F2_lookUpHit.pointerEvents="none";
          F2_lookDownHit.pointerEvents="none";
          setResetF2()
          setTimeout(function(){
            nav_to_frame2.reverse(.95);
          }, 1000);
        })

        function showF2Nav() {
          TweenMax.to([f2_nav_down_img.element, f2_nav_up_img.element, f2_nav_down_arrow_img2.element, f2_nav_back_img.element],.5,{autoAlpha:1});
          TweenMax.to([f2_nav_up_arrow_img.element, f2_nav_down_arrow_img.element, f2_nav_backArrow_img.element],.5,{autoAlpha:.75});
          TweenMax.to([f2_nav_up_arrow_img2.element, f2_nav_down_arrow_img2.element, f2_nav_backArrow_img2.element],.5,{autoAlpha:.5});
          //console.log("showing nav")
        }

        F2_lookUpHit.on("mouseover", lookUpArrow);
        F2_lookUpHit.on("mouseout", resetView);
        F2_lookDownHit.on("mouseover", lookDownArrow);
        F2_lookDownHit.on("mouseout", resetView);

        f2_back_hit_area.on("mouseover", function(){
          f2_back_arrow_tl.play(0);
          //console.log("start")
        })
        f2_back_hit_area.on("mouseout", function(){
          f2_back_arrow_tl.pause(0);
          //console.log("stop")
          if(f2_back_hit_area.pointerEvents=="none"){
            //console.log("here")
            TweenMax.to(f2_nav_back_arrows, .5, {autoAlpha:0, x:0, ease:"Power4.easeOut"},-.15,0)
          }
        })

        //F2 CHANGE VIEWS && ARROW ANIMAITIONS ////////////////////////////////////////////////

        var tempTL = new TimelineMax({repeat:-1, paused:true});

        var f2_back_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        f2_back_arrow_tl.to(f2_nav_backArrow_img2.element, .25, {autoAlpha:"+=.25", ease:"Power4.easeOut"})
          .to(f2_nav_backArrow_img.element, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},"-=.05")
          .to(f2_nav_backArrow_img2.element, .25, {autoAlpha:"-=.25", ease:"Power4.easeOut"})
          .to(f2_nav_backArrow_img.element, .25, {autoAlpha:"-=.25", ease: "Power4.easeOut"},"-=.05");

        var f2_nav_up_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        f2_nav_up_arrow_tl.to(f2_nav_up_arrow_img2.element, .25, {autoAlpha:"+=.25", ease:"Power4.easeOut"})
          .to(f2_nav_up_arrow_img.element, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},"-=.05")
          .to(f2_nav_up_arrow_img2.element, .25, {autoAlpha:"-=.25", ease:"Power4.easeOut"})
          .to(f2_nav_up_arrow_img.element, .25, {autoAlpha:"-=.25", ease: "Power4.easeOut"},"-=.05");

        var f2_nav_down_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        f2_nav_down_arrow_tl.to(f2_nav_down_arrow_img2.element, .25, {autoAlpha:"+=.25", ease:"Power4.easeOut"})
          .to(f2_nav_down_arrow_img.element, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},"-=.05")
          .to(f2_nav_down_arrow_img2.element, .25, {autoAlpha:"-=.25", ease:"Power4.easeOut"})
          .to(f2_nav_down_arrow_img.element, .25, {autoAlpha:"-=.25", ease: "Power4.easeOut"},"-=.05");

        var logo_toggle_tl = new TimelineMax({paused:true});
        logo_toggle_tl.to(f2_logo_img.element, .5, {autoAlpha:0, ease:"Power4.easeOut"})
          .to(f2_logo_img_white.element, .5, {autoAlpha:1, ease: "Power4.easeOut"},"-=.5")

        function toggle_logo_white(){
        	logo_toggle_tl.play()
        }
        function toggle_logo_black(){
        	logo_toggle_tl.reverse();
        	console.log("here over there")
        }


        function lookUpArrow(){
          f2_nav_up_arrow_tl.play(0);
          var tl_upView_f2 = new TimelineMax()
          tl_upView_f2.to(F2_mt2.element,1,{top:-80, ease:"SineInOut"},0)
            .to(F2_mt3.element,1,{top:-40, ease:"SineInOut"},0)
            .to(F2_mt1.element,1,{top:10,ease:"SineInOut"},0)
            .to(F2_mt4.element,1,{top:-20,ease:"SineInOut"},0)
            .to(F2_sky.element,1,{bottom:-70,ease:"SineInOut"},0)
            .to(F2_ground.element,1,{autoAlpha:1,top:50, ease:"SineInOut"},0)
            .to([F2_cloudBehindMt_1.element,F2_cloudBehindMt_2.element],1,{top:190,ease:"SineInOut", opacity:.5},0)
        }

        function lookDownArrow(){
          toggle_logo_white();
          f2_nav_down_arrow_tl.play(0)
          var tl_downView_f2 = new TimelineMax()
          tl_downView_f2.to(F2_mt1.element,1,{top:-140, ease:"SineInOut"},0)
            .to([F2_mt2.element],1,{top:-225,ease:"SineInOut"},0)
            .to([F2_mt3.element],1,{top:-195,ease:"SineInOut"},0)
            .to(F2_mt4.element,1,{top:-210,ease:"SineInOut"},0)
            .to(F2_ground.element,1,{autoAlpha:1,top:-70, ease:"SineInOut"},0)
            .to([F2_cloudBehindMt_1.element,F2_cloudBehindMt_2.element],1,{top:-60,ease:"SineInOut", opacity:.5},0)
        }

        function resetView(){
          //toggle_logo_black();
          //console.log("resetView")
          f2_nav_up_arrow_tl.pause(0);
          f2_nav_down_arrow_tl.pause(0);
          var tl_resetView_f2 = new TimelineMax()
          tl_resetView_f2.to(F2_mt1.element,1,{top:-50, ease:"SineInOut"},0)
            .to(F2_mt4.element,1,{top:-75, ease:"SineInOut"},0)
            .to(F2_ground.element,1,{autoAlpha:1,top:0, ease:"SineInOut"},0)
            .to(F2_mt2.element,1,{top:-175, ease:"SineInOut"},0)
            .to(F2_mt3.element,1,{top:-120, ease:"SineInOut"},0)
            .to(F2_sky.element,1,{bottom:0,ease:"SineInOut"},0)
            .to([F2_cloudBehindMt_1.element,F2_cloudBehindMt_2.element],1,{top:50,ease:"SineInOut", opacity:.75},0)

          if(F2_lookUpHit.pointerEvents=="none" || F2_lookDownHit.pointerEvents=="none"){
            TweenMax.to([allArrows_top_f2,allArrows_bot_f2], .5, {autoAlpha:0}, 0);
            //console.log("resetView : clicked")
          }else{
            //console.log("resetView : no click")
            toggle_logo_black();
            TweenMax.set([f2_nav_up_arrow_img.element, f2_nav_down_arrow_img.element],  {autoAlpha:.75}, 0);
            TweenMax.set([f2_nav_up_arrow_img2.element, f2_nav_down_arrow_img2.element],  {autoAlpha:.5}, 0)
          }
        }



        //F2 ANIMATE CLOUDS///////////////////////////////////////

        var F2_tlFloat1 = new TimelineMax({repeat: -1});
        var F2_tlFloat2 = new TimelineMax({repeat: -1});

        function F2_floatItem(tl, time, item, xCoor, yCoor) {
          if (xCoor) {
            tl.fromTo(item, time, {x:0}, {x:xCoor, ease: "Sine.easeInOut"})
              .fromTo(item, time, {x:xCoor}, {x:0, ease: "Sine.easeInOut"})
          }
          if (yCoor) {
            tl.fromTo(item, time, {y:0}, {y:yCoor, ease: "Sine.easeInOut"})
              .fromTo(item, time, {y:yCoor}, {y:0, ease: "Sine.easeInOut"})
          }
        }
        F2_floatItem(F2_tlFloat2, 5, F2_cloudBehindMt_1.element, -50, null);
        F2_floatItem(F2_tlFloat2, 5, F2_cloudBehindMt_2.element, -50, null);


        // Frame 2 ////////////////////
        /////////////////// end ////////
        ///////////////////////////////

        var f3_conent_Arr = [f3_line_img.element, f3_headline_img.element, f3_subhead_img.element];
        var f4_conent_Arr = [f4_line_img.element, f4_headline_img.element, f4_subhead_img.element];


        var nav_to_frame2 = new TimelineMax({paused: true})
          .to([f1_container.element,f2_container.element,f2_logo_img.element, f2_logo_img_white.element],1,{x:-970, ease:"Circ.easeInOut"})

        var nav_to_frame3 = new TimelineMax({paused: true})
          .to([f2_container.element, f3_container.element, f4_container.element],3,{y:1000, ease:"Power4.easeInOut"})
          .to(f3_copy_block_img.element,1,{x:250, ease:"Power4.easeInOut"},"-=.25")

        var build_frame3 = new TimelineMax({paused: true})
          .add(diamond2_hover_ON)
          .add(diamond3_hover_ON)
          .staggerTo(f3_conent_Arr,1,{autoAlpha:1, y:-10, ease:"Power4.easeInOut"},.1)
          .staggerTo(all_diamond_Arr,1,{autoAlpha:1},.1,"-=1")
          .to(f3_diamond_1_hit_area.element,.75,{y:0,x:0, autoAlpha:1, ease:"Power4.easeOut"})
          .to(f3_diamond_4_hit_area.element,.75,{y:0,x:0, autoAlpha:1, ease:"Power4.easeOut"},"-=.5")
          .add(flipDiamonds)
        //.add(f3_video_hit_area.pointerEvents="auto",2)

        function flipDiamonds() {
          setTimeout(function(){
            diamond2_hover_OFF();
            diamond3_hover_OFF();
          }, 2000)
        }

        var nav_to_frame4 = new TimelineMax({paused: true})
          .to([f2_container.element, f3_container.element, f4_container.element],3,{y:-1000, ease:"Power4.easeInOut"})
          .to(f4_copy_block_img.element,1,{x:250, ease:"Power4.easeInOut"},"-=.25")

        var build_frame4 = new TimelineMax({paused:true, onStart:toggle_logo_black})
          .staggerTo(f4_conent_Arr,1,{autoAlpha:1, y:10, ease:"Power4.easeInOut"},.1)
          .staggerTo(all_materials_Arr,1,{autoAlpha:1, ease:"Power4.easeOut"},.25,"-=1")
          .to(f4_down_bg_img.element,1,{y:20, ease:"Back.easeOut", easeParams:[.75]},"-=1.25")

        var clouds1 = [f3_transition_cloud_1.element, f3_transition_cloud_2.element, f3_transition_cloud_3.element],
          clouds2 = [f3_transition_cloud_4.element, f3_transition_cloud_5.element, f3_transition_cloud_6.element, f3_transition_cloud_7.element];

        TweenMax.set(f3_transition_cloud_6.element,{scale:2});
        TweenMax.set(f3_transition_cloud_7.element,{scale:1.6});


        var allArrows_f3 = [f3_nav_back_arrow_img.element, f3_nav_back_arrow_img_2.element];

        f3_nav_hit_area.on("mousedown", function(){
          f3_back_arrow_tl.pause(0);
          f3_nav_hit_area.pointerEvents="none";
          f3_video_hit_area.pointerEvents="none";
          TweenMax.set([f3_nav_back_img.element, f3_nav_back_arrow_img.element, f3_nav_back_arrow_img_2.element],{autoAlpha:0})
          TweenMax.staggerTo(clouds1,1,{y:0, delay:1.2},.2);
          TweenMax.staggerTo(clouds2,1.75,{y:0},.2);

          nav_to_frame3.reverse();

          setTimeout(function(){
            TweenMax.to(f2_social_container.element,.5,{autoAlpha:1});
            build_frame3.reverse();
            showF2Nav();
            //f3_nav_hit_area.pointerEvents = "auto";
            F2_lookUpHit.pointerEvents="auto";
            F2_lookDownHit.pointerEvents="auto";
          }, 4000);
        })

        var f3_back_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        f3_back_arrow_tl.to(f3_nav_back_arrow_img_2.element, .25, {autoAlpha:"+=.25", ease:"Power4.easeOut"})
          .to(f3_nav_back_arrow_img.element, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},"-=.05")
          .to(f3_nav_back_arrow_img_2.element, .25, {autoAlpha:"-=.25", ease:"Power4.easeOut"})
          .to(f3_nav_back_arrow_img.element, .25, {autoAlpha:"-=.25", ease: "Power4.easeOut"},"-=.05");

        f3_nav_hit_area.on("mouseover", function(){
          f3_back_arrow_tl.play(0);
        })

        f3_nav_hit_area.on("mouseout", function(){
          if(f3_nav_hit_area.pointerEvents=="none"){
            f3_back_arrow_tl.pause(0);
            TweenMax.to([allArrows_f3], .5, {autoAlpha:0}, 0);
          }else{
            f3_back_arrow_tl.pause(0);
          }
        })


        var allArrows_f4 = [f4_nav_back_arrow_img.element, f4_nav_back_arrow_img2.element];

        var f4_back_arrow_tl = new TimelineMax({repeat:-1, paused:true});
        f4_back_arrow_tl.to(f4_nav_back_arrow_img2.element, .25, {autoAlpha:"+=.25", ease:"Power4.easeOut"})
          .to(f4_nav_back_arrow_img.element, .25, {autoAlpha:"+=.25", ease: "Power4.easeOut"},"-=.05")
          .to(f4_nav_back_arrow_img2.element, .25, {autoAlpha:"-=.25", ease:"Power4.easeOut"})
          .to(f4_nav_back_arrow_img.element, .25, {autoAlpha:"-=.25", ease: "Power4.easeOut"},"-=.05");


        f4_nav_hit_area.on("mouseover", function(){
          f4_back_arrow_tl.play(0);
        })

        f4_nav_hit_area.on("mouseout", function(){
          if(f3_nav_hit_area.pointerEvents=="none"){
            f4_back_arrow_tl.pause(0);
            TweenMax.to([allArrows_f3], .5, {autoAlpha:0}, 0);
          }else{
            f4_back_arrow_tl.pause(0);
          }
        })


        f4_nav_hit_area.on("mousedown", function(){
          f4_back_arrow_tl.pause(0);
          f4_nav_hit_area.pointerEvents = "none";
          F2_lookUpHit.pointerEvents="none";
          TweenMax.to(f4_nav_back_img.element, .5,{autoAlpha:0})
          TweenMax.to([f4_nav_back_arrow_img.element, f4_nav_back_arrow_img2.element],.1,{autoAlpha:0})
          //block_stage();

          nav_to_frame4.reverse();
          toggle_logo_white();
          setTimeout(function(){toggle_logo_black();},2000);
          //closeSocial();

          setTimeout(function(){
            build_frame4.reverse();
            showF2Nav();
            F2_lookUpHit.pointerEvents="auto";
            F2_lookDownHit.pointerEvents="auto";
            TweenMax.to(f2_social_container.element,.5,{autoAlpha:1});

            if(hotSpotActive === true){
              closeFrame4Hotspot();
            }
          }, 4000);
        })

        var social_yt_Arr = [f2_social_img_yt.element,f2_social_img_yt_hover.element];
        var social_ig_Arr = [f2_social_img_ig.element,f2_social_img_ig_hover.element];
        var social_fb_Arr= [f2_social_img_fb.element, f2_social_img_fb_hover.element];

        var socialIconArr = [social_yt_Arr, social_ig_Arr, social_fb_Arr];
        var socialBaseIconArr = [f2_social_img_yt.element, f2_social_img_ig.element, f2_social_img_fb.element];
        var socialHoverIconArr = [f2_social_img_yt_hover.element, f2_social_img_ig_hover.element, f2_social_img_fb_hover.element];

        TweenMax.set(socialBaseIconArr,{x:20, autoAlpha:1});
        TweenMax.set(socialHoverIconArr,{x:20, autoAlpha:0});

        f2_social_img_yt.on("mouseover", function(){
          TweenMax.to(f2_social_img_yt_hover.element,.25,{autoAlpha:1, ease:"Sine.easeOut"});
        })

        f2_social_img_yt.on("mouseout", function(){
          TweenMax.to(f2_social_img_yt_hover.element,.25,{autoAlpha:0, ease:"Sine.easeOut"});
        })

        f2_social_img_ig.on("mouseover", function(){
          TweenMax.to(f2_social_img_ig_hover.element,.25,{autoAlpha:1, ease:"Sine.easeOut"});
        })

        f2_social_img_ig.on("mouseout", function(){
          TweenMax.to(f2_social_img_ig_hover.element,.25,{autoAlpha:0, ease:"Sine.easeOut"});
        })

        f2_social_img_fb.on("mouseover", function(){
          TweenMax.to(f2_social_img_fb_hover.element,.25,{autoAlpha:1, ease:"Sine.easeOut"});
        })

        f2_social_img_fb.on("mouseout", function(){
          TweenMax.to(f2_social_img_fb_hover.element,.25,{autoAlpha:0, ease:"Sine.easeOut"});
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
      var index = 0;
      Analytics.fire({event: "click", instance: instance,  currentInstance:instance, details:""});
      if (instance && instance.data && instance.data.hitIndex) {
        index = instance.data.hitIndex;
      }
      //var clickOut = R.create("var").set({name:"mplx_clickOut", defaultValue:"", dataType:"String", required:false, exposed:true}).render().value();
      var clickOut = instance.data.url;
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

      // TweenMax
      if (registry.TweenMax && !defined.TweenMax) {registry.TweenMax.enable();}
      if (defined.TweenMax) {
        TweenMax = defined.TweenMax;
        TweenMax.selector = R.selector;
      }
      // TweenLite
      if (registry.TweenLite && !defined.TweenLite) {registry.TweenLite.enable();}
      if (defined.TweenLite) {
        TweenLite = defined.TweenLite;
        Settings.overwrite({GSAPSelector: TweenLite.selector});
        TweenLite.selector = R.selector;
        //if (TweenLite._plugins.morphSVG) {MorphSVGPlugin = TweenLite._plugins.morphSVG;}// custom
        /* [INSERT_PLUGIN_DEFS] */


      }
      // TimelineLite
      if (registry.TimelineLite && !defined.TimelineLite) {registry.TimelineLite.enable();}
      if (defined.TimelineLite) {TimelineLite = defined.TimelineLite;}

      //TimelineMax
      if (registry.TimelineMax && !defined.TimelineMax) {registry.TimelineMax.enable();}
      if (defined.TimelineMax) {TimelineMax = defined.TimelineMax;}
      //Hammer
      if (defined.Hammer) { Hammer = defined.Hammer;}

      if (defined.Parallax) { Parallax = defined.Parallax;}
    }

    function log(msg) {
      if (window && window.console){
        var c = "Creative: ";
        try {
          if (window.console.debug && typeof msg == "object"){
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

    function checkForCallback(evt) {
      if (!evt){return;}
      var arr = registeredCallbacks;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].evt == evt) {
          if (arr[i].callback) {
            try{ arr[i].callback.call(arr[i].scope); } catch(e) { log("Callback failed"); }
          }
        }
      }
    }

    function environReady(isReady) {
      if (isEnvironReady == false){
        isEnvironReady = isReady;
        if (isReady == true) {
          logEnvironStatus("parentEnvironment", isEnvironReady);
        }
      }
      return reveal;
    }

    function creativeReady() {
      if (isCreativeReady == false) {
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
      if (environStatuses.length == environTotals) {
        showCreative();
      }
    }

    function checkEnvironStatus(src) {
      for (var i=0; i<environStatuses.length; i++){
        if (environStatuses[i].src == src) {
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
  };
  creatives.push(Creative);
  return Creative;
}());