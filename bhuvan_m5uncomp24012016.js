OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
var extent = new OpenLayers.Bounds( 60, 5, 100, 40);
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
var map, popups = {},layer5,layer6;
var urlArray = ["https://tile1.nrsc.gov.in/tiles", "https://tile2.nrsc.gov.in/tiles", "https://tile3.nrsc.gov.in/tiles", "https://tile4.nrsc.gov.in/tiles", "https://tile5.nrsc.gov.in/tiles"],			
urlArray1 = ["https://tile1.nrsc.gov.in/tilecache/tilecache.py?", "https://tile2.nrsc.gov.in/tilecache/tilecache.py?", "https://tile3.nrsc.gov.in/tilecache/tilecache.py?", "https://tile4.nrsc.gov.in/tilecache/tilecache.py?", "https://tile5.nrsc.gov.in/tilecache/tilecache.py?"],
urlArray3 = ["https://vtile1.nrsc.gov.in/bhuvan/gwc/service/wms/", "https://vtile2.nrsc.gov.in/bhuvan/gwc/service/wms/", "https://vtile3.nrsc.gov.in/bhuvan/gwc/service/wms/", "https://vtile4.nrsc.gov.in/bhuvan/gwc/service/wms/", "https://vtile5.nrsc.gov.in/bhuvan/gwc/service/wms/"];
var IRSlayer,basemap,admin_grouped,redifflayer,kmllayer,terrainlayer,transportnetwork,json_url,dummylayer,
watershed_grouped,popupControl=null,hydriflag=0,hospital,br1,subbasin,ln_50;
var MD="Measure Distance",TD="Total Distance",MA="Measure Area",TA="Total Area";	
 var modify; //To Edit/Modify the draw
var vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
	style: layer_style,
	renderers: renderer
}),
renderer = OpenLayers.Util.getParameters(window.location.href).renderer,
renderer = renderer ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers,
layer_style = OpenLayers.Util.extend({},OpenLayers.Feature.Vector.style["default"]);
layer_style.fillOpacity = 0.2;
layer_style.graphicOpacity = 1;
var userlyrinfo,kml_all = [],popupControl=null;;
var drawid='test';//tokeep record of which one is selected
var modify; //To Edit/Modify the draw
var redostack; //for undo/redo of the draw feature
var click,clickflag = 0;
var pointLayer=0,oClick,rClick;
var kmlid=0;
	function init()
	{	
	
		map = new OpenLayers.Map('map', {
	                tileManager:null,
				    resolutions: [0.0439453125,0.010986328125,0.00274658203125,0.0006866455078125,0.000171661376953125,0.00004291534423828125,0.000021457672119140625,0.000010728836059570312,0.000005364418029785156],
					numZoomLevels: 9,
					maxResolution: 0.0439453125,
					resolution:0.0439453125,					
					restrictedExtent: extent,
                    controls: [                                 								    
								  new OpenLayers.Control.StatusBar(),
								  //new OpenLayers.Control.ScaleBar(),
								    new OpenLayers.Control.ScaleLine({bottomOutUnits: ''}),
								  new OpenLayers.Control.PanZoomBar(),
								  new OpenLayers.Control.Attribution(),
								  new OpenLayers.Control.Navigation({dragPanOptions:{enableKinetic:true}})								  
                               ]                    
				});			
		
		dummylayer= new OpenLayers.Layer("base__worl2", {isBaseLayer: true,'displayInLayerSwitcher': false} );  
		IRSlayer =  IRSlayer=new OpenLayers.Layer.TileCache("IRSImagery", "https://bhuvan-ras2.nrsc.gov.in/cachebcg/", "bhuvan_img", 
		 {    
		serverResolutions: [.703125, .3515625, .17578125, .087890625, .0439453125, .02197265625, .010986328125, .0054931640625, .00274658203125, .001373291015625, .0006866455078125, .00034332275390625, .000171661376953125, 858306884765625e-19, 4291534423828125e-20, 21457672119140625e-21, 1072883605957e-17, 5364418029785e-18], isBaseLayer:!1, visibility:!1, attribution:"Indian Remote Sensing Satellites", transitionEffect:"resize", buffer:0, format:"image/jpeg"
		});
		basemap = new OpenLayers.Layer.WMS("basemap", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", 
				    {layers: "india3"}, {isBaseLayer: false,visibility:true, format:"image/jpeg"});
		admin_grouped = new OpenLayers.Layer.WMS("admin_grouped", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", 
						{layers: "basemap:admin_group", transparent: true},{transitionEffect:null,visibility:false});		
		terrainlayer = new OpenLayers.Layer.WMS("terrain", "https://bhuvan-ras2.nrsc.gov.in/mapcache?",  {layers: "ace2dem",transparent: true},{visibility:false} );
						
	hospital = new OpenLayers.Layer.WMS("sde_basin", "https://bhuvan-panchayat.nrsc.gov.in:8080/geoserver/sde/wms", {layers: "sde:basin",  transparent: true},
					{isBaseLayer:false, visibility:false, transitionEffect: "resize",'buffer':0});
					

		subbasin = new OpenLayers.Layer.WMS("subbasin", "https://bhuvan-panchayat.nrsc.gov.in:8080/geoserver/sde/wms", {layers: "sde:subbasin",  transparent: true},
					{isBaseLayer:false, visibility:false, transitionEffect: "resize",'buffer':0});
		
	layer5 = new OpenLayers.Layer.WMS("basemap", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", 
				    {layers: "india4"}, {isBaseLayer: false,visibility:false, format:"image/jpeg"});


layer6= new OpenLayers.Layer.WMS( "Hydrology",
                    "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", {layers: 'HYDROLOGY', transparent: true
}, {isBaseLayer:false,visibility:false} );

waterbodies_grouped = new OpenLayers.Layer.WMS("waterbodies_grouped", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", 
						{layers: "basemap:waterbody_DEM", transparent: true},{transitionEffect:null,visibility:false});

	map.addLayer(dummylayer);	
		map.addLayer(terrainlayer);
		map.addLayer(IRSlayer);
		map.addLayer(basemap);	
		map.addLayer(admin_grouped);
		map.addLayer(waterbodies_grouped);	
		 map.addLayer(layer5);	
map.addLayer(layer6);
		map.addLayer(hospital);
map.addLayer(subbasin);		
		watershed_grouped = new OpenLayers.Layer.WMS("watershed_grouped", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms/", 
						{layers: "cite:bhuvan_watershed", transparent: true},{minScale:108410.0, maxScale:54070.0,transitionEffect:null,visibility:false});							
	
		map.addLayer(watershed_grouped);
		
		redifflayer = new OpenLayers.Layer.WMS("Roadmap via Rediff", "http://immaps.rediff.com/wms", 
					  {layers: "overlay_en_1.0.0",transparent: true	},{visibility:false});		

		transportnetwork = new OpenLayers.Layer.WMS("bhuvantransportnetwork", "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", 
						{layers: "mmi:mmi_india", transparent: true},{transitionEffect:null,visibility:false}); 
	soi= new OpenLayers.Layer.WMS( "SOI Mosaic Roads",
                    "http://www.surveykshan.gov.in/india.mapdef?", { layers: 'Roads_AP_GDC,Roads_B_GDC,Roads_C_GDC,Roads_D_GDC,Roads_G_GDC,Roads_J_GDC,Roads_KL_GDC,Roads_K_GDC,Roads_MP_GDC,Roads_O_GDC,Roads_PHC_GDC,Roads_TNPANI_GDC,Roads_UK_WUP_GDC,Roads_WB_S_GDC,Railways_AP_GDC,Railways_B_GDC,Railways_C_GDC,Railways_D_GDC,Railways_G_GDC,Railways_J_GDC,Railways_KL_GDC,Railways_K_GDC,Railways_MP_GDC,Railways_O_GDC,Railways_PHC_GDC,Railways_TNPANI_GDC,Railways_UK_WUP_GDC,Railways_WB_S_GDC',transparent: true
					}, 
					//{minScale:54070.0,maxScale:5407.0,visibility:false,singleTile: true,ratio: 1}
					{minScale:55070.0,maxScale:2407.0,visibility:false,tileSize: new OpenLayers.Size(1536,768),'buffer':0}
					); 
   
	map.addLayer(transportnetwork);
	map.addLayer(soi);	
	map.addLayer(redifflayer);	
		
	//	AddLayer('vector:city_hq','base_town',urlArray3);
	
		var style = new OpenLayers.Style();    
		var styleMap = new OpenLayers.StyleMap({"default": style});
		measureControls = {
		line: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
			persist: true,
			handlerOptions: {
				layerOptions: {
					styleMap: styleMap
				}
			},
			eventListeners: {
				activate: function () {
					beginmeasure(1);
				},
				deactivate: function () {
					endmeasure();
				}
			}
		}),
		polygon: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
			persist: true,
			handlerOptions: {
				layerOptions: {
					styleMap: styleMap
				}
			},
			eventListeners: {
				activate: function () {
					beginmeasure(2);
				},
				deactivate: function () {
					endmeasure();
				}
			}
		})
	};
   		
	var mapdisplay = setDisplay();	
	if(mapdisplay == "NOARGS")
		map.setCenter(new OpenLayers.LonLat(77.56, 22.85), 9);
	else if(mapdisplay == "FALSE")
	{	
			//alert("Invalid Argument List in the URL");
	}	
	
	map.div.oncontextmenu=function nocontexMenu(evt){
		return false;}
		
		var ov = new OpenLayers.Layer.WMS("overview",    "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/", {
		layers: "india3"
	});	
	var options = 
	{   
		autoPan: true,
        layers: [ov],
		mapOptions:{maxResolution:0.087896025,numZoomLevels: 6,restrictedExtent: extent}		
		
    };	
    var ovControl = new OpenLayers.Control.OverviewMap(options);
	ovControl.size=new OpenLayers.Size(360,240);	
    map.addControl(ovControl);	
	 
		map.addControl(new OpenLayers.Control.LoadingPanel());
		addselectcontrol();	
			
					
	$("#radio3").click();
	map.setCenter(new OpenLayers.LonLat(77.56, 22.85), 9);
	
	var t1=window.innerHeight-195; //-160 
	var t2=t1-10;
	document.getElementById("lp").style.height = t2+"px";
	document.getElementById("mapdiv").style.height = t1+"px";
	document.getElementById("map").style.height = t1+"px";
 	
	set_source();
	
	modify=new OpenLayers.Control.ModifyFeature(vectorLayer); //To Edit/Modify the draw
	map.addControl(modify);	
	//For FP and  draw tool
	 rClick = new OpenLayers.Control.Click({
	eventMethods: {
		rightclick: function (e) {
		// rightpop(e); //29-10-15
			},
		click: function (e) {
		if(document.getElementById("rightpop")) //29-10-15
		rclosepopup();
			}
		}});
			oClick = new OpenLayers.Control.Click({
	eventMethods: {
		rightclick: function () {		
			map.events.unregister("click", map, myfunc);
			map.events.unregister("click", map, myfunc1);
			map.events.unregister("click", map, myfunc2);			
			document.getElementById('map').style.cursor='default';			
			this.deactivate();			
			var x=document.getElementById('startPageFrame');
			    x=(x.contentWindow||x.contentDocument);
			if(x.document)
			{  
			if(x.document.getElementById(drawid))
				x.document.getElementById(drawid).border='0';			
				removefeature();			
				removeimages();		
			}
			else {alert('problem');}
			modify.deactivate();
			popupControl.activate();
		
			rClick.activate();
			
		}
	}
});
	map.addControl(oClick);	
	map.addControl(rClick);	
rClick.activate();	
		userlyrinfo = new OpenLayers.Control.WMSGetFeatureInfo({
            url: 'https://bhuvan-gp1.nrsc.gov.in/bhuvan/shapefile/wms', 
            title: 'Identify features by clicking',
            queryVisible: true,
            eventListeners: {
                getfeatureinfo: function(evt) {
				
                    var popupId = evt.xy.x + "," + evt.xy.y;					
					var text;
                var match = evt.text.match(/<body[^>]*>([\s\States]*)<\/body>/);				
                if (match && !match[1].match(/^\s*$/)) {
                    text = match[1];					
                var popup = popups[popupId];
                if (!popup || !popup.map) {
                    popup = new OpenLayers.Popup.FramedCloud(popupId, map.getLonLatFromPixel(evt.xy), null, evt.text, null, true, function (evt) {
                        delete popups[this.id];
                        this.hide();
                        OpenLayers.Event.stop(evt);
                    });
                    popups[popupId] = popup;
                    map.addPopup(popup, true);
                }				
                popup.setContentHTML(popup.contentHTML);
                popup.show();
				}
				
                }
            }
        });
        map.addControl(userlyrinfo);	
	 
	 var Rule = new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.GREATER_THAN,
                    property: "count",
                    value: 1
                }),
                symbolizer: {
                    fillColor: "#8087ff",
                    fillOpacity: 1,           
                    strokeColor: '#2b2f76',                   
                    strokeOpacity:1,                    
                    strokeWidth: 1.2,
                    pointRadius:"${radius}",
                    label: "${count}",
                    labelOutlineWidth: 1,
                    fontColor: "#ffffff",
                    fontOpacity: 0.8,
                    fontSize: "10px"
                }
            });			
	var stylephotocluster = new OpenLayers.Style(null, {
                rules: [Rule],
				 context: {                       
                        radius: function(feature) {
                            var pix = 10;
                            if(feature.attributes.count) {
							  var count=feature.attributes.count;							 
							  pix=  2*(Math.log(count))+5;
                            }
                            return pix;
                        }
                    }
            });
	var stylephoto = new OpenLayers.Style({
				externalGraphic: "img/small.jpg",graphicHeight:16,
								graphicWidth:16
				} 				);
				
	var style3d = new OpenLayers.Style({
							}, {
						rules: [
							new OpenLayers.Rule({
								minScaleDenominator: 50000,
								symbolizer: {
								   externalGraphic: "/map//bhuvannew/img/3d/c6.png", graphicWidth: 16, graphicHeight: 16, graphicOpacity: 1, graphicZIndex: 1
								}
							})
						]
						});

	 var sql='12 12,12 12,12 12,12 12,12 12';

	
	kml_all[0]= new OpenLayers.Layer.Vector('clusterphotos', {
				'displayInLayerSwitcher':false,
				visibility:false,
                projection: map.displayProjection,
				strategies: [new OpenLayers.Strategy.Fixed()],	
				styleMap:  new OpenLayers.StyleMap(stylephotocluster),
				protocol: new OpenLayers.Protocol.HTTP({
                    url: "get/geojsonfpcluster.php?sql="+sql+"&category=POI&zoom="+-1,
                    format: new OpenLayers.Format.GeoJSON({
                        extractStyles: true,
                        extractAttributes: true
                    })
					
                })
				
      }); 
	map.addLayer(kml_all[0]);
	kml_all[1]= new OpenLayers.Layer.Vector('photos', {
				'displayInLayerSwitcher':false,
				visibility:false,
                projection: map.displayProjection,
				strategies: [new OpenLayers.Strategy.Fixed()],				
				protocol: new OpenLayers.Protocol.HTTP({
                    url: "get/geojsonfp.php?sql="+sql+"&category="+''+"&zoom="+0,
                    format: new OpenLayers.Format.GeoJSON({
                        extractStyles: true,
                        extractAttributes: true
                    })
					
                }),
				styleMap: new OpenLayers.StyleMap({
                      "default": stylephoto
                    
                })
      }); 
	map.addLayer(kml_all[1]);	 
	
	var stylepoi = new OpenLayers.Style({
				externalGraphic: "${getGraphic}",graphicHeight: 16,
								graphicWidth:16
				} , {
					context: {
							getGraphic: function(feature) {          
								if(feature.attributes.categoryid)
								   return "img/3d/"+feature.attributes.categoryid+".png";
								else 
								return "img/marker.png"; 
							}
					}}
				);
	var selectstylepoi = new OpenLayers.Style({
						externalGraphic: "${getGraphic}",graphicHeight: 24,
						graphicWidth:24
						} , {
						context: {
						  getGraphic: function(feature) {
							  if(feature.attributes.categoryid)
									return "img/3d/"+feature.attributes.categoryid+".png";
							else 
							 return "img/marker.png"; 
						  }
						}}
				);		
	
        var json_url="/2dresources/user_content/portalviewer2.php?sql="+sql+"&category=''&zoom="+map.getZoom()+"&username="+bhuvanusername;		 
		var vector_format = new OpenLayers.Format.GeoJSON({});
			var vector_protocol = new OpenLayers.Protocol.HTTP({
				url: json_url,
				format: vector_format
			});			
			var vector_strategies = [new OpenLayers.Strategy.Fixed()];                      
            kml_all[2]= new OpenLayers.Layer.Vector('Point Data',
			{
				protocol: vector_protocol,	
				strategies: vector_strategies,
				styleMap: new OpenLayers.StyleMap({
                      "default": stylepoi,
                    "select": selectstylepoi
                }),
				visibility:false
				
			});			
			map.addLayer(kml_all[2]);
			map.addLayer(vectorLayer);
			kml_all.push(vectorLayer);		
			addselectcontrol();	
			vectorLayer.events.on({
						"featureselected": onFeatureSelect1,
						"featureunselected": onFeatureUnselect1
					});	
			
			kml_all[0].events.on({
						"featureselected": onFeaturemessage,
						"featureunselected": onFeatureUnselect
					});
			kml_all[1].events.on({
						"featureselected": onFeaturephotoSelect,
						"featureunselected": onFeatureUnselect
					});
			kml_all[2].events.on({
						"featureselected": onFeatureSelectR,
						"featureunselected": onFeatureUnselect
					});
			
           				
		map.events.register( "moveend", map, moveChanged );
        userlyrinfo.activate();  
	//For FP and  draw tool ends
	//GIS Tools
	    var history = new OpenLayers.Control.NavigationHistory();
	map.addControl(history);
	history.activate();
	history.previous.title = "Go Back To Previous Extent";
	history.next.title = "Go To Next Extent";
	var rubberzoomin = new OpenLayers.Control.ZoomBox({
		title: "Zoom box: Zoom in an area by clicking and dragging."
	});
	var rubberzoomout = new OpenLayers.Control.ZoomBox({
        title: "Zoom box: Zoom out an area by clicking and dragging.",//,
        out: true,
		displayClass:'olControlZoomBoxout'
    });
	panel = new OpenLayers.Control.Panel();
	panel.addControls([rubberzoomin, rubberzoomout, new OpenLayers.Control.Navigation({
		title: "Use this tool to navigate or deactivate any other control in tool bar"
	}), new OpenLayers.Control.ZoomToMaxExtent({
		title: "Zoom To Initial Extent"
	}), new OpenLayers.Control.ZoomIn({
		title: "Fixed Zoom In"
	}), new OpenLayers.Control.ZoomOut({
		title: "Fixed Zoom Out"
	})]);
	panel.addControls([history.next, history.previous]);
	map.addControl(panel);
	panel.deactivate();	
	//GIS tools end
	//Measure control
		measureControls = {
		line: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
			persist: true,
			handlerOptions: {
				layerOptions: {
					styleMap: styleMap
				}
			},
			eventListeners: {
				activate: function () {
					beginmeasure(1);
				},
				deactivate: function () {
					endmeasure();
				}
			}
		}),
		polygon: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
			persist: true,
			handlerOptions: {
				layerOptions: {
					styleMap: styleMap
				}
			},
			eventListeners: {
				activate: function () {
					beginmeasure(2);
				},
				deactivate: function () {
					endmeasure();
				}
			}
		})
	};
    for (var key in measureControls) {
        var control = measureControls[key];
        control.events.on({
            "measure": handleMeasurements,
            "measurepartial": handleMeasurements
        });
        map.addControl(control);
    }
	//end measure controls
	
	creatediv("addcontent"); //29-10-15 onwards
	document.getElementById("login").style.display="inline";
	click = new OpenLayers.Control.Click2();
	map.addControl(click);	
	
	//For Proximity
	click_p = new OpenLayers.Control.Click3();
	map.addControl(click_p);

};//End of init

