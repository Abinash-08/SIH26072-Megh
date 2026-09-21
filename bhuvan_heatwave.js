
function init2()
{
// map.setCenter(new OpenLayers.LonLat(80.76,18.31), 1);
// $("#radio1").click();
document.getElementById("tempd").style.display="none";

// setbaselayer('m');
mapselection(1,0);
// Load default map on page load
loadMapData(formatDateStr(maxDate));
generateHourOptions(formatDateStr(new Date()));

}
var scode='';


function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].value== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}

function drawAoi(gm, type, suffix = "") {
  var xmlhttp = null;
  if(window.XMLHttpRequest)
    xmlhttp = new XMLHttpRequest();
  else
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

  xmlhttp.open("GET","usrtasks/heatwave/get/get_geom.php?type="+type+"&val="+gm,false);
  xmlhttp.send(null);
  var temp = xmlhttp.responseText;

  if(gm !== '' && gm !== 'all') {
    // Select the appropriate state dropdown by suffix
    var stateSelect = document.getElementById("statecode" + suffix);
    if (!stateSelect) return;
    
    var stateText = stateSelect.options[stateSelect.selectedIndex].text;
    
    distzoom(temp, stateText, true);
  }
}
var distzoom_counter=0;
var vectors1, vectors2;
function distzoom(dist_vector, dist_lab, flag) {
    distzoom_counter = 1;
    
    // Remove existing layer if any
    if (vectors1) {
        removelayer("VectorLayer", true);
        vectors1 = null;  // reset the reference
    }

    var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
        {
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWidth: 3,
            fillColor: "#FFFF00",
            label: "${name}",
            fontSize: "14px",
            fontFamily: "Courier New, monospace",
            fontWeight: "bold",
            fillOpacity: 0
        },
        OpenLayers.Feature.Vector.style["default"]  // safer default style
    ));

    vectors1 = new OpenLayers.Layer.Vector("VectorLayer", { styleMap: styleMap });
    map.addLayer(vectors1);

    var parser = new OpenLayers.Format.WKT();

    var features = parser.read(dist_vector);
    features.attributes = {
        name: dist_lab,
        favColor: 'black',
        align: 'lb'
    };

    var bounds;
    if (features) {
        if (!(features instanceof Array)) {
            features = [features];
        }
        for (var i = 0; i < features.length; ++i) {
            if (!bounds) {
                bounds = features[i].geometry.getBounds();
            } else {
                bounds.extend(features[i].geometry.getBounds());
            }
        }

        vectors1.addFeatures(features);

        if (flag && bounds) {
            map.zoomToExtent(bounds);
        }
    }
}

var test,geom_temp;

function removelayer(layername,flag,id)
	{
	
		for (var b = map.layers, c = 1, length=b.length; c < length; c++) 
		{
		
			if(b[c].name == layername)
			{
				map.removeLayer(b[c]);
				
				break;
			}
		} 
		
		
	}
	function ajaxcall(url,div_name,mode,params)
	{
	
	var req = getXMLHTTP();
		
		if (req) {
			
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					// only if "OK"
					if (req.status == 200) 
					{
					document.getElementById('reject'+sid.toString()).disabled=true;
					document.getElementById('accept'+sid.toString()).disabled=true;
					document.getElementById('update'+sid.toString()).disabled=true;
					document.getElementById('reason'+sid).style.display="none";						
					document.getElementById(div_name).innerHTML=req.responseText;	
					alert(""+req.responseText);
					
					try{
					$("#photodiv").dialog("close");}catch(e) {}
									
					wmslayer.redraw(true);
					
					}
						
				}				
			}			
			req.open("POST", url, true);
			req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			req.send(params);
		} 
				
			
	}


