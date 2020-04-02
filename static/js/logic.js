const API_KEY = "pk.eyJ1IjoiY2VzdXIiLCJhIjoiY2s3MHd5YXZ0MDExZDNtbXl6cG1zN3N3bCJ9.uHYIq2vgl_C8NNTH0h_qTQ";

var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

//we create the map object with options
var map =L.map("mapid",{
    center:[
        40.7,-94.5
        ],
    zoom :3,
    layers: [graymap,satellitemap,outdoors]

});
// then we add our "graymap" tile layer to map.
graymap.addTo(map);



var tectonicplates=new L.LayerGroup();
var earthquakes=new L.LayerGroup();


// defining an object that contains all of our different map choices.
// one of these maps will be visible at a time
var  baseMaps={
    Satellite:satellitemap,
    Grayscale:graymap,
    Outdoor:outdoors
};

// We define an object that contains all of our overlays. 
// Any combination of these overlays may be visible at the same time
var overlays={
    "Tectonic Plates": tectonicplates,
    Earthquakes:earthquakes
};

// Then we add a control to the map that will allow the user to change
//  which layers are visible
L
    .control
    .layers(baseMaps, overlays)
    .addTo(map);

// Here we make an AJAX call that retrieves our earthquake geoJSON data.
d3.json("data/LastMonth.geojson",function(data){
    console.log(data);


        function getColor(magnitude) {
            switch (true){
                case magnitude>5:
                    return"blue";
                case magnitude>4:
                    return"red";
                case magnitude>3:
                    return"orange";
                case magnitude>2:
                    return"yellow";
                case magnitude>1:
                    return"green";
                default:
                    return"white";
            }
        }



        function getRadius(magnitude){
            if (magnitude===0) {
                return 1;                
            }
            return magnitude * 4;            
        }

// Here we add a GeoJSON layer to the map once the file is loaded.       
        L.geoJson (data,{

            pointToLayer: function(feature, latlng){
                return L.circleMarker(latlng);
            },            
            style: function (feature){
                return{
                    opacity:1,
                    fillOpacity:1,
                    fillColor: getColor(feature.properties.mag),
                    color:"#000000",
                    radius: getRadius(feature.properties.mag),
                    stroke:true,
                    weight:0.5
                }
            },

            onEachFeature: function (feature, layer){
                layer.bindPopup(`Magnitude: ${feature.properties.mag}<br> Location: ${feature.properties.place}`);
            }
        }).addTo(earthquakes);

   // Then we add the earthquake layer to our map.
   earthquakes.addTo(map);


    var legend=L.control({
        position:"bottomright"
    });

    // Then add all the details for the legend
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
        "white",
        "green",
        "yellow",
        "orange",
        "red",
        "blue"
        ];

        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
            }
            return div;
        };
    
        // Finally, we our legend to the map.
        legend.addTo(map);
    
        // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
        function(platedata) {
            // Adding our geoJSON data, along with style information, to the tectonicplates
            // layer.
            L.geoJson(platedata, {
            color: "orange",
            weight: 2
            })
            .addTo(tectonicplates);
    
            // Then add the tectonicplates layer to the map.
            tectonicplates.addTo(map);
        });
    
    });