//Feature select/unselect
//Field Photographs
function onFeatureSelectR(event) {
var feature=event.feature
		selectedFeature = feature;		
		var attributes = feature.attributes;
		var popstr="<div style='font-size:10pt'><table border='0'>";
		popstr +="<tr><td colspan='2'><b>Message</b></td></tr>";										
		if(attributes.name)
			popstr +="<tr><td>"+attributes.name+"</td></tr>";
		
		if(attributes.username)
                             popstr += "<tr><td> <font color='red' >This information is posted by "+attributes.username+"</font></td></tr>";
		 if(attributes.photo)
                      popstr += "<tr><td><img src='/2dresources/user_content/upload/photos/"+attributes.photo+"' height='120' width='250'></img></td></tr>";	
		 if(attributes.posttime)
                              popstr += "<tr><td>Date of Creation: "+attributes.posttime+"</td></tr>";
                 popstr+="<tr><td>&nbsp;</td></tr>";
		 if(attributes.info)
                             popstr += "<tr><td width='250' valign='top'><i>Information : "+attributes.info+"</i></td></tr>";
						
		popstr +="</table></div>";
		popstr +="</table></div>";		
	var	popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), null, popstr, null, true);
		feature.popup = popup;                
		map.addPopup(popup);
	} 
	
 function selectFPAll()
{

	var checktoggle=false;   
	if(document.getElementById('fppluslevel0').style.display!="none")
	{
		checktoggle=document.getElementById('fpphotoplus').checked;
	
		}
	else
	{
		checktoggle=document.getElementById('fpphotominus').checked;
	
		}
	
  	var checkboxes = new Array();    
      	 checkboxes = document['fpform'].getElementsByTagName('input');
   	 for (var i=0; i<checkboxes.length; i++)  {
		if (checkboxes[i].type == 'checkbox') {
      	 checkboxes[i].checked = checktoggle;        
		}        
	}	
	
	if(checktoggle)
	{
	
	 kml_all[0].setVisibility(true);
	 
	 }
	else
	{
	
	 var dummyextent='12 12,12 12,12 12,12 12,12 12';		
	 url="get/geojsonfpcluster.php?sql="+dummyextent+"&category=POI&zoom="+-1;
					kml_all[0].refresh({url:url});
					kml_all[0].setVisibility(false);
	 }
	FP_changeurl();
	
	
}

//Display of Field PhotoGraphs
function FP_changeurl()
 { 
		
		var category="";var checkboxes = new Array();   var url=''; 
		checkboxes = document['fpform'].getElementsByTagName('input');
		var length=checkboxes.length;
		for (var i=0; i<length; i++) {
				if (checkboxes[i].type == 'checkbox' && checkboxes[i].checked){				
					 if(checkboxes[i].value!='on')               
						category=category+""+ checkboxes[i].value+",";
				}         
			}
		if(category=='')
		{ 		
				var dummyextent='12 12,12 12,12 12,12 12,12 12';		
				url="get/geojsonfp.php?sql="+dummyextent+"&category="+category+"&zoom="+0;
				kml_all[1].refresh({url:url});
				kml_all[1].setVisibility(false);			
				if(kml_all[0].getVisibility())
				{
					url="get/geojsonfpcluster.php?sql="+dummyextent+"&category=POI&zoom="+-1;
					kml_all[0].refresh({url:url});
					kml_all[0].setVisibility(false);
				}		
		}
		else
		{		  
			kml_all[1].setVisibility(true);				
			category=category.slice(0,-1);
			var b11 = map.getExtent().toArray();		
			var	extent =""+b11[0]+" "+b11[1]+","+b11[0]+" "+b11[3]+","+b11[2]+" "+b11[3]+","+b11[2]+" "+b11[1]+","+b11[0]+" "+b11[1]+"";					
			url="get/geojsonfp.php?sql="+extent+"&category="+category+"&zoom="+map.getZoom();			
			kml_all[1].refresh({url:url});          		
			if(checkboxes[length-1].checked)
			{
					kml_all[0].setVisibility(true);		
					url="get/geojsonfpcluster.php?sql="+extent+"&category="+category+"&zoom="+map.getZoom();
					kml_all[0].refresh({url:url});
			}
		}
			
 
 } 
 

 function clusterlayer(flag)
 {
  var url='';	
  if(flag.checked)
  {
		kml_all[0].setVisibility(true);
		var category="";var checkboxes = new Array();    
		checkboxes = document['fpform'].getElementsByTagName('input');
		for (var i=0; i<checkboxes.length; i++) {
				if (checkboxes[i].type == 'checkbox' && checkboxes[i].checked){
				
					 if(checkboxes[i].value!='on')               
						category=category+""+ checkboxes[i].value+",";
				}         
			}
	 
		var b11 = map.getExtent().toArray();	
		var	extent=""+b11[0]+" "+b11[1]+","+b11[0]+" "+b11[3]+","+b11[2]+" "+b11[3]+","+b11[2]+" "+b11[1]+","+b11[0]+" "+b11[1]+"";
		if(category=='')
			url="get/geojsonfpcluster.php?sql="+extent+"&category=POI&zoom="+-1;
		else
		{
			category=category.slice(0,-1);
			url="get/geojsonfpcluster.php?sql="+extent+"&category="+category+"&zoom="+map.getZoom();
		}
		kml_all[0].refresh({url:url}); 
  }
  else
  {
		var dummyextent='12 12,12 12,12 12,12 12,12 12';	
		url="get/geojsonfpcluster.php?sql="+dummyextent+"&category=POI&zoom="+-1;
		kml_all[0].refresh({url:url});
		kml_all[0].setVisibility(false);
	
  }
 
 }
 function onFeaturemessage (event){

var feature = event.feature, Point = feature.geometry.getBounds().getCenterLonLat(),contents='';
	
	if (feature) {
	var size=0;
	 switch(map.getZoom())
	 {
		case 0:size='2Deg * 2Deg ';
		       break;
		case 1:size='1Deg * 1Deg';
		       break;
		case 2:size='30Min * 30Min';
		       break;
		case 3:size='15Min * 15Min';
		       break;
		case 4:size='3Min * 3Min';
		       break;
		case 5:size='2Min * 2Min';
		       break;
		case 6:size='1km * 1km';
		       break;		   
	 
	 }
	 contents += "There are multiple records in the neighbourhood("+size+")<br>of this location.The position of this location randomly placed.<br>Please increase zoom further or click&nbsp;<a href='javascript:increase_zoom(" +Point.lon + "," + Point.lat +")'>Zoom-In</a>";
	 
	 var popup = new OpenLayers.Popup.FramedCloud("chicken", Point, new OpenLayers.Size(100, 100), contents, null, !0);
	  feature.popup = popup;
	map.addPopup(popup)
	
	}
	
	
	}
function increase_zoom(lon, lat){
	var zoom=map.getZoom()
	zoom=zoom+1;
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	/* for (var i = 0; i < map.popups.length; i++) {
            map.removePopup(map.popups[i]);
        }*/

}

function onFeaturephotoSelect(event) {
		var feature=event.feature;
		var attributes = feature.attributes;	
		var popstr="<div style='font-size:10pt'><center><h4 align='center'><b>"+attributes.theme+"</b></h4>";
		var flag=1;		
		if(attributes.attachphoto)
		{
			 flag=0;
			 k=attributes.attachphoto.split(',');			 
			 popstr += "<img src='/2dresources/"+k[0]+"' onerror= \"this.style.height='0';this.style.width='0';this.style.visibility='hidden'\" height='230' width='230'></img>";	
		}		 
        popstr+="<table width='300' border='1'>";
		if(flag)
			 popstr += "<tr ><td ><b>Photograph</b>&nbsp</td><td>Not available </td></tr>";					  
		if(attributes.des)
             popstr += "<tr><td ><b>Information</b>&nbsp</td><td>"+attributes.des+"<br></td></tr>";	 
		if(attributes.createdtime)
             popstr += "<tr><td><b>Posted Time</b>&nbsp</td><td>"+attributes.createdtime+"</td></tr>";							  
		if(attributes.dir!='undefined')
		{
			 var k=parseFloat(attributes.dir); 
             popstr += "<tr><td ><b>Bearing</b>&nbsp</td><td>"+k.toFixed(2)+"</font></td></tr>";
		}
		if(attributes.contributor)
             popstr += "<tr><td ><b>Posted By</b>&nbsp</td><td>"+attributes.contributor+"</font></td></tr>";							 
		 popstr +="</table>";						 
		popstr +="</center></div>";		
		var	popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(100, 100), popstr, null, true);
		feature.popup = popup;                
		map.addPopup(popup);	
	
}


 
function onFeatureSelect1(evt) {
		var feature=evt.feature;
		var x=document.getElementById('startPageFrame');
		x=(x.contentWindow||x.contentDocument);
		if(x.document)
		{		
			x.document.getElementById('d'+feature.id).style.border='1px solid black';			
		}
		else
            alert('problem loading document');		
		
            //selectedFeature = feature;
			var info=feature.geometry.getArea();	

			if(info)
			{
			 info=getunits(info,'m','Area');
			 info=info/1000000; 
             popup = new OpenLayers.Popup.FramedCloud("chicken", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     "<div style='font-size:.8em'>Feature " + feature.id + "<br> Area : " + info.toFixed(3) + "km<sup>2</" + "sup></div>",
                                     null, true);			

			}
			else{
					info=feature.geometry.getLength();					
					info=getunits(info,'m','Length');
					info=info/1000; 
					var popup = new OpenLayers.Popup.FramedCloud("chicken", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                           "<div style='font-size:.8em'>Feature " + feature.id +"<br> Length : " + info.toFixed(3) + "km</div>",null, true);
				
			} 
            feature.popup = popup;
            map.addPopup(popup);
}	
//Field photos end
//draw tool	
//Draw

var lonlat, prevpoint, pointList=[], style_green, lineFeature, polygonFeature, fid, feature_no = 0,
feature_vertices;

function desel_mapnavig()
{
panel.deactivate();
tools_ctr=0;
}


function point_add(id) {
	removefeature();
	removeimages(); 
	fid =id;
	pointList = [];
	desel_mapnavig();
	map.events.register("click", map, myfunc);
	map.events.unregister("click", map, myfunc1);
	map.events.unregister("click", map, myfunc2)
}
function polygon_add(id, cv) {
	style_green = {
		strokeColor: "#" + cv,
		fillColor: "#FFFFFF",
		fillOpacity: 0.4
	};	
	oClick.activate();	
	rClick.deactivate();
	removefeature();
	removeimages();
	redostack=[];
	fid = id;
	pointList = [];
	polygonFeature = null;
	desel_mapnavig();
	map.events.unregister("click", map, myfunc2);
	map.events.register("click", map, myfunc2);
	map.events.unregister("click", map, myfunc1);
	map.events.unregister("click", map, myfunc)
}
function line_add(id, cv) {
	style_green = {
		strokeColor: "#" + cv
	};	
	oClick.activate();
	rClick.deactivate();
	removefeature();
	removeimages();
	redostack=[];
	fid = id;
	lineFeature = null;
	pointList = [];
	desel_mapnavig();
	map.events.unregister("click", map, myfunc1);
	map.events.register("click", map, myfunc1);
	map.events.unregister("click", map, myfunc2);
	map.events.unregister("click", map, myfunc)
}
function myfunc1(evt) {
	if(pointList.length==1)
	{
	redostack=[];
	}
	lonlat = map.getLonLatFromViewPortPx(evt.xy);
	var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	pointList.push(point);
	lineFeature && vectorLayer.removeFeatures([lineFeature]);
	lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList), null, style_green);
	lineFeature.id = fid;
	vectorLayer.addFeatures([lineFeature]);	
	if(pointList.length==2)
	 stackstatus();
}
function myfunc2(evt) {
	if(pointList.length==1)
	{
	redostack=[];
	}
	lonlat = map.getLonLatFromViewPortPx(evt.xy);
	var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	pointList.push(point);
	pointList.push(pointList[0]);
	point = new OpenLayers.Geometry.LinearRing(pointList);
	polygonFeature && vectorLayer.removeFeatures([polygonFeature]);
	polygonFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([point]), null, style_green);
	polygonFeature.id = fid;
	vectorLayer.addFeatures([polygonFeature]);
	pointList.pop(pointList[0]);	
	if(pointList.length==2)
	   stackstatus();
}
function myfunc(evt) {
	lonlat = map.getLonLatFromViewPortPx(evt.xy);
	a = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	pointList.push(a);
	a = new OpenLayers.Feature.Vector(a, {
		id: fid
	},
	{
		externalGraphic: "img/marker.png",
		graphicHeight: 17,
		graphicWidth: 16
	});
	a.id = fid;
	vectorLayer.addFeatures([a]);
	map.events.unregister("click", map, myfunc);
	document.getElementById('map').style.cursor='default';
	var x=document.getElementById('startPageFrame');
	x=(x.contentWindow||x.contentDocument);
	if(x.document)	
	{		x. document.getElementById('shape'+fid).style.display="";
	        x. document.getElementById('delete'+fid).style.display="";
			x.document.getElementById(parent.drawid).border=0;
	}	
	
}
function shape(e) {
    try {
        feature_vertices = (new OpenLayers.Format.WKT).write(vectorLayer.getFeatureById(e.toString())), load_video("#shape", "https://bhuvan-gp1.nrsc.gov.in/shape/script_exe/shp.php?id=en-us", "Create shape file", "440", "195")
    } catch (e) {
        alert(e)
    }
}

function undo(type)
{		
		if(pointList.length>1)
		{
			var point=pointList.pop();
			redostack.push(point);   
			if(type=='line')
			{      
				lineFeature && vectorLayer.removeFeatures([lineFeature]);
				lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList), null, style_green);
				lineFeature.id = fid;	
				vectorLayer.addFeatures([lineFeature]);
			}
			else
			{			
			    pointList.push(pointList[0]);			
				point = new OpenLayers.Geometry.LinearRing(pointList);
				polygonFeature && vectorLayer.removeFeatures([polygonFeature]);			
				polygonFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([point]), null, style_green);
				polygonFeature.id = fid;
				vectorLayer.addFeatures([polygonFeature]);
				pointList.pop(pointList[0]);	
			}			
			stackstatus();			
}	
}
function stackstatus()
{
if(redostack.length==1)
{         
			  var x=document.getElementById('startPageFrame');
				x=(x.contentWindow||x.contentDocument);
				if(x.document)
				{
					var im=x.document.getElementById('redo'+fid);						
					im.src='img/redo_new.gif';			
				}
				else {alert('problem');}
}
if(redostack.length==0)
{
			  var x=document.getElementById('startPageFrame');
				x=(x.contentWindow||x.contentDocument);
				if(x.document)
				{  

					var im=x.document.getElementById('redo'+fid);
						im.src='img/redo_new_grey.gif';
						
				}
				else {alert('problem');}

}
if(pointList.length==2)
{
  
              var x=document.getElementById('startPageFrame');
				x=(x.contentWindow||x.contentDocument);
				if(x.document)
				{  
			
					
					var im=x.document.getElementById('undo'+fid);
					im.src='img/undo_new.gif';			
				}
				else {alert('problem');}			        

		
  }
  if(pointList.length==1)
  {
			  var x=document.getElementById('startPageFrame');
				x=(x.contentWindow||x.contentDocument);
				if(x.document)
				{  
			
					
					var im=x.document.getElementById('undo'+fid);
						
					im.src='img/undo_new_grey.gif';			
				}
				else {alert('problem');}
 }

}
function redo(type)
{
   
    if(redostack.length){
	var point=redostack.pop();		
	pointList.push(point);

  if(type=='line')
  {
	lineFeature && vectorLayer.removeFeatures([lineFeature]);
	lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList), null, style_green);
	lineFeature.id = fid;	vectorLayer.addFeatures([lineFeature]);
  }
  else
  {
    
    pointList.push(pointList[0]);
	point = new OpenLayers.Geometry.LinearRing(pointList);
    polygonFeature && vectorLayer.removeFeatures([polygonFeature]);
	polygonFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([point]), null, style_green);
	polygonFeature.id = fid;
	vectorLayer.addFeatures([polygonFeature]);
	pointList.pop(pointList[0])
  }
  stackstatus();
 
  }
  

}

function features_modify(type)
{
	document.getElementById('map').style.cursor='crosshair';
   removefeature();
   removeimages();
    for (var key in measureControls) {
        var control = measureControls[key];
		 control.deactivate();
       }
       
  
	   var x=document.getElementById('startPageFrame');
	   x=(x.contentWindow||x.contentDocument);
	   if(x.document)
	   {  
			x.document.getElementById(drawid).border='0';
	   }   
    
	drawid=type;	
    popupControl.deactivate();
	
		
	map.events.unregister("click", map, myfunc1);
	map.events.unregister("click", map, myfunc2);
	map.events.unregister("click", map, myfunc);	
    modify.activate();	
	oClick.activate();
	rClick.deactivate();

}

function removeimages()
{
var x=document.getElementById('startPageFrame');
			    x=(x.contentWindow||x.contentDocument);
			if(x.document)
			{  
				
			var im=x.document.getElementById('undo'+fid);
			if(im){
			im.parentNode.removeChild(im);
			im=x.document.getElementById('redo'+fid);
			im.parentNode.removeChild(im);
			}
			
			im=x.document.getElementById('delete'+fid);
			if(im){
             im.style.display="";
             x.document.getElementById('shape'+fid).style.display="";
             }			 
			}
			else {alert('problem');}

}
function removefeature()
{
   
   if(pointList.length==0)
	{
			var x=document.getElementById('startPageFrame');
			    x=(x.contentWindow||x.contentDocument);
			if(x.document){
	
				var im=x.document.getElementById('d'+fid);
			    if(im)
				im.parentNode.removeChild(im);	
				//alert('You have not created feature');	
				}			
	}

}

function onFeatureSelect1(evt) {
		var feature=evt.feature;
		var x=document.getElementById('startPageFrame');
		x=(x.contentWindow||x.contentDocument);
		if(x.document)
		{		
			x.document.getElementById('d'+feature.id).style.border='1px solid black';			
		}
		else
            alert('problem loading document');		
		
            //selectedFeature = feature;
			var info=feature.geometry.getArea();	

			if(info)
			{
			 info=getunits(info,'m','Area');
			 info=info/1000000; 
             popup = new OpenLayers.Popup.FramedCloud("chicken", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     "<div style='font-size:.8em'>Feature " + feature.id + "<br> Area : " + info.toFixed(3) + "km<sup>2</" + "sup></div>",
                                     null, true);			

			}
			else{
					info=feature.geometry.getLength();					
					info=getunits(info,'m','Length');
					info=info/1000; 
					var popup = new OpenLayers.Popup.FramedCloud("chicken", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                           "<div style='font-size:.8em'>Feature " + feature.id +"<br> Length : " + info.toFixed(3) + "km</div>",null, true);
				
			} 
            feature.popup = popup;
            map.addPopup(popup);
}	
function getunits(value,units,display)
{		
		var geomUnits=map.getUnits();
		var inPerDisplayUnit = OpenLayers.INCHES_PER_UNIT[units];
        if(inPerDisplayUnit) {
            var inPerMapUnit = OpenLayers.INCHES_PER_UNIT[geomUnits];
			if(display=='Area')
            value *= Math.pow((inPerMapUnit / inPerDisplayUnit), 2);
			else
			value *= (inPerMapUnit / inPerDisplayUnit);
        }
        return value;	
}		