function changeState(suffix = "") {
  var stateId = "statecode" + suffix;
  var distDivId = "distdiv" + suffix;
  var talukDivId = "talukdiv" + suffix;

 console.log("distDivId",distDivId);
  var e = document.getElementById(stateId);
  if (!e) return; // safety check

  var s = e.options[e.selectedIndex].text;

  if(s !== "all" && s !== "Select State") {
    var url1 = 'usrtasks/heatwave/get/getDistricts_fp.php?st=' + s+ '&suffix=' + suffix;
    $.ajax({
      type: "GET",
      url: url1,
      async: true,
      success: function(text) {
        document.getElementById(distDivId).innerHTML = text;
      }
    });
  } else {
    document.getElementById(distDivId).innerHTML = "<td><b>District </b> </td><td><select  class='s10'  id='districtcode" + suffix + "' onChange='var temp=(this.value).split(\"_\");changeDistrict(\"" + suffix + "\");distzoom(temp[1],temp[0],true);'> <option value='all' selected>All</option></select></td>";
    document.getElementById(talukDivId).innerHTML = "<td><b>Taluk </b> </td><td><select  class='s10'  id='talukcode" + suffix + "'	onChange='var temp=(this.value).split(\"_\");distzoom(temp[1],temp[0],true);'> <option value='all' selected>All</option></select></td>";
  }
}

function changeDistrict(suffix = "") {
  var stateId = "statecode" + suffix;
  var distId = "districtcode" + suffix;
  var talukDivId = "talukdiv" + suffix;
  var eState = document.getElementById(stateId);
  var eDist = document.getElementById(distId);
  if (!eState || !eDist) return;
  var s = eState.options[eState.selectedIndex].text;
  var d = eDist.options[eDist.selectedIndex].text;
  if(d !== "all") {
    var url1 = 'usrtasks/heatwave/get/getTaluk.php?st=' + s + '&dt=' + d +'&suffix=' + suffix;;
    $.ajax({
      type: "GET",
      url: url1,
      async: true,
      success: function(text) {
        document.getElementById(talukDivId).innerHTML = text;
      }
    });
  }
}
//fetch village
function changeTaluk(suffix = "") {
  var stateId = "statecode" + suffix;
  var distId = "districtcode" + suffix;
  var talukId = "talukcode" + suffix;
  var eState = document.getElementById(stateId);
  var eDist = document.getElementById(distId);
  var eTaluk = document.getElementById(talukId);
  var villDivId="villdiv" + suffix;
  if (!eState || !eDist||!eTaluk) return;
  var s = eState.options[eState.selectedIndex].text;
  var d = eDist.options[eDist.selectedIndex].text;
  var t = eTaluk.options[eTaluk.selectedIndex].text;
  if(t !== "all") {
    var url1 = 'usrtasks/heatwave/get/getVillage.php?st=' + s + '&dt=' + d+'&tk='+t;
    $.ajax({
      type: "GET",
      url: url1,
      async: true,
      success: function(text) {
        document.getElementById(villDivId).innerHTML = text;
      }
    });
  }
}

		
function distzoomtodist(val)
{

	if(val!='')
	{
	distzoom(val.split("_")[1],'',true);
	}

}


 var popup;
 var datesel;
var layer=null;
var info=null;
var vectorLayer =null;
let currentPopup = null;  // Variable to hold the current popup
var bufferLayer = null;

// Usage examples:
// For daily data: loadMapData('2023-06-15') or loadMapData('2023-06-15', 'daily')
// For hourly data: loadMapData('2023-06-15', 'hourly', '12')
// For forecast data: loadMapData('2023-06-15', 'forecast')  or loadMapData('2023-06-15', 'forecast', '12')
function loadMapData(date, type = 'daily', hour = null) {
    // Base URL setup
    let url = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe?date=" + date;
    if ((type === 'hourly' || type === 'forecast') && hour) {
        url += "&hour=" + hour;
    }
    console.log("Loading map data from:", type, url);

    // Store selected date and hour
    datesel = date;
    if (type === 'hourly') {
        datesel += " " + hour; // Store hour for hourly data
    }

    // Reset map zoom to specific extent
   const anyTSEnabled = ['daily','hourly','ecv','forecast'].some(s => {
        const cb = document.getElementById(`ts-toggle-${s}`);
        return cb && cb.checked;
    });
    if (!anyTSEnabled) {
        map && map.zoomToExtent(new OpenLayers.Bounds(60, 5, 100, 40));
    }

    // Cleanup existing layers and controls
    cleanupMap();

    // Determine layer name based on type
	let layerName;
	if (type === 'forecast' && hour) {
		layerName = "lightforecasthourly";
	} else {
		switch(type) {
			case 'hourly':
				layerName = "lighthourly";
				break;
			case 'forecast':
				layerName = "lightforecast";
				break;
			default: // daily
				layerName = "light";
		}
	}

    // Add new layer to the map
    let extraLayer = (type === 'forecast') ? "forecastgrid" : "grid";
	layer = new OpenLayers.Layer.WMS("SMI", url, {
		layers: layerName + ",state," + extraLayer,
		transparent: true
	}, {
		isBaseLayer: false
	});

    map.addLayer(layer);
    map.setLayerIndex(redifflayer, 20);
    map.setLayerIndex(admin_grouped, 21);
    map.setLayerIndex(transportnetwork, 100);

    addInteractiveControls(url, layer, type, hour);
    
}