function onFeatureUnselect1(evt){
var feature=evt.feature;
if(feature){		
		var x=document.getElementById('startPageFrame');
		x=(x.contentWindow||x.contentDocument);
		if(x.document)		{  
			x.document.getElementById('d'+feature.id).style.border='0';			
		}
		else
            alert('problem loading document');      
		map.removePopup(feature.popup);
         feature.popup.destroy();
         feature.popup = null;}
 }	
//Feature select/unselect ends for Draw tool and field photos
function moveChanged () {
		var no=map.getZoom();
		var viewtype = $('input[name=radio1]:checked','#radio').val();
		
		if(viewtype!='m' && viewtype!='t'&&(document.getElementById('Temporalimg').src).match("img/clockstop.png")=='img/clockstop.png')
		{	 
				//document.getElementById('Temporalimg').src='img/clockstop.png';
				document.getElementById('temporaldiv').style.display='block';
			    changeurltemporal();
		}
		if(kml_all[1].getVisibility()||kml_all[0].getVisibility())
		{
			FP_changeurl();	 
			
        }	
		if(kml_all[2].getVisibility())
			changeurl();
			//alert(map.popups.length);
		
		/*for (var i =map.popups.length-1; i>=0; i--) {
            map.removePopup(map.popups[i]);
        } */
			
} 
function setDisplay()
	{
		var path = location.href;
        var data = new Array();
		var flag = "FALSE";
        data = path.split('?');		
		if (data.length == 1)
		{
			return "NOARGS";
		}
		else if (data.length > 1 && (data[1].search('l') != -1)	&& (data[1].search('b') != -1) && (data[1].search('r') != -1) && (data[1].search('t') != -1))
		{
			flag = setZoom();
		}
		else if(data.length > 1 && (data[1].search(',') != -1) && ((data[1].split(',')).length == 3))
		{		
			
			flag = setCent();
		}
		else if(data.length > 1 && (data[1].search('toolid') != -1))
		{
		flag="NOARGS";
		services("usrtasks/Ocean_services/pfz.php",1);
		}
		return flag;
}

function setZoom()
{
		var url = window.location.href;
		uparts = url.split("?");		
		var query = uparts[1]; 
		var vars = query.split("&");
		var l,b,r,t;		
		try
		{
			var value = "";
			for (i=0;i<5;i++)
			{
				var parts = vars[i].split("=");
		
				if (parts[0] == 'l' && i == 0)
					l = parts[1];
				else if (parts[0] == 'b' && i == 1)
					b = parts[1];
				else if (parts[0] == 'r' && i == 2)
					r = parts[1];
				else if (parts[0] == 't' && i == 3)
					t = parts[1];
				else if (parts[0] == "val" && i == 4)
					place = parts[1];
				else
					return "FALSE";
			}
			place=place.split(',');
		//alert(place[1]);
hydriflag=parseInt(place[1]);

		
			if(hydriflag)
{

document.getElementById('baseadmin').style.border='0';
document.getElementById('basehydro').style.border='solid 1px #000000';

}
else
{
document.getElementById('baseadmin').style.border='solid 1px #000000';
document.getElementById('basehydro').style.border='0';
}
	setbaselayer(place[0]);
			var bounds = new OpenLayers.Bounds(l,b,r,t);
			map.zoomToExtent(bounds, true);
			return "BOUNDS";
		}
		catch(e)
		{
			alert(e);
			return "FALSE";
		}
}


function setCent()
{
		
try {
			var path = location.href;
			var data = new Array();
			data = path.split('?');
			var data1 = data[1];
			var data2 = data1.split(',');	
			var level;			
			if (data2[0] <= 102 && data2[0] >= 66 && data2[1] <= 40 && data2[0] >= 6  ){		
			if (data2[2] <= 6691115.68) {
				level = 0;
				}
			if (data2[2] <= 5097806.68) {
				level = 1;
			
			}
			if (data2[2] <= 3504497.68) {
				level = 2;
			
			}
			if (data2[2] <= 1911188.68) {
				level = 3;
				
			}
			if (data2[2] <= 317879) {
				level = 4;
				
			}
			if (data2[2] <= 248595.25) {
				level = 5;
				
			}
			if (data2[2] <= 179312.25) {
				level = 6;
			
			}
			if (data2[2] <= 110029.25) {
				level = 7;
		
			}
			if (data2[2] <= 40746) {
				level = 8;
				
			}
			if (data2[2] <= 3500.573318) {
				level = 9;
				
			}				
			map.setCenter(new OpenLayers.LonLat(data2[0], data2[1]), level);			
			}
			else 			
				map.setCenter(new OpenLayers.LonLat(81.6, 22.5), 0);		
			return "CENTRE";
		} 
		
		catch (e)
		{
		
			map.setCenter(new OpenLayers.LonLat(81.6, 22.5), 0);
			return "CENTRE1";
		}
	}
//send mail
function sendMail()
{

        var place = "place";        
        var bstr = getBounds();        
        var url = window.location.href;		
		var newurl = null;
        if(url.charAt(url.length-1) == '#')
            newurl = url.slice(0,url.length-1);
        else
            newurl = url;   	
        newurl=newurl.split('?');
        newurl=newurl[0];        	
        var maillink  = newurl+"?"+bstr+"&val="+place;
        var subj = "Hi%0D%0A%0AI want to share this service on Bhuvan: "+pagetitle+" with you.%0D%0AFollow the following link:%0D%0A%0A";
        var mailto_link="mailto:?subject=Bhuvan: "+pagetitle+" %20Share this Link&body="+subj+""+escape(maillink)+"%0D%0A%0AThanks";

        try
        {
            win = window.open(mailto_link,'emailWindow');
            if(win && win.open && !win.closed)
            win.close();
        }
        catch(e)
        {
            alert("No Mail Client");
        }
 }
function getBounds()
{
		var bl = new Array();		
		var bounds = new OpenLayers.Bounds();
		bounds = map.getExtent();
		bl = bounds.toArray(); 
		var bstr =	"l="+bl[0]+"&b="+bl[1]+"&r="+bl[2]+"&t="+bl[3];
		return bstr;
}
//end 

//WMS Manager
		var urlmain;
		var input;
		var userurl="";
		var list="";
		var listheader="";
		var listcontents="";				
		function getXMLHTTP()
		{ 
			var xmlhttp=false;	
			try {
				xmlhttp=new XMLHttpRequest();
			}
			catch(e){		
				try
				{			
					xmlhttp= new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch(e)
				{
					try
					{
						xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
					}
					catch(e1)
					{
						xmlhttp=false;
					}
				}
			}
			return xmlhttp;
		}
	
		function wmsLog(url, inp)
		{		
			var strURL="./usrtasks/wms/wmsLog.php?url="+encodeURIComponent(url)+"&inp="+inp;
			var req = getXMLHTTP();
			if (req)
			{
				req.onreadystatechange = function()
				{
					if (req.readyState == 4)
					{
						if (req.status == 200) {						
							//document.getElementById('layersdiv').innerHTML=req.responseText;						
						} else {
							alert("Please try again Server might be busy...");
						}
					}				
				}			
				req.open("GET", strURL, true);
				req.send(null);
			}		
		}
		
		function addWMSRequest(url)
		{		
			var newurl = userurl.split('?');
			var strURL="./usrtasks/wms/addWMS.php?url="+encodeURIComponent(newurl[0])+"&ver=1.1.1";
			var req = getXMLHTTP();
			if (req)
			{
				req.onreadystatechange = function() {
						if (req.readyState == 4) {
						// only if "OK"
						if (req.status == 200) {						
							document.getElementById("savewms").style.display = 'none';
							document.getElementById('msg').style.display='inline';
							document.getElementById('msg').innerHTML = '<span  style="color:#0000FF; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Thankyou for your interest in sharing the WMS Services with community</span>';
						} else {
							alert("Please try again Server might be busy...");
						}
					}				
				}			
				req.open("GET", strURL, true);
				req.send(null);
			}		
		}
		
		function isUrl(s)
		{
			var regexp = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
			return regexp.test(s);
		}
		
		var resflag = 0;
		var urls = new Array();
		var uc = 0;
		var stVar;		
		function getLayers()
		{	
			document.getElementById('msg').style.display='none';
			document.getElementById("savewms").style.display = 'none';
			document.getElementById('msg').style.display='inline';
			document.getElementById('msg').innerHTML = '<span  style="color:#0000FF; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Loading...Please wait</span>';
			document.getElementById("loadLayers").disabled = true;
			
			if(input != "list")
			{
				if(document.getElementById('urlinp').value == "")
				{
					document.getElementById("savewms").style.display = 'none';
					document.getElementById('msg').style.display='inline';
					document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Please Input Valid URL</span>';
					document.getElementById("loadLayers").disabled = false;
					return;
				}
				
				var wmsurl = document.getElementById('urlinp').value;
				var capurl = wmsurl.split('?');
				var newurl = capurl[0]+"?service=WMS&request=GetCapabilities";
				
				userurl = wmsurl;
				urlmain = wmsurl;
				
			}
			else 
			{
			
				if(document.getElementById('catalogue').value == "")
				{
					document.getElementById("savewms").style.display = 'none';
					document.getElementById('msg').style.display='inline';
					document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Please select WMS Provider from List</span>';
					document.getElementById("loadLayers").disabled = false;
					return;
				}
				var wmsurl = document.getElementById('catalogue').value;
				
				var newurl = wmsurl;
				urlmain = wmsurl
			}
			
			var strURL="select * from xml where url='"+newurl+"'";
			var lyrs;
		
			var wmslyrs = new OpenLayers.Layer.Vector("Vectors", {
							projection: new OpenLayers.Projection("EPSG:4326"),
							strategies: [new OpenLayers.Strategy.Fixed()],
							protocol: new OpenLayers.Protocol.Script({
								url: "http://query.yahooapis.com/v1/public/yql",
								params: {
									q: strURL
								},
								format: new OpenLayers.Format.XML(),
								parseFeatures: function(data) {
									clearTimeout(stVar);
									resflag = 1;
									lyrs = data.results;
									listLayers(lyrs);
								}
							})
						});	
							
						
			map.addLayers([wmslyrs]);	
			resflag = 0;
			stVar = setTimeout(enableLL, 60000);
		}
				
		
		function enableLL()
		{
			if(resflag == 0)
			{
				document.getElementById("loadLayers").disabled = false;
			
				document.getElementById("savewms").style.display = 'none';
				document.getElementById('msg').style.display='inline';
				document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* No Layers are listed, Please Check URL once again</span>';
				return;
			}
		}
		
		function listLayers(response)
		{
			var mapurl = urlmain.split('?');
			var format = new OpenLayers.Format.XML();
			
			document.getElementById("loadLayers").disabled = false;
			
			if(response != "")
			{
				var resnew = "<?xml version='1.0' encoding='UTF-8'?>"+response;
				var resxml = format.read(resnew);
				
				if((resxml.getElementsByTagName('Service')) && (resxml.getElementsByTagName('Service').length > 0))
				{
					var stype = resxml.getElementsByTagName('Service');
					if((stype[0].getElementsByTagName('Name')[0].firstChild.nodeValue).match("WMS") == "WMS")
					{
						var CAPformat = new OpenLayers.Format.WMSCapabilities();
						var cap = CAPformat.read(resxml);
					   	if(cap.capability != null && cap.capability.layers.length > 0)
						{
							document.getElementById('msg').style.display='none';
							if(list == "")
							{
								listheader = "<div align='center' class='tableborder'>";
								listheader += "<table id='tabbed' border=1 cellspacing=0 cellpadding=0 width='80%' style='padding:5px' bgcolor='#FBFBEF'>";
								listheader += "<tr style ='font-family:arial; font-size:10pt; font-weight:bold; background-color:FAF8CC'><td style='text-align:center' height='12'>Overlay</td><td style='text-align:center' height='12'>Layername</td></tr>"; 
							}
							if(input == "user")
								document.getElementById("savewms").style.display = 'inline';
								document.getElementById('userurl').innerHTML = '<center><span  style="font-family:Arial, Helvetica, sans-serif; font-size:8pt;">WMS URL: '+userurl+'</span></center>';
						
							wmsLog(mapurl[0], input);
						}
						else
						{
							if(input == "user")
							{	
								document.getElementById("savewms").style.display = 'none';
								document.getElementById('msg').style.display='inline';
								document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* No Layers are listed, Please Check URL and try again</span>';
								return;
							}			
							else if(input == "list")
							{	
								document.getElementById('msg').style.display='inline';
								document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* No Layers are listed, Please try again</span>';
								return;
							}			
						}
					
						var newcontents = "";
						newcontents +="<tr style ='font-family:arial; font-size:8pt; background-color:FAF8CC'><td colspan='2' height='10' style ='text-align:center'> &nbsp "+mapurl[0]+"</td></tr>";
						
						urls[uc] = mapurl[0];
						uc ++;
						
						for (var i=0; i<cap.capability.layers.length; i++)
						{
							var layer_wms = cap.capability.layers[i];
							var chkid = "WMS_"+uc+"_"+layer_wms.name;
							var lyrname = layer_wms.name;
							newcontents +="<tr style ='font-family:arial; font-size:9pt; background-color:BBCCEE'><td height='10'  style ='text-align:center'><input type='checkbox' id='"+chkid+"' value='"+chkid+"' onclick='if(this.checked) {addWMSLayer(\""+lyrname+"\", \""+mapurl[0]+"\", \"image/png\", \"ESPG:4326\", \""+uc+"\");} else {removeWMSLayer(\""+lyrname+"\", \""+uc+"\");}'></td><td height='10' style ='text-align:left'> &nbsp "+lyrname+"</td></tr>";
						}
							
						if(listcontents == "")
						{
							listcontents = newcontents;
							list = listheader + listcontents;
						}
						else 
						{
							var temp = listcontents;
							listcontents = newcontents + temp;
							list = listheader + listcontents;
						}
						document.getElementById("layerlist").style.display = 'inline';
						document.getElementById("layerlist").innerHTML = list;
						
						checkAllLayers()
					
					}//ifOGC:WMS
					else
					{
						if(input == "user")
						{	
							document.getElementById("savewms").style.display = 'none';
							document.getElementById('msg').style.display='inline';
							document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Not a valid WMS URL, Please try again</span>';
							return;
						}			
						else if(input == "list")
						{	
							document.getElementById('msg').style.display='inline';
							document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Not a valid WMS URL, Please try again</span>';
							return;
						}			
					}
				}//ifservice
				else
				{
					if(input == "user")
					{	
						document.getElementById("savewms").style.display = 'none';
						document.getElementById('msg').style.display='inline';
						document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Not a valid WMS URL, Please try again</span>';
						return;
					}			
					else if(input == "list")
					{	
						document.getElementById('msg').style.display='inline';
						document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* Not a valid WMS URL, Please try again</span>';
						return;
					}			
				}
			}//ifXML
			else
			{
				if(input == "user")
				{	
					document.getElementById("savewms").style.display = 'none';
					document.getElementById('msg').style.display='inline';
					document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* No Layers are listed, Please Check URL and try again</span>';
					return;
				}			
				else if(input == "list")
				{	
					document.getElementById('msg').style.display='inline';
					document.getElementById('msg').innerHTML = '<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:9pt; font-weight:bold;">* No Layers are listed, Please try again</span>';
					return;
				}			
			}
		}
		
		function addWMSLayer(lyrname, lyrurl, format, proj, uc)
		{
			var newurl = lyrurl+"?service=WMS&version=1.1.1&request=GetMap";
			var wmslyr = new OpenLayers.Layer.WMS('WMS_'+uc+'_'+lyrname, newurl, {layers: lyrname, transparent:true, format: 'image/png'},{isBaseLayer:false});
			map.addLayer(wmslyr);
		}
		
		
		function checkAllLayers()
		{
			var l = map.layers;
			for (var i = l.length ; i > 0; i--)
			{
				if ((l[i-1].name).match("WMS_") == "WMS_")  
				{
					var chkid = l[i-1].name;
					if((document.getElementById(chkid)) && !(document.getElementById(chkid).disabled))
					{
						if(!(document.getElementById(chkid).checked))
							document.getElementById(chkid).checked = true;
					}
				}
			}
		}
		
		function removeWMSLayer(lyrname, uc)
		{
			lyrname = 'WMS_'+uc+'_'+lyrname;
			var l = map.layers;
			for (var i = 0; i < l.length; i++)
			{
				if (l[i].name == lyrname)  
				{
					map.removeLayer(l[i]);
					return
				}
			}
		}
		
		function removeAllLayers()
		{
			var l = map.layers;
			for (var i = l.length ; i > 0; i--)
			{
				if ((l[i-1].name).match("WMS_") == "WMS_")  
				{
					var chkid = l[i-1].name;
					map.removeLayer(l[i-1]);
					if((document.getElementById(chkid)) && !(document.getElementById(chkid).disabled))
					{
						if(document.getElementById(chkid).checked)
							document.getElementById(chkid).checked = false;
					}
				}
			}
		}
		
		function clearList()
		{
			list = "";
			listheader = "";
			listcontents = "";
			document.getElementById("layerlist").style.display = 'none';
			removeAllLayers();
		}
		
		function setWMS(inp)
		{
			document.getElementById('msg').style.display='none';
						
			if(inp == "UserURL")
			{
				input = "user"
				document.getElementById('catalogue').disabled = true;
				document.getElementById('urlinp').disabled = false;
			}
			if(inp == "Catalogue")
			{
				input = "list"
				document.getElementById('urlinp').disabled = true;
				document.getElementById('catalogue').disabled = false;
				document.getElementById("savewms").style.display = 'none';
			}
		}
		
		function loadwmsmgr(name, video, tit, w, h)
		{
			wmsmgrdbox = $(name).dialog({
				autoOpen: false,
				resizable: false,
				width: w,
				position: [350,100],
				close: function () { resetTimeout(); },
				zIndex: 3100,
				title: tit
			});
			wmsmgrdbox.load(video.replace(/ /g,"%20")).dialog("open");
		}
		
		function resetTimeout()
		{
			clearTimeout(stVar);
		}
		
		function setLayersList()
		{
			if(listcontents != "")
			{
				document.getElementById("layerlist").style.display = 'inline';
				document.getElementById("layerlist").innerHTML = list;
				checkAllLayers();
			}
		}
		
//End...WMS Manager

//embed html
function sendlink() {		
	 var place = "place";
	 var bstr = getBounds();	
	 var link1= $("#link").dialog({
        autoOpen: false,
        resizable: false,
        width: 725,
        close: function () {  },
        zIndex: 3000
    });
    link1.dialog("open");	
    var maillink = "src=https://bhuvan.nrsc.gov.in/map/bhuvan/embed.html?" + bstr + "&val=" + place;
	var subj="<iframe width='500' height='400' frameborder='0' scrolling='no' marginwidth='0'";
	var help=subj+maillink+">"+"</iframe>";
	$("span.des", link1).text(help);
}
//end

//Search
var searchdialog,sflag=0,flag1=0,vlayer=null,feature=null,fsearch=0;
function sendsearch() {
	searchdialog = $("#search").dialog({
		autoOpen:false,
		resizable:false,
		width:425,
		height:240,
        overflow:'auto',		
		close: function () {},
		zIndex: 3000
	});
	searchdialog.dialog("open");
}

function showResult(str)
{

var regexLetter = /[a-zA-Z]/;
	if (str.length<4)
    {
        return;
    }
	if(!regexLetter.test(str))
	   return;
    if (window.XMLHttpRequest)
    {
      xmlhttp=new XMLHttpRequest();
    }
    else
    {
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
          if (xmlhttp.readyState==4 && xmlhttp.status==200)
          {  
	            var m=xmlhttp.responseText;
				document.getElementById("livesearch").innerHTML=m;
				document.getElementById("live").innerHTML=m;
				
				if(fsearch==0&&m!=""){
				document.getElementById("live").style.border="1px solid #A5ACB2";
				document.getElementById("live").style.background="white";
				document.getElementById("live").style.display="block";	}
				if(sflag){
						sflag=0;
						
						document.getElementById('live').style.display='none';
						if(m=="")
						{
							
							alert("Results not found");
							
							return false;
						}
	      		        if(document.getElementById("searchnum").innerHTML=="1")
						{
							var k=document.getElementById("0").innerHTML;
							var temp=new Array();
							temp=k.split(',');
							m=document.getElementById("Val").value;
							if(temp[0].toLowerCase()==m.toLowerCase()){
								k= document.getElementById("1").innerHTML;	                   
								temp=k.split(',');
								m=parseFloat(temp[0]);
								k=parseFloat(temp[1]);
								testing(m,k);
								return ;
							}
						}
		  				sendsearch(); 
		
				}
		  }
	}
	xmlhttp.open("GET","usrtasks/search/india.php?q="+str,true);
	xmlhttp.send();
}

function test(a) {
	var b = document.getElementById(a).innerHTML;
	document.getElementById("Val").value = b;
	fsearch = 1;
	globle = parseFloat(a) + 1;
	globle = "" + globle;
	globle = document.getElementById(globle).innerHTML;
	window.sharedvariable=globle;
	//console.log("Coordinates", globle);
}
function test2() {
	document.getElementById("live").style.display = "none";
	searchdialog && searchdialog.dialog("close");
	Go();
}
function remove1(a) {
	document.getElementById(a).value = "";
	fsearch = 0;
}
function Go(){
	document.getElementById('live').style.border='0';
	document.getElementById('live').style.display='none';
	var m = document.getElementById('Val');
	var n=""+m.value;  
	if (n == "") {
        alert("Cannot be empty")
		return false;
    }
	    // var iChars = "!@#$%^&*()+=[]\\\';/{}|\":<>?";
    // for (var i = 0; i <n.length; i++) {
         // if (iChars.indexOf(n.charAt(i)) != -1) {
              // alert("pls dont give special characters");
            // return false
         // }
    // }
    var regexLetter = /[a-zA-Z]/;
	if (regexLetter.test(n)) {       
       	   if(fsearch==1)
		   {  
		      
				if(searchdialog)
					searchdialog.dialog("close");					
					
				n=globle;
				var temp = new Array();
				temp = n.split(',');
				var l = parseFloat(temp[0])
				var k = parseFloat(temp[1]);  
				testing(l,k);		  
		   }  
	       else
		   {			
		
						sflag=1;	     
					   showResult(m.value);		
		   }
    }
	else{
	
		var temp = new Array();
		temp = n.split(',');
		var l = parseFloat(temp[0])
		var k = parseFloat(temp[1]);  
		testing(l,k);	
	}
	
}

function testing(l, k) {
 
	if(vlayer==null)
	{
		vlayer = new OpenLayers.Layer.Vector("drawings1", {displayInLayerSwitcher: false});
		map.addLayer(vlayer);	 
	}

	if ((k < -180 || k > 180 )|| (l < -90 || l > 90) ){
        alert("Please Enter Correct Range...");
    } else {
        if (feature != null) {	
            vlayer.destroyFeatures(feature);			
        }
        feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(k, l), {
            some: "data"
        }, {
            externalGraphic: "img/marker.png",
            graphicHeight: 17,
            graphicWidth: 16
        });      
        vlayer.addFeatures(feature);		
        var h = map.getZoom();
        if (h > 5) {
            map.setCenter(new OpenLayers.LonLat(k, l), 0);
        } else {
            map.setCenter(new OpenLayers.LonLat(k, l), 0);
        }
    }
}
$(document).keypress(function(e){
		if(e.which==13)
		{
			Go();
			return false;
		}
	});
//end of serach

function load_video(name,video,tit,w,h) {

    $(function() {
        $(name).dialog({
	        autoOpen: false,
			resizable: false,
	        width: w,
	        height: h,
			position: [300,125],
			close: function () {  },
			zIndex: 3000,
	        title: tit
		  });
          $(name).load(video.replace(/ /g,"%20")).dialog('open');
		  		  if(name=='#LogoutFrame')
		  {
			 	bhuvanusername = "empty";
				document.getElementById("loggedindiv").innerHTML = "<b>  Welcome User &nbsp;&nbsp; </b>";
				document.getElementById("logindiv").innerHTML = '<b><a href="#" id="loginButton" title="Way to portal login" alt="login" Onclick="load_video(\'#LoginFrame\',\'loading.php?q=login.php\',\'Login\',\'900\',\'700\');" >Login</a></b>';
			  $("#LogoutFrame").dialog("close");
			document.getElementById('aad') && (document.getElementById('aad').style.display = "none");
			  // location.reload();
		  }
           
    });
}
//end
//login
	function reloadlogin_afterlogout() {
		bhuvanusername = "empty";
		document.getElementById("loggedindiv").innerHTML = "<b>  Welcome User &nbsp;&nbsp; </b>";
		document.getElementById("logindiv").innerHTML = '<b><a href="#" id="loginButton" title="Way to portal login" alt="login" Onclick="load_video(\'#LoginFrame\',\'loading.php?q=login.php\',\'Login\',\'900\',\'700\');" >Login</a></b>';
		$("#LogoutFrame").dialog("close");
		poidivload(); //29-10-15
		location.reload();
	}
	function reloadlogin() {
		if(bhuvanusername != "empty")
		document.getElementById("loggedindiv").innerHTML = "<b>  Welcome " + bhuvanusername + "  &nbsp;&nbsp;  </b>";
		document.getElementById("logindiv").innerHTML = '<b><a href="#" title="Click here to logout" alt="logout" Onclick="load_video(\'#LogoutFrame\',\'loading.php?q=logout.php\',\'Logout\',\'700\',\'700\');reloadlogin_afterlogout();" style="font-family: Arial; font-size: 11px; color: darkblue">Logout</a></b>';
		location.reload();
		$("#LoginFrame").dialog("close");
		poidivload(); //29-10-15
		}
	
function handleClick(b, a)
	{
		document.getElementById(b).style.display = "none";
		document.getElementById(a).style.display = "block";
	}
//changed on 29/12/2015
function setpanzoombar(levels)
{
	map.removeLayer(dummylayer);
	if(levels==5)	
		map.resolutions.splice(5,4);
	else	
		map.resolutions.splice(5,0,0.00004291534423828125,0.000021457672119140625,0.000010728836059570312,0.000005364418029785156);	
	map.numZoomLevels=levels;
	map.addLayer(dummylayer);

}
//end on 29/12/2015
function AddLayer(layers,name,url)
{
var labellayer=new OpenLayers.Layer.WMS(name, url, 
					  {layers: layers,transparent: true},{transitionEffect:null});
					  map.addLayer(labellayer);	  
}

	


function hideshowmap()
{
$("#LeftAreaTD").toggle(1000);
 setTimeout(function(){map.updateSize();},1500);
if(document.getElementById('hideshowimg').getAttribute('src')=='img/minimize.png')
	$("#hideshowimg").attr("src", "img/maximize.png");
else{
$("#hideshowimg").attr("src", "img/minimize.png");
	}	
} 

function trans(val)
{
}


function loadlabellayers(layername,arr,name)
{
var c = layername.split("_");
remove(c[0]);

var	layer_lab3 = new OpenLayers.Layer.WMS(layername, arr, {
        layers: name,
		transparent: true
    }, {
        format: "image/png", 
        isBaseLayer: false,transitionEffect: "resize"
    });
	
	map.addLayer(layer_lab3);
	legendrefresh();
}


	function legend()
{
var d="";
var splitvals=["lulc250","lulc50","lulc502","ero","sal","wl50"];
var myarr = ["terrain", "IRSImagery", "basemap","Roadmap via Rediff","osm","base_town","clusterphotos","photos","Point Data","Simple Geometry","waterbodies_grouped","SOI Mosaic Roads","watershed_grouped","bhuvantransportnetwork","admin_grouped","OpenLayers_Control_SelectFeature_1856_container"];
for (var b = map.layers, c = 1, length=b.length; c < length; c++) 
if((myarr.indexOf(b[c].name) < 0) && (b[c].visibility) && b[c].name.indexOf("OpenLayers_Control_SelectFeature") <0)
{
if($.inArray(b[c].name.split("_")[0], splitvals) > -1)
d=d+b[c].name.split("_")[0]+"__";
else
d=d+b[c].name+"__";
}
load_video("#legenddiv","get/legend.php?q="+d,"Legend",350,400);

}

function legendrefresh()
{
	try {
if($("#legenddiv").dialog( "isOpen" ))
	legend();	
	}
	catch(e) {}
		map.setLayerIndex(admin_grouped, 999);
	map.setLayerIndex(layer6, 998);
}

  var navflag=0;
function showNav()
{
		if (navflag==0)
		{
			document.getElementById('accordion').style.visibility="visible";
			document.getElementById('more').innerHTML='Less';
			navflag=1;
		}
		else
		{
			document.getElementById('accordion').style.visibility="hidden";
				document.getElementById('more').innerHTML='More';
			navflag=0;
		}
}  

function rediff(flag) {

redifflayer.setVisibility(flag);
	
}
function transport(flag) {

transportnetwork.setVisibility(flag);
	 
}

function watershed(flag)
{
		watershed_grouped.setVisibility(flag);
}
function surveyindia(flag)
{
		soi.setVisibility(flag);
}

// new code bhuvan hydrology

 function mapselection(adm,hydri)
{
$("#radio1").prop("checked", true);
$("#radio1").button("refresh");
$("#radio2").prop("checked", false);
$("#radio2").button("refresh");
$("#radio3").prop("checked", false);
$("#radio3").button("refresh");
$("#radio4").prop("checked", false);
$("#radio4").button("refresh");
if(adm)
{
document.getElementById('baseadmin').style.border='solid 1px #000000';
document.getElementById('basehydro').style.border='0';
}
else
{
document.getElementById('baseadmin').style.border='0';
document.getElementById('basehydro').style.border='solid 1px #000000';
}

hydriflag=hydri;

setbaselayer('m');
document.getElementById('accordionnew').style.visibility="hidden";

}



function map_hybrid(base, sat, admin, trn) //false, true, true, false : Hybrid mode
{

// new code bhuvan hydrology
if((document.getElementById('accordionnew').style.visibility!="visible") && base)
shownew(1);
else	
shownew(0);
//end
		var no=map.getNumZoomLevels();	
		
		if(no==5&&trn==false)
			setpanzoombar(9);		// levels are changed 8 to 9 on 29/12/2015
		IRSlayer.setVisibility(sat);
		terrainlayer.setVisibility(trn);
		waterbodies_grouped.setVisibility(trn);			
		if(base){
				if(hydriflag)
				{  //alert('inside');
					basemap.setVisibility(false);
					layer5.setVisibility(true);
				
				}
				else
				{
					basemap.setVisibility(true);
					layer5.setVisibility(false);
					
				}	
       }
	   else
	   {
		basemap.setVisibility(false);
		layer5.setVisibility(false);
	   }
	   if(admin&&sat)
	   {
	   
			if(hydriflag){
			layer6.setVisibility(true);	
			admin_grouped.setVisibility(false);
			
			}
			else{
			layer6.setVisibility(false);
			admin_grouped.setVisibility(true);
       	  } 
		}
		else
		{
			admin_grouped.setVisibility(false);
			layer6.setVisibility(false);
		}
			
	  var viewtype = $('input[name=radio1]:checked','#radio').val();  
  
         if(viewtype =='s' || viewtype=='h')
		{	 
					
                document.getElementById("tempd").style.display="inline";
				
               if(document.getElementById('Temporalimg').src.match("img/clockstop.png")=='img/clockstop.png'){
                    changeurltemporal();
                    document.getElementById('temporaldiv').style.display='block';
                }
		}                
          else
         {
            removetemplayersmt();
			document.getElementById("tempd").style.display="none";
            document.getElementById('temporaldiv').style.display='none';
               
		 }
		
}

function shownew(flag)
{

		if(document.getElementById('more').innerHTML=='Less'){
		
		flag=1;
		showNav();
		}
		if(flag)
		document.getElementById('accordionnew').style.visibility="visible";
		else
		document.getElementById('accordionnew').style.visibility="hidden";
	
}  
function setbaselayer(param)
{ 
	 switch(param)
	 {
	
	   case 'm':map_hybrid(true,false,true,false);	  
				document.getElementById('radio1').checked=true;					 
	            break;
	   case 's':map_hybrid(false,true,false,false);
				document.getElementById('radio2').checked=true;
	            break;
	   case 'h':map_hybrid(false,true,true,false);
				document.getElementById('radio3').checked=true;
	            break;
	   case 't':map_hybrid(false,false,false,true);
				setpanzoombar(5);	
				document.getElementById('radio4').checked=true;
	            break;
	 
	 }	 
		$( "#radio" ).buttonset();	 
		 var viewtype = $('input[name=radio1]:checked','#radio').val();   
//alert(viewtype);         
         if(viewtype=='s' || viewtype=='h')
		{	 
				//alert('t');
                document.getElementById("tempd").style.display="inline";				
               if(document.getElementById('Temporalimg').src.match("img/clockstop.png")=='img/clockstop.png')
               {
                    changeurltemporal();
                    document.getElementById('temporaldiv').style.display='block';
               }
		}                
          else
         {
            removetemplayersmt();
			document.getElementById("tempd").style.display="none";
            document.getElementById('temporaldiv').style.display='none';
               
		 }
}
	
//end

function pop(name,w,left,top,h) {

var  pop1 = $(name).dialog({
        autoOpen: false,
        resizable: false,
        width: w,	
		height:h,
		position: [left,top],
		show:'slide',
		zIndex: 3000
    }); 
   pop1.dialog("open"); 
}

//Add Layer
var layersbbox= new Array(),userlayers= new Array(), layerid=-1,userlyrinfo;
function add()
{
//added Raster layer 25-06-2014
	document.getElementById('clrpicker').style.display='none';	
	document.getElementById('layers').innerHTML="<a id='IMGLayer' href='#' onclick='userimagelayer()'><b>Raster Layer</b></a><br><a id='KMLLayer' href='#' onclick='userkmllayer()'><b>KML</b></a><br><a id='Shapefile' href='#' onclick='shapefile()'><b>Shapefile</b></a> <br><a id='WMSLayer' href='#' onclick='userwmslayer()'><b>WMSLayer</b></a>";  
	//
	var userdbox = $("#addlayers").dialog({
				autoOpen: false,
				resizable: false,
				width: 350,
				close: function () {}				
		});
	userdbox.dialog("open");
 }
 function userwmslayer()
 {	
document.getElementById("layers").innerHTML='<b>WMS URL</b>&nbsp&nbsp&nbsp&nbsp&nbsp<input id="wmsurl" type="Text"><br><i>eg: https://bhuvan-ras2.nrsc.gov.in/cgi-bin/hazard.exe</i><br><b>Layername</b>&nbsp&nbsp<input id="wmslayer" type="Text"><br><i>eg:as_hz</i><br><a style="cursor:pointer" onclick="back()"><img src="./html/images/MoveIcon.gif" >back</a><input type="button" value="Load" onclick="load_extwms()" style="float:right;color:blue;">';
  
 }
 function back()
 {
    
	document.getElementById('clrpicker').style.display='none';
	document.getElementById('layers').innerHTML="<a id='IMGLayer' href='#' onclick='userimagelayer()'><b>Raster Layer</b></a><br><a id='KMLLayer' href='#' onclick='userkmllayer()'><b>KML</b></a><br><a id='Shapefile' href='#' onclick='shapefile()'><b>Shapefile</b></a> <br><a id='WMSLayer' href='#' onclick='userwmslayer()'><b>WMSLayer</b></a>"; //25-06-2014
	//
 }
 function load_extwms()
 {
      var url  = document.getElementById("wmsurl").value;
	  var name = document.getElementById("wmslayer").value;	
	  if(url==""||name=="")
	  {
	    alert('Please enter the url and layer name');
	  }
	  else{ 
	 
				layerid=layerid+1;				
				userlayers[layerid] = new OpenLayers.Layer.WMS(
				"user:"+layerid, url,{layers:name,transparent: true},{opacity:0.5,format:"image/jpeg",attribution:name});		
				map.addLayer(userlayers[layerid]);	
				var frame = document.createElement("div");	
				frame.id="opacity_"+layerid;
				var inputElem = document.createElement("input");
				inputElem.id ='wms'+layerid;				
				inputElem.type = "checkbox" ;				
				inputElem.onclick = new Function('usrlyrsvisibility('+layerid+',\"wms\")');					    
				var labelSpan = document.createElement("span");
				//25-06-2014
				labelSpan.innerHTML = name + "<img title='Click to activate/deactivate swipe' style='cursor:pointer' src='img/swipe.jpg' id='swipe"+layerid+"' onclick='swipe_userlayer("+layerid+",\"wms\")' />";
				labelSpan.onclick = new Function('usrlyrsvisibility('+layerid+',\"wms\")');
				labelSpan.style.verticalAlign =  "baseline"; 
				var labelSpan1 = document.createElement("span");	
	var s="<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span id='opacity2_"+layerid+"'><img alt=\"-\" title=\"decrease opacity\" src=\"./html/images/minus.bmp\" / onclick=\"changeOpacity(-0.1,'user:"+layerid+"')\"> <input id=\"opacity_user:"+layerid+"\" type=\"text\" value=\"0.5\" size=\"1\" disabled=\"true\" />	<img alt=\"-\" src=\"./html/images/plus.bmp\" title=\"increase opacity\"  onclick=\"changeOpacity(0.1,'user:"+layerid+"')\"/></span><img title=\"delete layer\" alt=\"Remove layer\" src=\"./html/images/deleteIcon.gif\" onclick='document.getElementById(\"opacity_"+layerid+"\").style.display=\"none\",removelayer(\"user:"+layerid+"\")' style=\"cursor:pointer\" />";	
				labelSpan1.innerHTML=s;				
				labelSpan1.style.verticalAlign =  "baseline"; 
				var br = document.createElement("br"); 				
				var mydiv=document.getElementById('mylayers');
				frame.appendChild(inputElem);
				inputElem.checked =true;
				frame.appendChild(labelSpan);				
				frame.appendChild(labelSpan1);	
				frame.appendChild(br);
				mydiv.appendChild(frame); 
				//services('t',false);
				pop("#useradded_data",320,350,100,500);
           		//$(".content").slideDown();
				//$("#expand").attr("src", "img/sliderDec.png");					
				$("#addlayers").dialog("close");
		}	  
	
 }

 function changeOpacity(d, a) {
    var c = map.layers;
    for (var b = 1; b < c.length; b++) {
        var f = "opacity_" + a;
        if ( c[b].name == a) {
            var e = (parseFloat(OpenLayers.Util.getElement(f).value) + d).toFixed(1);
            e = Math.min(0.9, Math.max(0.1, e));
            document.getElementById(f).value = e;
            c[b].setOpacity(e)
        }
    }
} 
function shapefile()
{

document.getElementById("clrpicker").style.display='inline';
document.getElementById("layers").innerHTML=
"<form action='usrtasks/userlayers/upload.php' method='post' enctype='multipart/form-data' target='upload_target' onsubmit='startUpload(\"zip\")' ><b>Load Zip file(.shp,.prj,.dbf .shx)</b><p id='zip_upload_process'>Loading...<br/><img src='loader.gif' /><br/></p><p id='zip_upload_form'><label><b> Shape File:</b><input name='upload'id='upload' type='file'  onchange='checkfilexttension(this,\"zip\")' /><br> </label> <label><a style='cursor:pointer;'onclick='back()'><img src='./html/images/MoveIcon.gif' >back</a><input type='submit' name='submitBtn'  id='zipfile' value='Upload' disabled='disabled' style='float:right;'/> </label><br><span id='ziperror'></span></p><br><iframe id='upload_target' name='upload_target' src='#' style='width:0;height:0;border:0px solid #fff;'></iframe></form>";
}