function cleanupMap() {
    // Clear previous layers and controls if any
    if (layer) {
        if (info) {
            info.deactivate();
        }

        if (map.getLayersByName(layer.name).length > 0) {
            map.removeLayer(layer);
        }

        map.removeControl(info);

        try {
            if (popup) {
                map.removePopup(popup);
                popup.hide();
            }
        } catch (e) {
            console.error("Error removing popup:", e);
        }
    }

    // Remove vector layer if it exists
    if (vectorLayer && map.getLayersByName(vectorLayer.name).length > 0) {
        map.removeLayer(vectorLayer);
    }

    // Remove buffer layer and reset display
    if (bufferLayer) {
        if (map.getLayersByName(bufferLayer.name).length > 0) {
            map.removeLayer(bufferLayer);
            bufferLayer = null;
        }
        document.getElementById('countDisplay').innerHTML = "Number of points inside the buffer: 0";
    }

    // Remove current popup if it exists
    if (currentPopup) {
        map.removePopup(currentPopup);
        currentPopup = null;
    }
}

function addInteractiveControls(url, layer, type, hour) {
    // Create a new WMS GetFeatureInfo control
    info = new OpenLayers.Control.WMSGetFeatureInfo({
        url: url,
        layers: [layer],
        title: 'Identify features by clicking',
        queryVisible: true,
        eventListeners: {
            getfeatureinfo: function(event) {
                console.log("Feature info:", event.text);

                let endpoint;
				if (type === 'hourly') {
					endpoint = 'usrtasks/heatwave/get/hourlygridvalue.php';
				} else if (type === 'forecast') {
					endpoint = 'usrtasks/heatwave/get/hourlygrid_forecast_info.php'; // new endpoint
				} else {
					endpoint = 'usrtasks/heatwave/get/time.php';
				}
                
                let params = "gid=" + event.text + "&date=" + datesel.split(" ")[0] + "&user=" + bhuvanusername;
                if (type === 'hourly'|| type==='forecast') {
                    params += "&hour=" + hour;
                }

                $.ajax({
                    type: "GET",
                    url: endpoint + "?" + params,
                    async: true,
                    success: function(text) {
                        console.log("Popup content:", text);
                        
                       if (popup) popup.destroy();

                        if (event.text != "") {
                            const styledText = `
                              <div style="
                                font-family:'Rajdhani',sans-serif;
                                background: linear-gradient(135deg,#e0f2fe 0%,#ede9fe 60%,#fce7f3 100%);
                                border: 1.5px solid rgba(56,189,248,0.45);
                                border-radius: 14px;
                                padding: 10px 16px;
                                box-shadow: 0 4px 18px rgba(56,189,248,0.18), inset 0 1px 0 rgba(255,255,255,0.85);
                                font-size:0.85rem;
                                font-weight:600;
                                color:#1e3a8a;
                                min-width:160px;
                                text-shadow: 0 1px 0 rgba(255,255,255,0.7);
                              ">${text.trim()}</div>`;

                            popup = new OpenLayers.Popup.FramedCloud(
                                "featurePopup",
                                map.getLonLatFromPixel(event.xy),
                                null,
                                styledText,
                                null,
                                true,
                                function(event) {
                                    delete popups[this.id];
                                    this.hide();
                                    OpenLayers.Event.stop(event);
                                }
                            );

                            map.addPopup(popup, true);
                            popup.contentDiv.style.background = 'transparent';
                            popup.contentDiv.style.border     = 'none';
                            popup.updateSize();
                            popup.show();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error("Error fetching data for popup:", error);
                    }
                });
            }
        }
    });

    map.addControl(info);
    info.activate();
}


	function down_new(a,b)
	{
		alert(1);
		if(bhuvanusername=='empty' || bhuvanusername=='')
			alert('Please login for downloading the data');
		else{
		 
		 url1='usrtasks/heatwave/get/ins.php?gid='+a+"&date="+b+"&user="+bhuvanusername;
							  $.ajax({ type: "GET",   
							 url: url1,   
							 async: true,
							 success : function(text)
							 {
								 console.log(event.text)   ;
								if(popup)
								popup.destroy();	
								if(event.text != "")
							{
								popup = new OpenLayers.Popup.FramedCloud("chicken", map.getLonLatFromPixel(event.xy), null, text, null, true, function (event) {
										delete popups[this.id];
										this.hide();
										OpenLayers.Event.stop(event);
									});
									
									map.addPopup(popup, true);
									
									popup.setContentHTML(text);
									popup.show();
								
							}
							 //document.getElementById("talukdiv").innerHTML=text;
							
							 }
					});
		}
		// alert(bhuvanusername);
		
	}
	
// Added new functions for hourly data
// Function to display GeoJSON data on the map
function displayGeoJSONOnMap(geojsonData) {
    if (layer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(layer.name).length > 0) {
            map.removeLayer(layer);
        }

        if (info) {
            info.deactivate();
            map.removeControl(info);
        }
    }

		if(popup)
		{
			map.removePopup(popup);
		}
    // Remove the previous popup, if any
    if (currentPopup) {
        // Check if the popup is already removed
        if (map.popups && map.popups.includes(currentPopup)) {
            map.removePopup(currentPopup);
        }
        currentPopup = null;  // Reset the popup variable
    }

	if (vectorLayer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(vectorLayer.name).length > 0) {
            map.removeLayer(vectorLayer);
        }
    }
	
	if (bufferLayer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(bufferLayer.name).length > 0) {
            map.removeLayer(bufferLayer);
			 bufferLayer = null;
        }
	   document.getElementById('countDisplay').innerHTML = "Number of points inside the buffer: 0";

    }
	
   vectorLayer = new OpenLayers.Layer.Vector('Vector Layer');

	// Create a GeoJSON format to read the data
	var geojsonFormat = new OpenLayers.Format.GeoJSON();

	// Add the features from the GeoJSON data to the vector layer
	var features = geojsonFormat.read(geojsonData);
	
	// Apply styling dynamically based on the current value
    features.forEach(function(feature) {
        var currentValue = feature.attributes.current;
        var color = getColorForCurrent(currentValue);

        // Define the style for the feature
        feature.style = {
            fillColor: color,
            strokeColor: 'black',
            strokeWidth: 2,
            fillOpacity: 0.6,
            pointRadius: 6  // Adjust the size of the point (for markers)
        };
    });
	
	vectorLayer.addFeatures(features);

	// Apply the styleMap to the vector layer
    map.addLayer(vectorLayer);

    // Zoom to the extent of the features
    map.zoomToExtent(vectorLayer.getDataExtent());

    // Create a select control to handle feature selection
    const selectControl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        onSelect: onFeatureSelect,
        onUnselect: onFeatureUnselect
    });

    // Add the select control to the map
    map.addControl(selectControl);
    selectControl.activate();

    // Function to handle feature selection
    function onFeatureSelect(feature) {
        const properties = feature.attributes;

        // Round latitude and longitude to four decimal places
        const latitude = parseFloat(properties.latitude).toFixed(4);
        const longitude = parseFloat(properties.longitude).toFixed(4);

        // Construct the popup content from the feature's properties
      const popupContent = `
          <div style="
            font-family: 'Rajdhani', sans-serif;
            background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 60%, #fce7f3 100%);
            border: 1.5px solid rgba(56,189,248,0.45);
            border-radius: 14px;
            padding: 10px 16px;
            box-shadow: 0 4px 18px rgba(56,189,248,0.18), inset 0 1px 0 rgba(255,255,255,0.85);
            min-width: 180px;
          ">
            <div style="
              font-size:1rem; font-weight:800; color:#1e40af;
              letter-spacing:0.06em; margin-bottom:8px;
              text-shadow: 0 1px 0 rgba(255,255,255,0.7);
              border-bottom: 1px solid rgba(56,189,248,0.25);
              padding-bottom: 5px;
            ">⚡ Lightning Strike</div>
            <table style="border-collapse:collapse; width:100%;">
              <tr>
                <td style="font-size:0.75rem;font-weight:700;color:#4338ca;letter-spacing:0.05em;padding:2px 8px 2px 0;text-transform:uppercase;">Latitude</td>
                <td style="font-size:0.85rem;font-weight:600;color:#1e3a8a;">${latitude}°</td>
              </tr>
              <tr>
                <td style="font-size:0.75rem;font-weight:700;color:#4338ca;letter-spacing:0.05em;padding:2px 8px 2px 0;text-transform:uppercase;">Longitude</td>
                <td style="font-size:0.85rem;font-weight:600;color:#1e3a8a;">${longitude}°</td>
              </tr>
              <tr>
                <td style="font-size:0.75rem;font-weight:700;color:#4338ca;letter-spacing:0.05em;padding:2px 8px 2px 0;text-transform:uppercase;">Current</td>
                <td style="font-size:0.85rem;font-weight:600;color:#1e3a8a;">${properties.current} A</td>
              </tr>
              <tr>
                <td style="font-size:0.75rem;font-weight:700;color:#4338ca;letter-spacing:0.05em;padding:2px 8px 2px 0;text-transform:uppercase;">Time</td>
                <td style="font-size:0.85rem;font-weight:600;color:#1e3a8a;">${properties.time}</td>
              </tr>
            </table>
          </div>`;

        currentPopup = new OpenLayers.Popup.FramedCloud(
            "featurePopup",
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(220, 160),
            popupContent,
            null,
            true
        );
        currentPopup.contentDiv.style.background = 'transparent';
        currentPopup.contentDiv.style.border     = 'none';
        map.addPopup(currentPopup);
    }

    // Function to handle unselecting a feature (if desired)
    function onFeatureUnselect(feature) {
        if (currentPopup) {
            map.removePopup(currentPopup);
            currentPopup = null;
        }
    }
}