function stopUpload(success){
			var temp = new Array();
			temp = success.split(':');			
            success=temp[0];  			
			if(temp[0]=="Error"){			
				switch(temp[1]){
					case 'shp'	:   alert("Not able to find shp file.No SubFolders are allowed in Zipfile.");
									break;
					case 'prj'	:	alert("Not able to find prj file");
									break;
					case 'dbf'	:   alert("Not able to find dbf file");
								    break;
					case 'shx'	:	alert("Not able to find shx file");
								    break;
					case 'Unsuccess':alert("Error while uploading.Please try again");
								     break;
					case 'upload':   alert("Error while uploading.Zipfile should contain .shp,.shx,.prj,.dbf only");
								     break;
					case 'size'  :	alert("Upload zipfile of maximum 2MB.");
						             break;
					case 'default':alert("Zip files are only allowed for Upload");
				}
			
			}
			else{	
		  		layerid=layerid+1;	
				boundingbox(success,layerid,'shape');	//25-06-2014
                var color=document.getElementById('clr').value;               				
				var layername="shapefile:"+success; //workspace:				
				userlayers[layerid] = new OpenLayers.Layer.WMS(
									  "user:"+layername, "https://bhuvan-gp1.nrsc.gov.in/bhuvan/shapefile/wms",{layers:layername,env:'color:0X'+color,transparent: true,styles:'usershapefile'},
									  {format:"image/jpeg",attribution:temp[1]});		
				map.addLayer(userlayers[layerid]);
				userlayersdisplay(layerid,'checkbox','shape',temp[1]);				
				//services('t',false);
				//$(".content").slideDown();				
				//$("#expand").attr("src", "img/sliderDec.png");
				pop("#useradded_data",320,350,100,500);
		
			}
			$("#addlayers").dialog("close");	
			document.getElementById('clrpicker').style.display='none';
				
}
function boundingbox(filename,id,type)
{
		if (window.XMLHttpRequest)		
			xmlhttp=new XMLHttpRequest();	
		else	
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");	
		xmlhttp.onreadystatechange=function()
		{
				layersbbox[id]=null;		
				if (xmlhttp.readyState==4 && xmlhttp.status==200)
				{
					var txt=xmlhttp.responseText;	
					var lines = xmlhttp.responseText.split("<latLonBoundingBox>");    
					lines=lines[1].split("</latLonBoundingBox>");	   
					lines=lines[0].split("\n");
					var bounds=new Array();
					for(i=1;i<lines.length-2;i++){	        
						bounds[i-1]=lines[i].substring(10,lines[i].length-7);						
					}					
					var bounds1 = new OpenLayers.Bounds();
					bounds1.extend(new OpenLayers.LonLat(bounds[0],bounds[2]));
					bounds1.extend(new OpenLayers.LonLat(bounds[1],bounds[3]));						
					layersbbox[id]=bounds1;							
					map.zoomToExtent(bounds1);	
			    }
	   }

if(type=='shape')
	   xmlhttp.open("GET","usrtasks/userlayers/read.php?filename="+filename,true);
	   else
	   xmlhttp.open("GET","usrtasks/userlayers/read_raster.php?filename="+filename,true);
	
	   xmlhttp.send();
}
//common functions for shapefile and KML
function usrlyrsvisibility(index,flag)
{	
 
			var vis=document.getElementById(flag+index).checked;		
			switch(flag)
			{
					case 'shape':
									userlayers[index].setVisibility(vis);
									if(vis){
										var bbox=layersbbox[index]
										if(bbox!=null)
										map.zoomToExtent(layersbbox[index]);
										//new changes 15,16 sep2014
										userlayers[index].setZIndex(999);
										//end
									}
									break;
				   case 'kml':
				   
									kml_all[index].setVisibility(vis);
									//new changes 15,16 sep2014
									if(vis)
									kml_all[index].setZIndex(999);
									//end
									break;
				   case 'wms':
									userlayers[index].setVisibility(vis);
									if(vis){ //25-06-2014
									//new changes 15,16 sep2014
									userlayers[index].setZIndex(999);
									//end
									document.getElementById( 'opacity2_'+index ).style.display = 'inline';
									}
									else
									document.getElementById( 'opacity2_'+index ).style.display = 'none';	
									 break;
			 }
									
									if(vis) //25-06-2014
									{
									  //new changes 15,16 sep2014
									  if(document.getElementById( 'swipe'+index ))//end
									document.getElementById( 'swipe'+index ).style.display = 'inline';
									}
									else
									{
									   //new changes 15,16 sep2014
									  if(document.getElementById( 'swipe'+index ))//end
									document.getElementById( 'swipe'+index ).style.display = 'none';

                                    }									
}

function checkfilexttension(fname,type) { 
 
		   var fname = fname.value;
		   fname=fname.toLowerCase();
		   var index=fname.lastIndexOf(type);		
		  if(index!=-1) 
		  {	  
			document.getElementById(type+'file').disabled = false;	
			document.getElementById(type+'error').innerHTML='';			
		  }
		  else {		   
			fname.value = '';
			document.getElementById(type+'file').disabled = true;	
			alert('Error:Unsupported file format is loaded,load the'+type+'file');
			document.getElementById(type+'_upload_process').style.visibility = 'hidden';
			document.getElementById(type+'_upload_form').style.display = 'block';
			document.getElementById(type+'error').innerHTML='Error:Unsupported file format is loaded,load the'+type+'file';			
		  }
}
 

function startUpload(type){

document.getElementById(type+'_upload_process').style.visibility = 'visible';
document.getElementById(type+'_upload_form').style.display='none';
}
function userlayersdisplay(layerid,inputtype,layertype,name){

				var frame = document.createElement("div");	//25-06-2014
				frame.id="opacity_"+layerid;
				var inputElem = document.createElement("input");
				inputElem.id =layertype+layerid;
				inputElem.name = 'vector';
				inputElem.type =inputtype ;				
				inputElem.value = name;				
				inputElem.onclick = new Function('usrlyrsvisibility('+layerid+',\"'+layertype+'\")');								
				var labelSpan = document.createElement("span");	
				//25-06-2014
				if(layertype=='kml')
				labelSpan.innerHTML = name + "&nbsp;<img title=\"delete layer\" alt=\"Remove layer\" src=\"./html/images/deleteIcon.gif\" onclick='kml_all["+layerid+"].setVisibility(false),document.getElementById(\"opacity_"+layerid+"\").style.display=\"none\"' style=\"cursor:pointer\" />";
				else
				labelSpan.innerHTML = name + "<img title='Click to activate/deactivate swipe' style='cursor:pointer' src='img/swipe.jpg' id='swipe"+layerid+"' onclick='swipe_userlayer("+layerid+",\"shape\")' />&nbsp;<img title=\"delete layer\" alt=\"Remove layer\" src=\"./html/images/deleteIcon.gif\" onclick='userlayers["+layerid+"].setVisibility(false),document.getElementById(\"opacity_"+layerid+"\").style.display=\"none\"' style=\"cursor:pointer\" />";
									
				labelSpan.style.verticalAlign =  "baseline"; 
				var br = document.createElement("br");  
				var mydiv=document.getElementById('mylayers');
                mydiv.style.display='block';				
				frame.appendChild(inputElem);
				inputElem.checked =true;		
				frame.appendChild(labelSpan);
				frame.appendChild(br);	
				mydiv.appendChild(frame);	

}
//end 
//Specific to Add KML
function userkmllayer()
{ 
 document.getElementById("layers").innerHTML=
"<form action='usrtasks/userlayers/uploadkml.php' method='post' enctype='multipart/form-data' target='upload_target_kml' onsubmit='startUpload(\"kml\")' >	<b>Load KML File</b><p id='kml_upload_process'>Loading...<br/><img src='loader.gif' /><br/></p><p id='kml_upload_form'><label><b> KML File:</b><input name='file' id='upload' type='file'  onchange='checkfilexttension(this,\"kml\")' /><br> </label> <label><a style='cursor:pointer;'onclick='back()'><img src='./html/images/MoveIcon.gif' >back</a><input type='submit' name='submitBtn'  id='kmlfile' value='Upload' disabled='disabled' style='float:right;'/> </label><br><span id='kmlerror'></span></p><br><iframe id='upload_target_kml' name='upload_target_kml' src='#' style='width:0;height:0;border:0px solid #fff;'></iframe></form>";
}
function stopUploadkml(response)
{
	response = response.split('::');
	if(response[0]=='Error')	
		 alert(response[1]);			   
	else	
	 loaduserkml(response[1],'https://bhuvan-app1.nrsc.gov.in/userkmlfiles/'+response[1]);
	 $("#addlayers").dialog("close");		
}

function loaduserkml(name,layerurl){				
									
				var kmllayer = new OpenLayers.Layer.Vector('userkml', {
											'displayInLayerSwitcher':false,
											projection: map.displayProjection,
											strategies: [new OpenLayers.Strategy.Fixed()],
											protocol: new OpenLayers.Protocol.HTTP({
												url: layerurl,
												format: new OpenLayers.Format.KML({
													extractStyles: true,
													extractAttributes: true
												})
											})
										});	
									
				map.addLayer(kmllayer);	
				
				kml_all.push(kmllayer);
				
				
				popupControl.deactivate();	
			
				addselectcontrol();
			
				kmllayer.events.on({
				'featureselected': onFeatureSelect,
				'featureunselected': onFeatureUnselect            
				});					
				kmlid=kmlid+1;				
				name=name.split('_');				
				userlayersdisplay(kmlid,'checkbox','kml',name[1])		
				//services('t',false);
				pop("#useradded_data",320,350,100,500);
				//$(".content").slideDown();
				//$("#expand").attr("src", "img/sliderDec.png");		
				
}
function addselectcontrol(){
	
     if(popupControl)  //new changes 15,16 sep2014 if condition
	 map.removeControl(popupControl);
	  popupControl=null;
	 
	  var layers=map.getLayersByClass('OpenLayers.Layer.Vector');	  
	  
	  popupControl = new OpenLayers.Control.SelectFeature(
          layers, {
                toggle: true
                //multiple: true
            }
        );
	map.addControl(popupControl);
	layers=null;
	popupControl.activate();
}
 function onFeatureSelect(event) { 
            var feature = event.feature;			
            // Since KML is user-generated, do naive protection against
            // Javascript.			
            var content =feature.attributes.description;
            if (content.search("<script") != -1) {
                content = "Content contained Javascript! Escaped content below.<br>" + content.replace(/</g, "&lt;");
            }			
			var popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(60, 10), "<div style='font-size:.8em' ><center>"+content+ "</div>", null, true);		
            feature.popup = popup;			
            map.addPopup(popup);
 }

//End of KML	

function userimagelayer()
{
document.getElementById("layers").innerHTML=
"<form action='usrtasks/userlayers/upload_raster.php' method='post' enctype='multipart/form-data' target='upload_target' onsubmit='startUpload(\"zip\")' ><b>Load Zip file</b><p id='zip_upload_process'>Loading...<br/><img src='loader.gif' /><br/></p><p id='zip_upload_form'><label><b> Raster File:</b><input name='upload' id='upload' type='file'  onchange='checkfilexttension(this,\"zip\")' /><br> </label> <label><a style='cursor:pointer;'onclick='back()'><img src='./html/images/MoveIcon.gif' >back</a><input type='submit' name='submitBtn'  id='zipfile' value='Upload' disabled='disabled' style='float:right;'/> </label><br><span id='ziperror'></span></p><br><iframe id='upload_target' name='upload_target' src='#' style='width:0;height:0;border:0px solid #fff;'></iframe></form>";
}

function stopUpload_raster(success){
			var temp = new Array();
			temp = success.split(':');			
            success=temp[0];  			
			if(temp[0]=="Error"){			
				switch(temp[1]){
					case 'tif'	:   alert("File is not valid .TIFF file");
									break;
					case 'tfw'	:	alert("File is not valid .TFW file");
									break;
					case 'Unsuccess':alert("Error while uploading.Please try again");
								     break;
					case 'upload':   alert("Error while uploading.Zipfile should contain .shp,.shx,.prj,.dbf only");
								     break;
					case 'size'  :	alert("Upload zipfile of exceeds maximum size (6MB)");
						             break;
					case 'default':alert("Zip files are only allowed for Upload");
				}
			
			}
			else{	
		  		layerid=layerid+1;	
				boundingbox(success,layerid,'raster');	
                         				
				var layername="imagefile:"+success; //workspace:				
				userlayers[layerid] = new OpenLayers.Layer.WMS(
									  "user:"+layername, "https://bhuvan-gp1.nrsc.gov.in/bhuvan/imagefile/wms",{layers:layername,transparent: true},
									  {format:"image/jpeg",attribution:temp[1]});		
				map.addLayer(userlayers[layerid]);
				//setindex();
				userlayersdisplay(layerid,'checkbox','shape',temp[1]);				
				//services('t',false);
				pop("#useradded_data",320,350,100,500);
				//$(".content").slideDown();				
				//$("#expand").attr("src", "img/sliderDec.png");						
			}
			$("#addlayers").dialog("close");	
			document.getElementById('clrpicker').style.display='none';
			
}


function swipe_userlayer(id,type)
{

if($("#swipe"+id).attr("src").match('swipe.jpg') == 'swipe.jpg')
{
$("#swipe"+id).attr("src", "img/stop.jpg");
if(type=="kml")
swipe_layer=kml_all[id];
else
swipe_layer=userlayers[id];
activate_swipe();	
}
else
{
$("#swipe"+id).attr("src", "img/swipe.jpg");	
swipe_control_deactivate();
}

}
//end of addlayer code

//Start of Measure
var measureControls,measureflag=0,measure=null,measureDialog;
var wkt = new OpenLayers.Format.WKT();
var geom;
function handleMeasurements(event) {

    var geometry = event.geometry;
    geom=event.geometry;
    var units = event.units;
    var order = event.order;
    var measure = event.measure;
	out = measure.toFixed(3);
	$("span.value1", measureDialog).text(measure.toFixed(3))   
    $("span.units", measureDialog).text(units);
    if (order == 2) $("sup", this.measureDialog).show();
}
function toggleControl(element) { 
desel_mapnavig();
	 if(measureflag == 1)
	 	measure.deactivate();
	 measure=measureControls[element.id];
	 measure.activate();	
	 measureflag = 1;	
}
function endmeasure() {
    if (measureDialog) measureDialog.dialog("close");
}
function beginmeasure(order) {
    measureDialog = $("<div><span class='description'></span>: <b><span class ='value1'></span></b> <span class='units'></span><sup>2</sup><br><b>Help Tip</b><br>Click on Map to add the vertices. Doubleclick to end the Measurement.<br>Close this box to quit the Measurement</div>").dialog({
        autoOpen: false,
        resizable: false,
        width: 305,
		position:[685,60],		
		show:"slide" ,		
        close: function () {			
            AddNav();			
        },
        zIndex: 3000
    });
    $("sup", this.measureDialog).hide();
    if (order == 1) {
        measureDialog.dialog("option", "title", MD);
        $("span.description", measureDialog).text(TD);
    } else {
        measureDialog.dialog("option", "title", MA);
        $("span.description", measureDialog).text(TA);
    }
	$("span.value1", measureDialog).text(0.000);  
    measureDialog.dialog("open");
}
function AddNav() {		
	if(measureflag == 1)
    {   measure.deactivate();
	    measureflag = 0;
	}	
}
//end of measure

//Gis Tools
var tools_ctr=0;
function se() {
if(measureflag == 1)
measure.deactivate();
if(tools_ctr==1)
{
panel.deactivate();
tools_ctr=0;
return;
}
panel.activate();
tools_ctr=1;	
}

//Gis tools end
//Draw tool
var drawid='test';//tokeep record of which one is selected
var modify; //To Edit/Modify the draw
var redostack; //for undo/redo of the draw feature
function services(path,flag)
{	
document.getElementById('poidiv').style.display="inline";
if(document.getElementById('poidiv').innerHTML=='')
					poidivload();
if(flag)
{
document.getElementById("startPageFrame").src.match(path) != path && document.getElementById("startPageFrame").setAttribute("src", path + "?id=en-us"), pop("#toolframe", 340, 350, 100, 500)
}
 
}
//Draw tool ends

//------------------------------------------------------------------API function Definitions-----------------------------
//Load WMS map  a=Layer_URL  b=Layer_Name

function loadmap(a,b) {
	var layer = new OpenLayers.Layer.WMS(b, a, {
		layers: b,
		transparent: !0
	},
	{
		isBaseLayer: !1
	});
	map.addLayer(layer);
}

//Zoom to Bounding Box
function zoom_to_layer(lon1,lat1,lon2,lat2)
{
var bounds = new OpenLayers.Bounds(lon1,lat1,lon2,lat2);
map.zoomToExtent(bounds, true);
}

//Zoom to Lat,Lon
function zoom_to_centre(lon,lat,level)
{
map.setCenter(new OpenLayers.LonLat(lon,lat),level);
}

//set Iframe source
function set_source()
{
	$.ajax({ type: "GET",   
	 url: sourceurl,
	 async: true,
	 success : function(text)
	{	 
	$("#lp").html(text);	
	init2();
	}} );
}

//To remove a layer
function remove(layername) {
	for (var b = map.layers.slice(), c = 1,length=b.length; c <length; c++) 
	 b[c].name == layername && map.removeLayer(b[c]);
}

//swipe layer
var swipe_layer,swipe_control=null;

function activate_swipe(layername)
{
for (var b = map.layers.slice(), c = 1,length=b.length; c <length; c++) 
if(b[c].name == layername)
swipe_layer = b[c];

try
{
deactivate_swipe();
swipe_control = new OpenLayers.Control.Swipe(swipe_layer);	  
map.addControl(swipe_control);
swipe_control.activate();
}
catch(e)
{
alert("Please overlay a layer for swipe");
}
}

//deactivate swipe
function deactivate_swipe() {
if (swipe_control) {
 swipe_control.deactivate()
 }
}
	
//to Load a KML layer
function loadkml(displayname, layerurl) {
	var c = displayname.split("_");
	kmllayer = new OpenLayers.Layer.Vector(displayname, {
				'displayInLayerSwitcher':false,
                projection: map.displayProjection,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: layerurl,
                    format: new OpenLayers.Format.KML({
                        extractStyles: true,
                        extractAttributes: true
                    })
                })
      });	
	 
	map.addLayer(kmllayer);	
	addselectcontrol();	       
    kmllayer.events.on({
                "featureselected": onFeatureSelect,
                "featureunselected": onFeatureUnselect
            });	     
	
}
function onFeatureSelect(event) {
	var feature = event.feature;
	var popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(100, 100), "<div style='font-size:.8em'>" + feature.attributes.description + "</div>", null, !0);
	feature.popup = popup;
	map.addPopup(popup)
}
function onFeatureUnselect(event) {
            var feature = event.feature;
            if(feature.popup) {
                map.removePopup(feature.popup);
                feature.popup.destroy();
                delete feature.popup;
            }	
}


// Temporal/all available datasets added on 02-6-15
var temporal_swipe,temporal_swipe_control=0,temporal_swipe_layer=0,AjaxTemporalRequest=null;
function loadtemporaldata(dname,lname,url,desc)
{
    
	if(url==0)
	{
	 url='https://bhuvan-ras2.nrsc.gov.in/cgi-bin/bhuvan_komp.exe?data='+lname;
	temporal_swipe_layer = new OpenLayers.Layer.WMS(
				"temporal:"+dname, url,{layers:'dyn_komp',transparent: true},{format:"image/jpeg"});		
				map.addLayer(temporal_swipe_layer);
	}
	else
	{
				temporal_swipe_layer = new OpenLayers.Layer.WMS(
				"temporal:"+dname, url,{layers:lname,transparent: true},{format:"image/jpeg"});		
				map.addLayer(temporal_swipe_layer);
	}
    
    map.setLayerIndex(transportnetwork, 999);  
    	
				
}
function changeurltemporal()
{		
		  
            var no=map.getZoom();
            /*if(no<5)
            { 
                document.getElementById('temporaldiv').innerHTML="Available Datasets <br><input type=checkbox disabled checked> 2009-10";
                document.getElementById('temporaldiv').style.height=120+'px';
                removetemplayersmt();
                return;
            }*/
			var cbox=activetemporallayers()		   
		    var b11 = map.getExtent().toArray();		
			var	sql =""+b11[0]+" "+b11[1]+","+b11[0]+" "+b11[3]+","+b11[2]+" "+b11[3]+","+b11[2]+" "+b11[1]+","+b11[0]+" "+b11[1]+"";		
			b11="get/temporal.php?sql="+sql+"&zoom="+map.getZoom()+"&cbox="+cbox;
			var act='Activate Swipe';
			if(document.getElementById("tempswipebtn"))
				 act=document.getElementById("tempswipebtn").value;			
			document.getElementById('temporaldiv').innerHTML='loading..';    

            if( AjaxTemporalRequest != null)
            {
                 AjaxTemporalRequest.abort();
				 AjaxTemporalRequest=null;
            }
            if (window.XMLHttpRequest)
            {
	
                AjaxTemporalRequest=new XMLHttpRequest();
            }
            else
            {
                AjaxTemporalRequest=new ActiveXObject("Microsoft.XMLHTTP");
            }
            AjaxTemporalRequest.onreadystatechange=function()
            {
                    if (AjaxTemporalRequest.readyState==4 && AjaxTemporalRequest.status==200)
                    {  
                       document.getElementById('temporaldiv').innerHTML=AjaxTemporalRequest.responseText;
                        if(document.getElementById("tempswipebtn"))
                            document.getElementById("tempswipebtn").value=act;					
                        removetemplayers();
                        if(document.getElementById('rowcount'))
                        {var nor=document.getElementById('rowcount').innerHTML;
                            var h=parseInt(nor); 
                            h=93+h*20;					
                        }
                        else
                            h=120;					
                            document.getElementById('temporaldiv').style.height=h+'px';
				
			
                       
                   }
            }	 

	AjaxTemporalRequest.open("GET",b11,true);
	AjaxTemporalRequest.send();




            
		/*	if (window.XMLHttpRequest)
			{
				xmlhttp=new XMLHttpRequest();
			}
			else
			{
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.onreadystatechange=function()
			{
				if (xmlhttp.readyState==4 && xmlhttp.status==200)
				{  
				
					document.getElementById('temporaldiv').innerHTML=xmlhttp.responseText;
					if(document.getElementById("tempswipebtn"))
						document.getElementById("tempswipebtn").value=act;					
					removetemplayers();
					if(document.getElementById('rowcount'))
					{var nor=document.getElementById('rowcount').innerHTML;
					var h=parseInt(nor); 
					h=93+h*20;					
					}
					else
					 h=40;					
					document.getElementById('temporaldiv').style.height=h+'px'
					
					
					
				}
			}
	xmlhttp.open("GET",b11,true);
	xmlhttp.send();*/

 
 }

function activetemporallayers()
{
	var b=map.layers,length=b.length;
	var flag=-1;
	for(i=length-1;i>0;i--)
	{
	 var temp=b[i].name.split(":");
	      if(temp[0] =='temporal')
		  {		
				flag=flag+"::"+temp[1];				 
		 }
	}
return flag;	
}
  
function removetemplayers()
{

	var b=map.layers,length=b.length;	
	for(i=length-1;i>0;i--)
	{
			var temp=b[i].name.split(":");
	       if(temp[0] =='temporal')
		  {	   
				
			    if(!(document.getElementById('temporal_'+temp[1])))
				{  
						if(temporal_swipe_layer.name==b[i].name){
							temporal_swipe_control_deact();
							
				        }
						
				map.removeLayer(b[i]);
				}
		  }		 
	}

 }
 function removetemplayersmt()
{

	var b=map.layers,length=b.length;	
	for(i=length-1;i>0;i--)
	{
			var temp=b[i].name.split(":");
	       if(temp[0] =='temporal')
		  {	   
				
			  
						if(temporal_swipe_layer.name==b[i].name){
							temporal_swipe_control_deact();
							
				        }
						
				map.removeLayer(b[i]);
				
		  }		 
	}

 }
 function temporaldisplay()
 {
	
	if((document.getElementById('Temporalimg').src).match("img/clockon.png")=='img/clockon.png'){	 
	 document.getElementById('Temporalimg').src='img/clockstop.png';
	  document.getElementById('temporaldiv').style.display='block';
	  changeurltemporal();
	 }
	else
	{
	  document.getElementById('Temporalimg').src='img/clockon.png';
	  document.getElementById('temporaldiv').style.display='none';
	  removetemplayersmt();
	}
 }

 function temporal_activate_swipe()
{
		try
		{
			temporal_swipe_control_deact();
			document.getElementById("tempswipebtn").value='Deactivate Swipe';
		    if(temporal_swipe_layer)
			   temporal_swipe = new OpenLayers.Control.Swipe(temporal_swipe_layer);	  
			map.addControl(temporal_swipe);
			temporal_swipe.activate();
		}
		catch(e)
		{
				alert("If already layrer selected,Please unselect and selet the layer which swipe is required");
		document.getElementById("tempswipebtn").value='Activate Swipe';
		
		}
	
	}
	
function temporal_swipe_control_deact() 
{
    try{
	 if(document.getElementById("tempswipebtn"))
	document.getElementById("tempswipebtn").value='Activate Swipe';
		if (temporal_swipe) {
        temporal_swipe.deactivate();
		map.removeControl(temporal_swipe);
		
		}
	}
	catch(e)
	{
		
		document.getElementById("tempswipebtn").value='Activate Swipe';
	}
}
function temporalinfo(id)
{
var temp="tempinfo:"+id , temp1=document.getElementById(temp).src
if(temp1.match("img/tempinfo.png")=='img/tempinfo.png')
{

document.getElementById(temp).src='img/tempinfono.png'
document.getElementById("tempspan:"+id).style.display='block'

}
else
{
document.getElementById(temp).src='img/tempinfo.png'
 document.getElementById("tempspan:"+id).style.display='none'
}
}
function temporalopacity(name,val)
{

    var c = map.layers;	
	var f = "temporal_opacity:"+name;
		name='temporal:'+name;
    for (var b = 1; b < c.length; b++) 
	{
      
        if ( c[b].name == name) {
		
            var e = (parseFloat(OpenLayers.Util.getElement(f).value) + val).toFixed(1);
            e = Math.min(0.9, Math.max(0.1, e));
            document.getElementById(f).value = e;
            c[b].setOpacity(e)
        }
    }

}
 //end

 
 //code for right click //29-10-15
 	OpenLayers.Control.Click2 = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},
		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.onClick
				}, this.handlerOptions
			);
		}, 
		onClick: function(e) {
			var lonlat = map.getLonLatFromPixel(e.xy);
			var url = "/2dresources/user_content/addContentFramenew.php?x="+lonlat.lat+"&y="+lonlat.lon;			
			if(clickflag == 1)
			{
				
				var x=document.getElementById("pdataform");
				var y=(x.contentWindow || x.contentDocument);
				if (y.document)
					y=y.document;
				
				y.getElementById("latitude").value = lonlat.lat;
				y.getElementById("longitude").value = lonlat.lon;
				
				y.getElementById('info').innerHTML='<span  style="color:#FF0000; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold;">On Submitting you are Agreeing to the Policies and the Added Content will be visible after Validation</span>';
			}
			else
			{	
				clickflag = 1;
				loadaddcontent("#addcontent", url, "Add Content", "390", "520");
			}
			addmarker(lonlat.lat,lonlat.lon);
		},
		
		CLASS_NAME: "OpenLayers.Control.Click2"
	});
	
	function actvRemarks()
	{
		if (bhuvanusername == "empty") {
			alert("Login is required to Add Content, Please Login");
			

					load_video('#LoginFrame','loading.php?q=login.php','Login','900','700');
					$('#LoginFrame').bind('dialogclose',function(event){
					$('#LoginFrame').unbind();
						if(bhuvanusername == "empty")
							return;
					click.activate();		
					var url = "/2dresources/user_content/addContentFramenew.php?x=&y=";			
					loadaddcontent("#addcontent", url, "Add Content", "390", "520");
					clickflag = 1;	
			   });
			return;

			
		}
		else
		{			
			click.activate();		
			var url = "/2dresources/user_content/addContentFramenew.php?x=&y=";			
			loadaddcontent("#addcontent", url, "Add Content", "390", "520");
			clickflag = 1;			
		}
	}	
	function deactvRemarks()
	{
		clickflag = 0;
		click.deactivate();
	}	
	function reloadAdd(res, x, y)
	{
		var response = res.split('::');
		if(response[0]=='Error')
		{
			alert('Error on Submit:..'+response[1]);
			var url = "/2dresources/user_content/addContentFramenew.php?x="+x+"&y="+y;			
			loadaddcontent("#addcontent", url, "Add Content", "390", "520");	
		}
		else
		{		   
			var url = "/2dresources/user_content/addContentFramenew.php?x=&y=";			
			loadaddcontent("#addcontent", url, "Add Content", "390", "520");	
		}
	}
 function loadaddcontent(g, e, j, h, f) {

		$(function () {
			$(g).dialog({
				autoOpen: false,
				resizable: false,
				width: h,
				height: f,
				position: [300, 125],
				close: function () { deactvRemarks(); },
				zIndex: 3000,
				title: j
			});
		
			$(g).load(e.replace(/ /g, " ")).dialog("open");
		})
	}
 
 function rightpop(e) {
	
var lonlat = map.getLonLatFromViewPortPx(e.xy);
$("div.popup").remove();
$("<div class='popup' id='rightpop' ><table width='140px' style='cursor:pointer;'><tr style='background-color:#ffffff;' onmouseover='this.style.background=\"#f6e3ce\"' onmouseout='this.style.background=\"#ffffff\"'  width='130px' ><td> &nbsp;&nbsp;<a onclick='raddcontent("+lonlat.lat+","+lonlat.lon+")' >Add Content</a> &nbsp;&nbsp;  <a id='closepop'  ><img src='img/closetool.jpg' height='15px' width='15px' onclick='rclosepopup()'/></a></td></tr><tr style='background-color:#cef6ec' onmouseover='this.style.background=\"#f6e3ce\"' onmouseout='this.style.background=\"#cef6ec\"'  width='130px' ><td> &nbsp;&nbsp;<a onclick='rproximity("+lonlat.lat+","+lonlat.lon+")' >Proximity</a></td></tr></td> </div>").appendTo("body");
document.getElementById("rightpop").style.left=e.clientX+'px';
document.getElementById("rightpop").style.top=e.clientY+'px';

}
       
function raddcontent(lat,lon)
{
var url = "/2dresources/user_content/addContentFramenew.php?x="+lat+"&y="+lon;
rclosepopup();
services('t',false);
if(bhuvanusername == "empty")
{
load_video('#LoginFrame','loading.php?q=login.php','Login','900','700');
$('#LoginFrame').bind('dialogclose',function(event){
$('#LoginFrame').unbind();
if(bhuvanusername == "empty")
return;
loadaddcontent("#addcontent", url, "Add Content", "390", "520");
click.activate();
addmarker(lat,lon);

});
return;
}
loadaddcontent("#addcontent", url, "Add Content", "390", "520");
click.activate();
addmarker(lat,lon);

}

function rclosepopup()
{
document.getElementById("rightpop").style.display="none";
}
var markerlayer=null;
function addmarker(x,y) {
if(markerlayer){
markerlayer.removeAllFeatures();
}
else{
markerlayer = new OpenLayers.Layer.Vector("Simple Geometry", {	style: layer_style,	renderers: renderer});
map.addLayer(markerlayer);	
}
var a = new OpenLayers.Geometry.Point(y,x);
a = new OpenLayers.Feature.Vector(a, {
		id: fid	},	{ externalGraphic: "img/marker.png", graphicHeight: 17, graphicWidth: 16	});
markerlayer.addFeatures([a]);
}

function creatediv(divname)
{
var iDiv = document.createElement('div');
iDiv.id = divname;
iDiv.style = 'display:none';
// Then append the whole thing onto the body
document.getElementsByTagName('body')[0].appendChild(iDiv);
}
//right click ends here
//Display of VGI
 function changeurl()
 { 
		kml_all[2].setVisibility(true);
			var b11 = map.getExtent().toArray();		
			var	sql =""+b11[0]+" "+b11[1]+","+b11[0]+" "+b11[3]+","+b11[2]+" "+b11[3]+","+b11[2]+" "+b11[1]+","+b11[0]+" "+b11[1]+"";			
			b11="/2dresources/user_content/portalviewernew.php?sql="+sql+"&category=c102&zoom="+map.getZoom()+"&username="+bhuvanusername;
			kml_all[2].refresh({url:b11});	
		
 }
function onFeatureSelectR(event) {
var feature=event.feature
		selectedFeature = feature;		
		var attributes = feature.attributes;
		var popstr="<div style='font-size:10pt'><table border='0'>";
		popstr +="<tr><td colspan='2'><b>Message</b></td></tr>";										
		if(attributes.name)
			popstr +="<tr><td>"+attributes.name+"</td></tr>";
		
		if(attributes.username)
                             popstr += "<tr><td> <font color='red' >This information is posted by "+attributes.username+"</font></td></tr>";
		 if(attributes.photo)
                      popstr += "<tr><td><img src='/2dresources/user_content/upload/photos/"+attributes.photo+"' height='120' width='250'></img></td></tr>";	
		 if(attributes.posttime)
                              popstr += "<tr><td>Date of Creation: "+attributes.posttime+"</td></tr>";
                 popstr+="<tr><td>&nbsp;</td></tr>";
		 if(attributes.info)
                             popstr += "<tr><td width='250' valign='top'><i>Information : "+attributes.info+"</i></td></tr>";
						
		popstr +="</table></div>";
		popstr +="</table></div>";		
	var	popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), null, popstr, null, true);
		feature.popup = popup;                
		map.addPopup(popup);
	}    
 function checkSelected(id)
{
	changeurl()
}

function ajax2(url,div_name)
{	
	var req = getXMLHTTP();		
		if (req) {			
			req.onreadystatechange = function() {
				if (req.readyState == 4){					
					if (req.status == 200) 	{					
					document.getElementById(div_name).innerHTML=req.responseText;
					if(bhuvanusername=='empty'){
					var k= document.getElementById('minuslevel102');				
						if(k)
					k.style.display='none';
					}
				var sql='12 12,12 12,12 12,12 12,12 12';	
				b11="https://bhuvan-app1.nrsc.gov.in/2dresources/user_content/portalviewernew.php?sql="+sql+"&category="+''+"&zoom="+0+"&username="+bhuvanusername;
				kml_all[1].setVisibility(true);
				kml_all[1].refresh({url:b11});					
					}
				}				
			}			
			req.open("GET", url, true);
			req.send(null);
		}			
}
function poidivload(){			
		ajax2("get/poidivnew.php","poidiv");
}

var displayname="";
//Print
function proceedpdf()
{

	
	
 document.getElementById('desc').value=document.getElementById("descpdf").value;
 document.getElementById("printbutton").disabled=true;
 document.getElementById("LoadingDiv").style.display="inline";
 document.getElementById("loadingprint").style.display="inline";
           
		   var length=map.layers.length;
		  var layerlist='';
		  var urllist='';     
			 for(i=1;i<length;++i)
			 {
			 if(map.layers[i].getVisibility() )
			 {
			   if(typeof map.layers[i].url!='undefined')//Removing Tilecache layers
			   {
			   
			     if(map.layers[i].params.LAYERS!='basemap:waterbody_DEM'&& (map.layers[i].name).match("WMS_") != "WMS_"  ) //Removing WMS Manager Layers 
				  {
				
				      
						
            			displayname=map.layers[i].name;
					   layerlist=layerlist+'::'+map.layers[i].params.LAYERS;
					   urllist=urllist+'::'+map.layers[i].url;
					  
			     }
			   }
			 }
		
			 }
			 layerlist=layerlist.substring(2); 
			 urllist= urllist.substring(2); 
			
			 var layerinfo=layerlist+"##"+urllist;
			
	
		    var bounds = new OpenLayers.Bounds();
			bounds = map.getExtent();
			b11 = bounds.toArray(); 
			var	bstr =	b11[0].toFixed(2)+","+b11[1].toFixed(2)+":"+b11[2].toFixed(2)+","+b11[3].toFixed(2);
			//for Scale Purpose
			var scale=OpenLayers.Number.format(map.getScale());
			scale='Scale 1:'+scale;
			
			var	sql =""+b11[0]+" "+b11[1]+","+b11[0]+" "+b11[3]+","+b11[2]+" "+b11[3]+","+b11[2]+" "+b11[1]+","+b11[0]+" "+b11[1]+"";	
		    document.getElementById("sql").value=sql;		
				
			document.getElementById("scale").value=scale;
			document.getElementById("bounds").value=bounds;
			document.getElementById("zoom").value=map.getZoom();
			var width=(document.getElementById('map').offsetWidth)*0.7+"px";	//Taking 20% width Off for Left panel 
	        var height=document.getElementById('map').offsetHeight+"px";
			document.getElementById("height").value=height;
			document.getElementById("width").value=width;
			var resarray='';
			for(i=0;i<map.getNumZoomLevels();i++)
				resarray=resarray+map.getResolutionForZoom(i)+',';
	       
					
			$.ajax({
			method: 'post',
			url: 'usrtasks//print/printpdf/get/getiframe_generic.php',
			data: {
			'bounds':bstr,
			'layerinfo':layerinfo+"___"+resarray,
		    'scale':scale,	
			'lat': map.getCenter().lat,
			'lon': map.getCenter().lon,
			'zoom':map.getZoom(),
			'width':width,
			'height':height,
            'key':Math.random()
			},
			success: function(data) {
			document.getElementById('printiframe').src=data;
			$("#printiframe").ready(function() {
			$("#printiframe").show();
			setTimeout(function(){document.getElementById('printiframe').style="display:none";load(layerinfo,data.split("&filename=")[1],bstr)}, 12000);
			
			});
			
			
			
			}
			});

 
 }

 
		function load(layerinfo,filename,bounds){
		
			if(document.getElementById("titlepdf").value!='') 
				document.getElementById('title').value=document.getElementById("titlepdf").value;
			else
				document.getElementById('title').value=pagetitle;
				
				
			var d="";
			var splitvals=["lulc250","lulc50","lulc502","ero","sal","wl50"];
			var myarr = ["terrain", "Roadmap via Rediff","osm","base_town","clusterphotos","photos","Point Data","Simple Geometry","waterbodies_grouped","SOI Mosaic Roads","watershed_grouped","country","bhuvantransportnetwork","admin_grouped","OpenLayers_Control_SelectFeature_1856_container"];
			for (var b = map.layers, c = 1, length=b.length; c < length; c++)
			{ 
			if((myarr.indexOf(b[c].name) < 0) && (b[c].visibility) && b[c].name.indexOf("OpenLayers_Control_SelectFeature") <0)
			{
			if($.inArray(b[c].name.split("_")[0], splitvals) > -1)
			d=d+b[c].name.split("_")[0]+"::"+b[c].params.LAYERS+"__";
			else if(b[c].params)
			d=d+b[c].name+"::"+b[c].params.LAYERS+"__";

			}

			}		
							
			document.getElementById('displayname').value=d;	
		    document.getElementById('printiframe').style.display="none";
			document.getElementById('legendurl').value=layerinfo;
			document.getElementById("LoadingDiv").style.display="none";
			document.getElementById("printbutton").disabled=false;
			alert("PDF Report Generated.");
			document.getElementById("loadingprint").style.display="none";
			$('#printDialog').dialog('close');
			document.getElementById('filename').value=filename;
		    //document.getElementById('legendurl').value=document.getElementById('legendurl_pdf').src;
			
			document.getElementById('bounds').value=bounds;
			document.getElementById('source').value=window.location.href;
			
			var oWin = window.open("usrtasks/Print/inputForm.php") ;
			if (oWin==null || typeof(oWin)=="undefined") alert("Popup Blocker enabled.Please allow Popup Blocker for bhuvan-staging.nrsc.gov.in and try again.");
			else
			{
				oWin.close();
				document.getElementById('pdfform').submit();
			}
		
			}