// Function to display a message on the map when no data is found
function displayMessageOnMap(message) {
	
	if(message=="No data found for the specified timestamp.")
	{
	  document.getElementById('countDisplay').innerHTML = "Number of points inside the buffer: 0";
	}
if (layer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(layer.name).length > 0) {
            map.removeLayer(layer);
        }

        if (info) {
            info.deactivate();
            map.removeControl(info);
        }
    }
	
	if (vectorLayer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(vectorLayer.name).length > 0) {
            map.removeLayer(vectorLayer);
			vectorLayer=null;
        }
    }
	
	if (bufferLayer) {
        // Check if the layer is already in the map before removing it
        if (map.getLayersByName(bufferLayer.name).length > 0) {
            map.removeLayer(bufferLayer);
			 bufferLayer = null;
        }
		document.getElementById('countDisplay').innerHTML = "Number of points inside the buffer: 0";
    }
	
	if (currentPopup) {
		// Check if the popup is already removed
		if (map.popups && map.popups.includes(currentPopup)) {
			map.removePopup(currentPopup);
		}
		currentPopup = null;  // Reset the popup variable
	}
  
  // You can create a popup with the error message
 const styledMessage = `
    <div style="
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
      color: #1e40af;
      letter-spacing: 0.05em;
      padding: 6px 14px;
      background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 60%, #fce7f3 100%);
      border: 1.5px solid rgba(56,189,248,0.45);
      border-radius: 50px;
      box-shadow: 0 4px 16px rgba(56,189,248,0.18), inset 0 1px 0 rgba(255,255,255,0.85);
      text-shadow: 0 1px 0 rgba(255,255,255,0.7);
      white-space: nowrap;
    ">⚡ ${message}</div>`;

  const popup = new OpenLayers.Popup("no-data-popup",
  map.getCenter(), new OpenLayers.Size(340, 52), styledMessage, null, true);
  popup.setBackgroundColor("transparent");
  popup.div.style.background    = 'transparent';
  popup.div.style.border        = 'none';
  popup.div.style.boxShadow     = 'none';
  popup.div.style.padding       = '0';
  popup.contentDiv.style.background = 'transparent';
  popup.contentDiv.style.border      = 'none';
  popup.contentDiv.style.padding     = '0';

  map.addPopup(popup);
  currentPopup = popup;
}