//end of display of vgi



//Navigation & Proximity,Print
 function loadnavigation(name, video, tit, w, h)
		{
			wmsmgrdbox = $(name).dialog({
				autoOpen: false,
				resizable: false,
				width: w,
				position: [350,100],
				close: function () {resetNav(); 				},
				zIndex: 3100,
				title: tit
			});
			wmsmgrdbox.load(video.replace(/ /g,"%20")).dialog("open");
		}
		
	function get_geocode_result(marker_name)
	{
		temp_m=marker_name;
		var search_id=document.getElementById(marker_name);
		if(search_id.value==''){search_id.focus();return false;}
		document.getElementById(marker_name+"-suggestion").innerHTML='<div style="padding: 0 12px; color: #777">Loading..</div>';
		/*put your REST license key here, you can use it through REST request in any dynamic page for security of your REST license key. */
		var geocode_api_url="https://api.mapmyindia.com/v3?fun=geocode&lic_key=26d8w76awmxtio5g368s4t3og82xhapu&q="+search_id.value+"&callback=display_geocode_result";
		var scriptTag = document.createElement('SCRIPT');scriptTag.src = geocode_api_url;document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
	}
 
	function display_geocode_result(data)
	{
		latitudeArr=[];longitudeArr=[];details = [];
		
		var result_string='<div style="font-size: 13px">';
		var num=1;
		var flag=0;
		data.forEach( function( item )
		{
			flag=1;
			var lng=item["lng"];
			var lat=item["lat"];
			var address=item["formatted_address"];

		var content = new Array();
		if(item["city"]!='') content.push('<tr><td style="white-space:nowrap">City</td><td width="10px">:</td><td>'+item["city"]+'</td></tr>');
		if(address!='') content.push('<tr><td style="white-space:nowrap" valign="top">Formatted address</td><td width="10px" valign="top">:</td><td valign="top">'+address+'</td></tr>');
		result_string+='<li onmouseover="this.style.color=\'blue\';" onmouseout="this.style.color=\'black\';" style="cursor:pointer;vertical-align:middle;color:black;" onclick="show_geocode_details(\''+(address)+'\','+lng+','+lat+')">'+address+'</li>';
		longitudeArr.push(lng);
		latitudeArr.push(lat);
 
	});
	if(flag==0)
	{
		document.getElementById(temp_m+"-suggestion").innerHTML='Result Not Found';
		document.getElementById(temp_m+"-suggestion").style.display="none";
		document.getElementById(temp_m).value="";
		return;
	}
	document.getElementById(temp_m+"-suggestion").style.display="inline";
	document.getElementById(temp_m+"-suggestion").innerHTML=result_string+'</div>';/***put geocode result in div****/

}
function show_geocode_details(text,lon,lat)
{

		document.getElementById(temp_m).value=text;
		addmarker(lat,lon);
		map.setCenter(new OpenLayers.LonLat(lon,lat), 0); //Zoom to max level
		document.getElementById(temp_m+"-suggestion").style.display="none";
		document.getElementById(temp_m+"-hidden").value=lat+","+lon;
}		


//MMI

 var alternate_route=null;var poly=[];var advice_direct_route; var direct_route_info;
var via_points="";var alternatives_o;
function get_route_result(flag)
{
	document.getElementById("start-suggestion").style.display="none";
	document.getElementById("destination-suggestion").style.display="none";
	document.getElementById("via-suggestion").style.display="none";
	if(lastpopup)
		map.removePopup(lastpopup);
	if(viamarkers){
	viamarkers.removeAllFeatures();
	}	
		
	if(document.getElementById('start').value=='')
	{
	alert("Please Enter Start Point");
    return;		
	
	}
	if(document.getElementById('destination').value=='')
	{
	alert("Please Enter Destination Point");
    return;		
	
	}
 var start_points=document.getElementById('start').value;
 var regexLetter = /[a-zA-Z]/;
		 if (regexLetter.test(start_points)) 
		 start_points=document.getElementById('start-hidden').value;


var destination_points=document.getElementById('destination').value;/**get destination points**/
	 if (regexLetter.test(destination_points)) 
		 destination_points=document.getElementById('destination-hidden').value;
		 
via_points=document.getElementById('via').value;/**get destination points**/
	 if (regexLetter.test(via_points))
	{	 
		 via_points=document.getElementById('via-hidden').value;
		 	
	}	 
	
var rtype=document.getElementById('rtype').value;/**get route type**/
var vtype=0;/**get vehicle type**/
var avoids=4;/**get unpaved avoids**/
var advices_o=1;/**get advices option**/
alternatives_o=true;/**get alternatives option**/
/**put your REST api lisense key here***/
var route_api_url="https://api.mapmyindia.com/v3?fun=route&lic_key=26d8w76awmxtio5g368s4t3og82xhapu&start="+start_points+"&destination="+destination_points+"&viapoints="+via_points+"&rtype="+rtype+"&vtype="+vtype+"&avoids="+avoids+"&with_advices="+advices_o+"&alternatives="+alternatives_o+"&callback=route_api_result";
var scriptTag = document.createElement('SCRIPT');scriptTag.src = route_api_url;document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
var start_points_array=start_points.split(",");
var destination_points_array=destination_points.split(",");
if(flag==true)
{}
else
{
show_markers("start",start_points_array);/*********show start points marker********/
show_markers("destination",destination_points_array); /*********show destination points marker********/
}
if(advice_marker) advice_marker.removeAllFeatures();/***remove if any existing marker***/
mapmyindia_fit_into_bound(start_points_array,destination_points_array);
if(start_info_window) start_info_window.visible(null); /*******remove existing info_windows***/
document.getElementById('direct_advices').style.display="inline-block";
document.getElementById('direct_advices').innerHTML="<font color='red'>Please wait.. loading..</font>";
document.getElementById('alternatives_advices').innerHTML="";
if(poly['direct']) poly['direct'].removeAllFeatures();if(poly['alternate']) poly['alternate'].removeAllFeatures();/*********remove direct route polyline*************/
}
 
 
function route_api_result(data)
{
var alternate_route1_text="";var alternate_route2_text="";var direct_route='Route';
alternate_route=data.alternatives;document.getElementById("alternate").style.display="none";
if(typeof alternate_route[0]!='undefined') /***get first alternative route***/
{
var duration1=alternate_route[0].duration;/**time in seconds*************/
var hours1 = Math.floor(duration1/3600);duration1 %=3600; var minutes1 = Math.floor(duration1 / 60);
var total_time1=(hours1 >=1 ? hours1+" hrs " : '')+(minutes1 >=1 ? minutes1+" min" : '');
var length1=(alternate_route[0].length)/1000;
alternate_route1_text='<td ><div style="padding:5px 5px 5px 15px;color:#000;border-left:1px solid #ddd;cursor:pointer" onclick="document.getElementById(\'direct_advices\').style.display=\'none\';document.getElementById(\'alternatives_advices\').style.display=\'inline-block\';alternative_route(0)"><span style="font-size:13px;padding:2px 0 20px 0;color:#222">Route 2</span><br><span style="font-size:11px;line-height:16px;color:#555">'+total_time1+'<br>'+length1.toFixed(1)+' km</div></td>';
direct_route='Route 1';
}
if(typeof alternate_route[1]!='undefined') /***get second alternative route***/
{
var duration2=alternate_route[1].duration;/**time in seconds*************/
var hours2 = Math.floor(duration2/3600);duration2 %=3600; var minutes2 = Math.floor(duration2 / 60);
var total_time2=(hours2 >=1 ? hours2+" hrs " : '')+(minutes2 >=1 ? minutes2+" min" : '');
var length2=(alternate_route[1].length)/1000;
alternate_route2_text='<td ><div style="padding:5px 5px 5px 15px;color:#000;border-left:1px solid #ddd;cursor:pointer" onclick="document.getElementById(\'direct_advices\').style.display=\'none\';document.getElementById(\'alternatives_advices\').style.display=\'inline-block\';alternative_route(1)"><span style="font-size:13px;padding:2px 0 20px 0;color:#222">Route 3</span><br><span style="font-size:11px;line-height:16px;color:#555">'+total_time2+'<br>'+length2.toFixed(1)+' km</div></td>';
 
}
/***check & display alternative route option*****/
var way=data.trips[0];var way1=data.trips[1];
if(via_points=="")
{
var trips=data.trips;
var duration=way.duration;/**time in seconds*************/
var hours = Math.floor(duration/3600);duration %=3600; var minutes = Math.floor(duration / 60);
var total_time=(hours >=1 ? hours+" hrs " : '')+(minutes >=1 ? minutes+" min" : '');
var length=(way.length)/1000;
var levels=decode_levels(way.lvls);
var pts=decode_path(way.pts);
var advices=way.advices; /****advice & display **************/
}
else
{
/*******if via points is provided use trip[0] & trip[1] also************/
var duration=way.duration+way1.duration;/**time in seconds*************/
var hours = Math.floor(duration/3600);duration %=3600; var minutes = Math.floor(duration / 60);
var total_time=(hours >=1 ? hours+" hrs " : '')+(minutes >=1 ? minutes+" min" : '');
var length=(way.length+way1.length)/1000;
var levels=decode_levels(way.lvls).concat(decode_levels(way1.lvls));
var pts=decode_path(way.pts).concat(decode_path(way1.pts));/****points trip[0] & trip[1] to display **************/
var advices=way.advices.concat(way1.advices); /****advice trip[0] & trip[1] to display **************/
}
/***********display advices***********/
direct_route_info='<table width="100%"><tr><td ><div style="padding:5px;cursor:pointer;background:#87cefa" onclick="document.getElementById(\'direct_advices\').style.display=\'inline-block\';document.getElementById(\'alternatives_advices\').style.display=\'none\';poly[\'alternate\'].removeAllFeatures();"><span style="font-size:13px;padding:2px 0 20px 0;color:#222">'+direct_route+'</span><br><span style="font-size:11px;line-height:16px">'+total_time+'<br>'+length.toFixed(1)+' km</span></div></td>'+alternate_route1_text+alternate_route2_text+'</tr></table>';
document.getElementById('info').innerHTML=direct_route_info;
advice_direct_route='<span style="font-size:13px;padding-left:5px">'+direct_route+'</span><table width="100%" align="center">';
var num_rec=1;var distance;var go="";
advices.forEach( function( advice ){
var icon=advice.icon_id;
var meters=advice.meters;
var distance_meters=meters-distance;
distance=meters;1
var advice_meters=(distance_meters >=1000 ? (distance_meters/1000).toFixed(1) +" km " : distance_meters+" mts ")
var text=advice.text;
if(meters!=0) {go="<br>Go "+advice_meters;advice_direct_route+=go+'</td></tr>';}
var advice_pt=advice.pt;
 
advice_direct_route+='<tr onclick="show_route_details('+advice_pt.lat+','+advice_pt.lng+',\''+text+'\')" style="cursor:pointer;"><td valign="top" style="padding:5px 0px 5px 0px"><img src="https://api.mapmyindia.com/images/step_'+icon+'.png" width="30px"></td><td style="padding:5px;border-top: 1px solid #e9e9e9;">'+text;
})
document.getElementById('direct_advices').innerHTML=advice_direct_route+"</table>";
/***********display path***********/
var pathArr=[];
pts.forEach( function( pt ){
pathArr.push([pt[0],pt[1]]);
})
draw_polyline("direct",levels,pathArr);/***********draw polyline***/

//For adding markers
 var regexLetter = /[a-zA-Z]/;
via_points=document.getElementById('via').value;/**get destination points**/

	 if (regexLetter.test(via_points))
	{	 
		 via_points=document.getElementById('via-hidden').value;
		 viamarker(via_points);
	}	 
	else
	{ 
	   if(via_points!='')
       {	   
		
		viamarker(via_points);
	  }	
	}

}
 
function alternative_route(route_no)
{
if(advice_marker) advice_marker.removeAllFeatures();if(start_info_window) start_info_window.removeAllFeatures(); /***remove advices marker & info windows if exist**/
var way=alternate_route[route_no];var way1=alternate_route[1];
var levels=decode_levels(way.lvls);
var pts=decode_path(way.pts);
var advices=way.advices; /****advice & display **************/
var advice_alternative_route='<span style="font-size:13px;padding-left:5px">Route '+(route_no+2)+'</span><table width="100%" align="center">';
var num_rec=1;var distance;var go="";
advices.forEach( function( advice ){
var icon=advice.icon_id;
var meters=advice.meters;
var distance_meters=meters-distance;
distance=meters;1
var advice_meters=(distance_meters >=1000 ? (distance_meters/1000).toFixed(1) +" km " : distance_meters+" mts ")
var text=advice.text;
if(meters!=0) {go="<br>Go "+advice_meters;advice_alternative_route+=go+'</td></tr>';}
var advice_pt=advice.pt;
 
advice_alternative_route+='<tr onclick="show_route_details('+advice_pt.lat+','+advice_pt.lng+',\''+text+'\')" style="cursor:pointer;"><td valign="top" style="padding:5px 0px 5px 0px"><img src="https://api.mapmyindia.com/images/step_'+icon+'.png" width="30px"></td><td style="padding:5px;border-top: 1px solid #e9e9e9;">'+text;
})
document.getElementById('alternatives_advices').innerHTML=advice_alternative_route+"</table>";
document.getElementById('direct_advices').style.display='none';/************hide direct advices******/
document.getElementById('alternatives_advices').style.display='inline-block';/************hide direct advices******/
/***********display path***********/
var pathArr=[];
pts.forEach( function( pt ){
pathArr.push([pt[0],pt[1]]);
})
if(poly['alternate']) poly['alternate'].removeAllFeatures();draw_polyline("alternate",levels,pathArr);/***********draw polyline***/
}
 var selectControl;
function draw_polyline(route,levels,pathArr)
{	/**draw polyline******************************/


var polyline_color='orange';

if(route=='direct'){ if(poly[route]) { poly[route].removeAllFeatures();} var polyline_color='blue';}
var lineLayer = new OpenLayers.Layer.Vector("Line Layer"); 

map.addLayer(lineLayer);                    
map.addControl(new OpenLayers.Control.DrawFeature(lineLayer, OpenLayers.Handler.Path));                                     
var points=new Array();

for(i=0;i<pathArr.length;i++)
{

 var temp=(pathArr[i]+"").split(",");

	 points[i]= new OpenLayers.Geometry.Point(temp[1], temp[0]);
  
  

}
var line = new OpenLayers.Geometry.LineString(points);

var style = { 
  strokeColor: polyline_color, 
  
  strokeWidth: 5
};

var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
lineLayer.addFeatures([lineFeature]);

poly[route]=lineLayer;

}
var show_marker=[];
var marker_layer;
var selectControl_nav;
function show_markers(marker_name,points)
{
	if(show_marker[marker_name]) {  show_marker[marker_name].removeAllFeatures(); map.removeLayer( show_marker[marker_name]);}/***remove if any existing marker***/
	var a = new OpenLayers.Geometry.Point(points[1],points[0]);

	if(marker_name=='start') {var icon="img/nav/start.png";var title="Start Point";} else {var icon="img/nav/stop.png";var title="Destination Point";}

	a= new OpenLayers.Feature.Vector(a, {
			id: fid	},	{ externalGraphic:icon, graphicHeight: 17, graphicWidth: 16	});
			
	show_marker[marker_name] = new OpenLayers.Layer.Vector("Simple Geometry", {	style: layer_style,	renderers: renderer});
	show_marker[marker_name].addFeatures([a]);
	map.addLayer(show_marker[marker_name]);	


	map.addControl(new OpenLayers.Control.DragFeature(show_marker[marker_name], {
	  autoActivate: true,
	 onComplete: function (feature) {
	  
		document.getElementById(marker_name).value=(feature.geometry.y).toFixed(2)+","+(feature.geometry.x).toFixed(2);
		get_route_result(true);
		}
})); 

if( show_marker['destination'] && show_marker['start'] )
{
	if(selectControl_nav)
	{
		selectControl_nav.deactivate();
		map.removeControl(selectControl_nav);
		

	}
	
 selectControl_nav = new OpenLayers.Control.SelectFeature(
          [show_marker['destination'],show_marker['start']]
        );
	
	map.addControl(selectControl_nav);
	selectControl_nav.activate();
}


}


 
var advice_marker,lastpopup;
function show_route_details(advice_lat,advice_lng,advice_text)
{

	  // The overlay layer for our marker, with a simple diamond as symbol
		var overlay = new OpenLayers.Layer.Vector('Overlay', {
			styleMap: new OpenLayers.StyleMap({
				externalGraphic: 'img/marker.png',
				graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
				title: '${tooltip}'
			})
		});

		// The location of our marker and popup. We usually think in geographic
		// coordinates ('EPSG:4326'), but the map is projected ('EPSG:3857').
		var myLocation = new OpenLayers.Geometry.Point(advice_lng,advice_lat);
		 

		// We add the marker with a tooltip text to the overlay
		overlay.addFeatures([
			new OpenLayers.Feature.Vector(myLocation, {tooltip: advice_text})
		]);

		// A popup with some information about our location
		var popup = new OpenLayers.Popup.FramedCloud("Popup", 
			myLocation.getBounds().getCenterLonLat(), null,advice_text, null,
			true // <-- true if we want a close (X) button, false otherwise
		);
		if(lastpopup)
			map.removePopup(lastpopup);
	   lastpopup=popup;
	 
		// and add the popup to it.
		map.addPopup(popup);

	map.setCenter(new OpenLayers.LonLat(advice_lng,advice_lat), 0); //Zoom to max level
	//show_info_window(advice_pos,advice_text)
	}
	/*******************************/
	var decode_path = function(encoded) {
	var pts = [];
	var index = 0, len = encoded.length;
	var lat = 0, lng = 0;
	while (index < len) {
	var b, shift = 0, result = 0;
	do {
	b = encoded.charAt(index++).charCodeAt(0) - 63;
	result |= (b & 0x1f) << shift;
	shift += 5;
	} while (b >= 0x20);
	 
	var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
	lat += dlat;
	shift = 0;
	result = 0;
	do {
	b = encoded.charAt(index++).charCodeAt(0) - 63;
	result |= (b & 0x1f) << shift;
	shift += 5;
	} while (b >= 0x20);
	var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
	lng += dlng;
	pts.push([lat / 1E6, lng / 1E6]);
	}
	return pts;
	};
	 
	var decode_levels = function(str){
	var lvs = new Array(parseInt(str.length / 2));
	var val = 0, i = 0, j = 0, k = 0;
	while (i < str.length) {
	val = 0;
	k = 0;
	for (; i < str.length; i++) {
	var b = str.charCodeAt(i) - 63;
	val |= (b & 0x1F) << k;
	if (!(b & 0x20))
	break;
	k += 5;
	}++i;
	lvs[j++] = val;
	}
	lvs.length = j;
	return lvs;
};
 