// Function to get the color for the current value
function getColorForCurrent(current) {
    if (current <= 20000) {
        return 'green';  // C1 [Weak]
    } else if (current <= 50000) {
        return 'yellowgreen';  // C2 [Below Normal]
    } else if (current <= 100000) {
        return 'yellow';  // C3 [Normal]
    } else if (current <= 200000) {
        return 'orange';  // C4 [Above Normal]
    } else if (current <= 350000) {
        return 'red';  // C5 [Dangerous]
    } else {
        return 'darkred';  // C6 [Very Dangerous]
    }
}


// Function to toggle showing LDS locations
function toggleLDSLocations() {
    let showLocations = document.getElementById('displayLDSLocations').checked;
    
    if (showLocations) {
        showLDSLocationsOnMap();  // Show LDS locations
    } else {
        hideLDSLocationsOnMap();  // Hide LDS locations
    }
}

let markersLayer;
let markers = [];

function showLDSLocationsOnMap() {
    markersLayer = new OpenLayers.Layer.Vector("Markers");
    map.addLayer(markersLayer);
    
    fetch('usrtasks/heatwave/get/get_lds_loc.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(loc => {
                if (loc.visible === "t") {
                    let lonLat = new OpenLayers.LonLat(loc.longitude, loc.latitude)
                        .transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());

                    let icon = new OpenLayers.Icon('usrtasks/heatwave/img/ldsloc.png', new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10, -10));

                    // Create marker with icon
                    let marker = new OpenLayers.Feature.Vector(
                        new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat),
                        { description: loc.realname },  // Store realname as feature description
                        { externalGraphic: icon.url, graphicWidth: 20, graphicHeight: 30 }
                    );
                    
                    // Add marker to the markers layer
                    markersLayer.addFeatures([marker]);
                    markers.push(marker);

                    // Create the label as a separate vector feature
                    let labelText = loc.realname;
                    let labelFeature = new OpenLayers.Feature.Vector(
                        new OpenLayers.Geometry.Point(lonLat.lon + 0.001, lonLat.lat + 0.001), // Position slightly offset from marker
                        { description: labelText },
                        {
                            label: labelText,
                            fontSize: "15px",
                            fontFamily: "Arial",
                            fontWeight: "bold",
                            fillColor: "black",
                            strokeColor: "white",
                            strokeWidth: 2,
                            backgroundColor: "white",
                            labelAlign: "cm"  // Align the label to the center
                        }
                    );

                    // Add label to the markersLayer
                    markersLayer.addFeatures([labelFeature]);
                }
            });
        });
}


// Function to hide LDS locations on the map
function hideLDSLocationsOnMap() {
    markersLayer.removeAllFeatures(); // Removes all markers from the map
    markers = []; // Clear the markers array
}



function sendsearch() {
    searchdialog = $("#search").dialog({
        autoOpen: !1,
        resizable: !1,
        width: "auto",
        height: 240,
        overflow: "auto",
        close: function() {},
        zIndex: 3e3
    }), searchdialog.dialog("open")
}

var globalstr='__', AjaxRequest = null;
var locationPoint=null;
var placemarkLayer=null;
var flag=false;
function showResult2(str)
{
	if (placemarkLayer) {
		// Check if the layer is already in the map before removing it
		if (map.getLayersByName(placemarkLayer.name).length > 0) {
			placemarkLayer.removeAllFeatures();
			map.removeLayer(placemarkLayer);
			placemarkLayer = null;
		}
	}

	if (bufferLayer) {
		// Check if the layer is already in the map before removing it
		if (map.getLayersByName(bufferLayer.name).length > 0) {
			map.removeLayer(bufferLayer);
			 bufferLayer = null;
		}
		document.getElementById('countDisplay').innerHTML = "Number of points inside the buffer: 0";
	}
	const regex = /^([-+]?\d{1,2}(\.\d+)?),\s?([-+]?\d{1,3}(\.\d+)?)$/;

	const match = str.match(regex);
	if (match) {
		const lat = parseFloat(match[1]);
		const lng = parseFloat(match[3]);
	    locationPoint = new OpenLayers.Geometry.Point(lng, lat);
		flag=true;
		Go();
		
	}
	else flag=false;
	
	var regexLetter = /[a-zA-Z]/;
	if (str.length<4||str.length>30)
    {
       
		document.getElementById('live').style.display='none';
		 return;
    }
	if(!regexLetter.test(str))
	   return;
	if(str.length>globalstr.length && str.search(globalstr)==0)
	{
		document.getElementById("live").style.border="1px solid #A5ACB2";
		document.getElementById("live").style.background="white";
		document.getElementById("live").style.display="block";	
		document.getElementById("live").innerHTML="Results not found <img style='cursor:pointer' class='seclose'src='html/images/DeleteIcon.gif' align='right' onclick='closesearch()' >";
		document.getElementById("live").style.height='60px'
	      return;  
	}	   
	if( AjaxRequest != null)
	{
                 AjaxRequest.abort();
				 AjaxRequest=null;
	}
    if (window.XMLHttpRequest)
    {
	
      AjaxRequest=new XMLHttpRequest();
    }
    else
    {
      AjaxRequest=new ActiveXObject("Microsoft.XMLHTTP");
    }
	AjaxRequest.onreadystatechange=function()
    {
          if (AjaxRequest.readyState==4 && AjaxRequest.status==200)
          {  
	            var m=AjaxRequest.responseText;
				//console.log(m);
				document.getElementById("livesearch").innerHTML=m;
				document.getElementById("live").innerHTML=m;
				if(m=="")
				{		
					document.getElementById("live").style.border="1px solid #A5ACB2";
					document.getElementById("live").style.background="white";
					document.getElementById("live").style.display="block";	
					document.getElementById("live").innerHTML="Results not found <img style='cursor:pointer' class='seclose'src='html/images/DeleteIcon.gif' align='right' >";
					document.getElementById("live").style.height='60px';			
					globalstr=str;
					return;
				}
				if(fsearch==0&&m!=""){
					document.getElementById("live").style.border="1px solid #A5ACB2";
					document.getElementById("live").style.background="white";
					document.getElementById("live").style.display="block";	
					document.getElementById("live").style.height='180px';	
				}
				if(sflag){
						sflag=0;
						
						document.getElementById('live').style.display='none';
						if(m=="")
						{				
							document.getElementById("live").style.border="1px solid #A5ACB2";
							document.getElementById("live").style.background="white";
							document.getElementById("live").style.display="block";	
							document.getElementById("live").innerHTML="Results not found <img style='cursor:pointer' class='seclose'src='html/images/DeleteIcon.gif' align='right' >";
							document.getElementById("live").style.height='60px'
							globalstr=str;
							return false;
						}
						try{
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
									//locationPoint = new OpenLayers.Geometry.Point(k, m);
									return ;
								}
							}
						}catch(e)
						{
							
						}
						document.getElementById("live").style.display = "none";
						if(document.getElementsByClassName("seclose"))
					$('.seclose').remove()
		  				sendsearch(); 
		
				}
				globalstr='__';
		  }
	}	 

	AjaxRequest.open("GET","https://bhuvan-app3.nrsc.gov.in/nsearch/india.php?q="+str,true);
	// AjaxRequest.open("GET","https://bhuvan-staging1.nrsc.gov.in/nsearch/india.php?q="+str,true);
	AjaxRequest.send();
}