Array.max = function(array) { return Math.max.apply(Math, array);};
Array.min = function(array) { return Math.min.apply(Math, array);};
function mapmyindia_fit_into_bound(start_points_array,destination_points_array)
{
	var latitudeArr = [start_points_array[0],destination_points_array[0]];
	var longitudeArr = [start_points_array[1],destination_points_array[1]];
	var bounds = new OpenLayers.Bounds(Array.min(longitudeArr),Array.min(latitudeArr),Array.max(longitudeArr),Array.max(latitudeArr));
	map.zoomToExtent(bounds);

}
 
var start_info_window;
function show_info_window(pos,text)
{
	if(start_info_window) start_info_window.visible(null); /*******remove existing info_windows***/
	start_info_window = new mireo.map.info_window({/****info_window display, for more visit detail documentation **/
	position: pos,
	auto_close: false,
	arrow_pos: mireo.map.info_window.arrow_left,
	info_content: '<table style=\"width:250px;padding:10px;font-size: 10px;font-type: bold;\"><tr><td>'+text+'</td></tr></table>',
	pix_offset: new mireo.base.point(20, -15),
	map: map,
	});
}
var viamarkers;
function viamarker(viapts) {
	if(viamarkers){
	viamarkers.removeAllFeatures();
	}
	viamarkers = new OpenLayers.Layer.Vector("Simple Geometry", {	style: layer_style,	renderers: renderer});
	temp=viapts.split('|');
	for(i=0;i<temp.length;i++)
	{
	var d=temp[i].split(',');
	var a = new OpenLayers.Geometry.Point(d[1],d[0]);
	a = new OpenLayers.Feature.Vector(a, {
			id: fid	},	{ externalGraphic: "img/marker.png", graphicHeight: 17, graphicWidth: 16	});
	viamarkers.addFeatures([a]);
	}
	map.addLayer(viamarkers);
	
}
function resetNav()
{
	if(lastpopup)
		map.removePopup(lastpopup);
	if(viamarkers){
	viamarkers.removeAllFeatures();
	}	
	if(markerlayer)
		markerlayer.removeAllFeatures();
	if(selectControl_nav)
	{
		selectControl_nav.deactivate();
		map.removeControl(selectControl_nav);
		

	}
	addselectcontrol();
	if(show_marker['start']) {  show_marker['start'].removeAllFeatures();	}
	if(show_marker['destination']) {  show_marker['destination'].removeAllFeatures();	}
    if(advice_marker) advice_marker.removeAllFeatures();
	if(poly['direct']) { poly['direct'].removeAllFeatures();}
	if(poly['alternate']) poly['alternate'].removeAllFeatures();	
}

//For  Print
	
	function printDirections()
	{
			
			if(document.getElementById('direct_advices').innerHTML=='' && document.getElementById('alternatives_advices').innerHTML=='')
			{
				alert("Please get the route before to  take the print");
				return;
			}
			
			var d = new Date();
			document.getElementById("loadingdiv").style.display="";
			filename="directions_"+d.getTime()+".png";
			
			load_nav(filename);
	}

	function load_nav(filename){		
	
		    alert("PDF Report Generated.");
			document.getElementById("loadingdiv").style.display="none";
			document.getElementById('filename_nav').value=filename;
			document.getElementById('title_nav').value=pagetitle;
			document.getElementById('startp').value=document.getElementById('start').value 
			document.getElementById('destinationp').value=document.getElementById('destination').value
			
			if(document.getElementById('direct_advices').style.display=='none')
				document.getElementById('directions').value=document.getElementById('alternatives_advices').innerHTML;
			else if(document.getElementById('alternatives_advices').style.display=='none')
				document.getElementById('directions').value=document.getElementById('direct_advices').innerHTML;	
			//document.getElementById('bounds').value=bounds;
			
			
			var oWin = window.open("usrtasks/Print/inputForm.php") ;
			if (oWin==null || typeof(oWin)=="undefined") alert("Popup Blocker enabled.Please allow Popup Blocker for bhuvan.nrsc.gov.in and try again.");
			else
			{
				oWin.close();
				document.getElementById('pdfform_nav').submit();
			}
		
			}
	
	//For Proximity
function loadproximity(name, video, tit, w, h)
		{
			wmsmgrdbox = $(name).dialog({
				autoOpen: false,
				resizable: false,
				width: w,
				position: [350,100],
				close: function () {resetProximity();},
				zIndex: 3100,
				title: tit
			});
			wmsmgrdbox.load(video.replace(/ /g,"%20")).dialog("open");
			click_p.activate();
		}
var proximitylayer;	
var view_params='';	
function getProximity()
{
	if(document.getElementById("loc_p").value=='')
	{
		
		alert("Please specify the location");
		return;
	}	
		
    var regexLetter = /[a-zA-Z]/;
	if (regexLetter.test(document.getElementById('loc_p').value)) 
	{
		 var location=(document.getElementById('loc_p-hidden').value).split(",");
		xx=location[1];
		yy=location[0]; 
	}
	else
	{	
	var location=(document.getElementById("loc_p-hidden").value).split(",");
	xx=location[0];
	yy=location[1];
	}
	var cat=(document.getElementById("cat_p").value).replace(/[^a-zA-Z0-9]/g,'');

	if(document.getElementById("buf_p").value=='')
	{
			alert("Please specify the Buffer");
			return;
	}
	if(isNaN(document.getElementById("buf_p").value))
	{
			alert("Buffer value should be integer.");
			return;
	}
	if(document.getElementById("buf_p").value>100)
	{
			alert("Max Buffer limit is 100Km.");
			return;
	}
	var buf=(document.getElementById("buf_p").value)*1000;
	
		  $.ajax({url: "usrtasks/proximity/getbuffergeom.php?y="+xx+"&x="+yy+"&b="+buf, success: function(result){
            zoombuffer(result,'',true);
        }});	
	if(cat=='')
	{
		var params="xx:"+xx+";yy:"+yy+";buf:"+buf;
	}
	else
		var params="cat:"+cat+";xx:"+xx+";yy:"+yy+";buf:"+buf;
	var lyrurl = "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms";
	
	try{
	if(proximitylayer)
		map.removeLayer(proximitylayer);
	}
	catch(e)
	{
		
	}
	view_params=params;
	
	proximitylayer = new OpenLayers.Layer.WMS("Proximity", lyrurl, 
											{
												layers: 'mmi:proximity_analysis_v4', 
												viewparams:params,
												transparent: true
											}, 
											{
												isBaseLayer: false,
												visibility:true,
												transitionEffect:null,
												tileOptions: {maxGetUrlLength: 1024}
											});
	//addmarker(location[1],location[0]);
	
	map.addLayer(proximitylayer);
	id=18;
	
	if($('#identify'+id).attr("src").match("infono.png") )
	{
	removeidentifyinfo();
	$('#identify'+id).attr("src","img/info.png");
	idinfoid=0;
	return;
	}
	

	
	
	
}	
function resetProximity()
{
	
		try
		{
		if(proximitylayer)
			map.removeLayer(proximitylayer);
		if(markerlayer)
			markerlayer.removeAllFeatures();
		if (vectors2) 
			vectors2.removeAllFeatures();
		removeidentifyinfo();
		click_p.deactivate();	
		}
		catch (e)
		{
		 
		}	
		//addselectcontrol();
}	
function rproximity(lat,lon)
{
		if($("#addcontent").hasClass("ui-dialog-content"))
			$("#addcontent").dialog("close");
		if($("#suggestFrame").hasClass("ui-dialog-content"))
			$("#suggestFrame").dialog("close");

		loadproximity('#proximityframe','usrtasks/Proximity/proximity.php?x='+lat.toFixed(6)+'&y='+lon.toFixed(6),'Proximity Analayis','500','320');
		addmarker(lat,lon);
		click_p.activate();
		rclosepopup();
}
var vectors2;

function zoombuffer(dist_vector,dist_lab,type)
{


if (vectors2) {
        vectors2.removeAllFeatures();
		map.setLayerIndex(vectors2, 20);
		 } else {
        var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
        {strokeColor: "#FF0000",        strokeOpacity: 1,  strokeDashstyle: "dash",      strokeWidth: 3,        fillColor: "#FFFF00",		label : "${name}",		fontSize: "14px",        fontFamily: "Courier New, monospace",        fontWeight: "bold",		fillOpacity: 0.1},        OpenLayers.Feature.Vector.style["vectors2"]));
        vectors2 = new OpenLayers.Layer.Vector("Vector Layer", {styleMap: styleMap});
		map.addLayer(vectors2);
	    } 

parser = new OpenLayers.Format.WKT();
var geometry = parser.read(dist_vector);
var features = parser.read(dist_vector);
features.attributes = {
                name: dist_lab,
                favColor: 'black',
                align: 'lb'
            };
var bounds;
 if(features) {

                    if(features.constructor != Array) {
                        features = [features];
                    }
                    for(var i=0; i<features.length; ++i) {
                        if (!bounds) {
                            bounds = features[i].geometry.getBounds();
                        } else {
                            bounds.extend(features[i].geometry.getBounds());
                        }

                    }
				
				 vectors2.addFeatures(features);			 
				 map.zoomToExtent(bounds);
}
}

var idinfo,idpopup=null;
var idinfoid=0;

function removeidentifyinfo()
{
	if(idinfo)
	{
	idinfo.deactivate();
	map.removeControl(idinfo);
	}

popupControl.activate();
click_p.activate();
}

function identifyinfo_p(url,layername,id)
{
if(idinfoid!=0)
removeidentifyinfo();

if($('#identify'+id).attr("src").match("infono.png") )
{
removeidentifyinfo();
$('#identify'+id).attr("src","img/info.png");
idinfoid=0;
return;
}

var layer="";
for (var b = map.layers, c = 1, length=b.length; c < length; c++)
{

if(b[c].name==layername)
layer=b[c];
}
if(idinfo)
map.removeControl(idinfo);
if(layer=="")
{
alert("Please first overlay the layer");
return;
}
if(layer.getVisibility() == false)
{
alert("Please first overlay the layer");
return;
}

idinfo = new OpenLayers.Control.WMSGetFeatureInfo({	
					layers:[layer],
					url:url.replace("gwc/service/",""),
					layerUrls:[url],							
					title: 'Identify features by clicking',			
					queryVisible: true,		
					maxFeatures:1,
					vendorParams: {
					VIEWPARAMS: view_params
					},						
					eventListeners: {			
						getfeatureinfo: function(evt)
						{
						
						if(idpopup)
						map.removePopup(idpopup);
						idpopup = new OpenLayers.Popup.FramedCloud("chicken",  map.getLonLatFromPixel(evt.xy), new OpenLayers.Size(60, 10), "<div style='font-size:.8em' ><center>"+evt.text+ "</div>", null, true);		
						map.addPopup(idpopup);
						
						}
					}
     });
	
	popupControl.deactivate();
	click_p.deactivate();	 
	map.addControl(idinfo);
	idinfo.activate();
	$('#identify'+id).attr("src","img/infono.png");
	
	idinfoid=id;
}	
		//For Proximity
  var click_p;
	OpenLayers.Control.Click3 = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},
		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.onClick
				}, this.handlerOptions
			);
		}, 
		onClick: function(e) {
			var lonlat = map.getLonLatFromPixel(e.xy);
								
			document.getElementById("loc_p").value = (lonlat.lon).toFixed(2)+","+(lonlat.lat).toFixed(2);
			document.getElementById("loc_p-hidden").value = (lonlat.lon).toFixed(6)+","+(lonlat.lat).toFixed(6);
			
			
			addmarker(lonlat.lat,lonlat.lon);
		},
		
		CLASS_NAME: "OpenLayers.Control.Click2"
	});
	
//End of Proximity, Nav,Print	
///for catchment
//loading catchment tool
function loadcatchment(name, video, tit, w, h)
		{
			wmsmgrdbox = $(name).dialog({
				autoOpen: false,
				resizable: false,
				width: w,
				position: [350,100],
				close: function () {resetTimeout();resetcatchment();},
				zIndex: 3100,
				title: tit
			});
			wmsmgrdbox.load(video.replace(/ /g,"%20")).dialog("open");
			catchm();
		}
		//for deactiving catchment tool
function resetcatchment()
		{
			click5.deactivate();
			mapselection(1,0);
			 	 try { 

removelayer('wbis_catchment');	
removelayer('Boxes');
markerlayer.removeAllFeatures();
 }
catch (e) {
console.log(e);
}
}

function delina(val)
{
	
// alert(val);
click5.deactivate();
$("#deli").attr("disabled", true);
$("#dowmcatch").attr("disabled", true);
var lat= val.split('_')[0];
var lon=  val.split('_')[1];
if(lat!='' && lon!='' && lat!='undefined' && lon!='undefined')
{
//var url ='https://bhuvan.nrsc.gov.in/api/delineation/'+lat+'/'+lon;

var url ='https://bhuvan-noeda.nrsc.gov.in/wbisapi/delineation/'+lat+'/'+lon;

 try {
removelayer('wbis_catchment');	
}
catch (e) {
console.log(e);
}


document.getElementById("catchload").style.display = "block";
// document.getElementById("catchload").style.dispaly='block';
	$.ajax({ type: "GET",   
				url: url,   
				 async: true,
				 success : function(text)
				 {
					 click5.activate();
						 if(markerlayer){
									markerlayer.removeAllFeatures();
                				   } 
								   
								   zoom_to_centre(lon,lat,4);
				document.getElementById("catchload").style.display = "none";								
				 $('#deli').removeAttr('disabled');//Water_Bodies:catchment//hydro
				// alert(text['layer']);	
				//adding catchment layer
					catchmentlayer = new OpenLayers.Layer.WMS('wbis_catchment', 'https://bhuvan.nrsc.gov.in/nuis/wms?', {
			layers: 'wbis:catchment',
			viewparams:'catchment:l'+text['layer'],			
			transparent: true
			},
			{
			format: "image/png",
			isBaseLayer:false,
			transitionEffect:null
			});
			map.addLayer(catchmentlayer);
			catchmentlayer.redraw(true);
			document.getElementById("dowmcatch").value=text['layer'];
			$('#dowmcatch').removeAttr('disabled'); 
			/* document.getElementById("hydro").value=text['layer'];
			 $('#hydro').removeAttr('disabled'); */
				 }
		}).fail(
		function(xhr, status, error) {
				 console.log(arguments);
				 $('#deli').removeAttr('disabled');
				  click5.activate();	
				 document.getElementById("catchload").style.display = "none";
								 // alert('The server is busy at the moment. Please try again later');
														if(xhr.status==400)
														{
														
													alert(xhr.responseText);
													}
													}
		
		);  
// click2.deactivate();
	 
}
else
{
alert('please select catchment point');
 $('#deli').removeAttr('disabled');
 click5.activate();	
}
}
/* function logincheck(){
if (parent.bhuvanusername == "empty") {
			alert("Login is required to get Catchment, Please Login");
			

					load_video('#LoginFrame','loading.php?q=login.php','Login','900','700');
					$('#LoginFrame').bind('dialogclose',function(event){
					$('#LoginFrame').unbind();
						if(bhuvanusername == "empty")
							return;
						catchm();

						
					});
	}
	else
	{
		catchm();
	}
} */
function catchm()
{
	 try {
click_p.deactivate(); //removing click control for proximity if present
}
catch (e) {
console.log(e);
}
						// catchm();
	// alert('zoom fully and select catchment outlet point ');
	mapselection(0,1);
	         // var click_p,click, clickflag = 0;	
			 OpenLayers.Control.Click5 = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},
		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.onClick
				}, this.handlerOptions
			);
		}, 
		onClick: function(e) {
			var lonlat = map.getLonLatFromPixel(e.xy);
			$('#deli').removeAttr('disabled');
			
			document.getElementById("deli").value=lonlat.lat+'_'+lonlat.lon;
			//delina(lonlat);
								// alert(lonlat);
			// document.getElementById("loc_p").value = (lonlat.lon).toFixed(2)+","+(lonlat.lat).toFixed(2);
			// document.getElementById("loc_p-hidden").value = (lonlat.lon).toFixed(6)+","+(lonlat.lat).toFixed(6);
			
			
			addmarker(lonlat.lat,lonlat.lon);
			toBounds(200000,lonlat.lat,lonlat.lon);
		},
		
		CLASS_NAME: "OpenLayers.Control.Click2"
	});
	click5 = new OpenLayers.Control.Click5();
	map.addControl(click5);	 //adding click control for catchment 
		click5.activate();	
}
//function to create bbox
function toBounds(sizeInMeters,lat,lng) {
	// creating buffer based on selected lat lon
		var latAccuracy = 180 * sizeInMeters / 40075017,
		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * lat);
  var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
            layer_style.fillOpacity = 0;
			layer_style.strokeColor = "#ff0000";
try {
removelayer('Boxes');//remove Elarier bbox
}
catch (e) {

}
//creating bbox based buffer,lat and lon.
	var box_extents=[[lng - lngAccuracy ,lat - latAccuracy,lng + lngAccuracy,lat + latAccuracy]];
    var boxes  = new OpenLayers.Layer.Vector( "Boxes",{style: layer_style} );

                    bounds = OpenLayers.Bounds.fromArray(box_extents);                 
                    box = new OpenLayers.Feature.Vector(bounds.toGeometry());
                    boxes.addFeatures(box);

console.log(box_extents);
                map.addLayer(boxes);

	}
//function to zoom to center 	
function zoom_to_centre(lon,lat,level)
{
map.setCenter(new OpenLayers.LonLat(lon,lat),level);
}
//End of Catchment tool
function downcatch(val)
{
	var url='https://bhuvan3.nrsc.gov.in/2dresources/ffhmd/zip/'+val+'/catchment.zip'
	window.open(url);
	
}
//Download for Catchment boundary