// Define the bufferLayer globally

function applyBuffer() {
	
	if (placemarkLayer) {
		// Check if the layer is already in the map before removing it
		if (map.getLayersByName(placemarkLayer.name).length > 0) {
			placemarkLayer.removeAllFeatures();
			map.removeLayer(placemarkLayer);
			placemarkLayer = null;
		}
	}
	
	// Create the OpenLayers.Geometry.Point using the latitude and longitude
	if(flag==false&& window.sharedvariable)
	{
		console.log("Coordinates", window.sharedvariable);
		var coords = window.sharedvariable.split(',');
		// Parse the latitude and longitude from the array
		var lat = parseFloat(coords[0]); // Latitude
		var lon = parseFloat(coords[1]); // Longitude
		locationPoint = new OpenLayers.Geometry.Point(lon, lat);
	}else
	{
		
		var style = new OpenLayers.Style({
			externalGraphic: "img/marker.png", // Replace with your image URL
			graphicHeight: 17,
			graphicWidth: 16
		});

		// Create a vector layer to hold the placemark
		placemarkLayer = new OpenLayers.Layer.Vector("Placemark Layer", {
			styleMap: new OpenLayers.StyleMap({ "default": style })
		});
		map.addLayer(placemarkLayer);

		// Create a feature from the point geometry
		var feature = new OpenLayers.Feature.Vector(locationPoint);

		// Add the feature to the vector layer
		placemarkLayer.addFeatures([feature]);
	}
	console.log("Location Point",locationPoint );
	if(locationPoint==null)
	{
		alert("Please select location first.");
		return;
	}
    var bufferRadius = parseFloat(document.getElementById('buffer').value);  // Buffer in meters
   
	if (bufferRadius && bufferRadius > 0 && bufferRadius<=2000) {
		// Convert buffer radius to degrees (rough approximation)
		var bufferInDegrees = bufferRadius / 111.320;  // 1 degree ≈ 111.32 km

		// Create a buffer circle at the provided location
		var locationCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(
			locationPoint,      // The point to buffer (provided location)
			bufferInDegrees,       // The radius of the circle (in map units, for example, pixels or meters)
			30,                 // Number of sides (for a smooth circle)
			0                   // Rotation (optional)
		);

		// Clear previous buffers from the bufferLayer
		if(bufferLayer)
		{
			bufferLayer.removeAllFeatures();
		}
		bufferLayer = new OpenLayers.Layer.Vector("Buffer Layer");

		// Create a feature for the location buffer circle
		var locationCircleFeature = new OpenLayers.Feature.Vector(locationCircle);

		// Add the buffer feature to the bufferLayer
		bufferLayer.addFeatures([locationCircleFeature]);

		// Add the bufferLayer to the map if it's not already added
		map.addLayer(bufferLayer);
		
		// Zoom to the extent of the buffer layer
        var extent = locationCircle.getBounds();
        map.zoomToExtent(extent);
		
		 // Now check how many features in the vectorLayer are inside the buffer
		countFeaturesInBuffer(locationCircle);
		
	} else {
		alert("Please enter a valid buffer(1 to 2000)in kilometers.");
   
	}
}

function countFeaturesInBuffer(bufferPolygon) {
    var count = 0;

    // Loop through each feature in the vector layer and check if it intersects with the buffer
    vectorLayer.features.forEach(function(feature) {
        if (feature.geometry.intersects(bufferPolygon)) {
            count++;
        }
    });

   // Update the count in the 'countDisplay' div
    var countDisplay = document.getElementById('countDisplay');
    countDisplay.innerHTML = "Number of points inside the buffer: " + count
}