// Initiate all the settings:
mapboxgl.accessToken =
  "pk.eyJ1IjoieWllZTAyOTgiLCJhIjoiY201d2Y4eW9uMGQycTJrcXpjNjY2bm92MSJ9.KM7XU1SW7BQPbp1X9_H8GA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-77.0369, 38.9072],
  zoom: 11
});

const data_url =
  "https://api.mapbox.com/datasets/v1/yiee0298/cm73fapox0jyo1so2ujus5875/features?access_token=pk.eyJ1IjoieWllZTAyOTgiLCJhIjoiY201d2Y4eW9uMGQycTJrcXpjNjY2bm92MSJ9.KM7XU1SW7BQPbp1X9_H8GA";

// Global variables serving for filters.
let filterType = null;
let timeFilter = null;
let animationIndex = 0; // For timeseries animation
const animationDelay = 50; // unit: ms
let animationTimer;
let crimeData; //

map.on("load", () => {
  // Fetch GeoJSON data and store it in crimeData
  fetch(data_url)
    .then((response) => response.json())
    .then((data) => {
      crimeData = data; // Store fetched data in global variable

      // 3. Order data first.
      crimeData.features.sort((a, b) => {
        const dateA = new Date(a.properties["START_DATE"]); // Feature: "START_DATE"
        const dateB = new Date(b.properties["START_DATE"]);
        return dateA - dateB;
      });
      console.log(crimeData.features);

      // 1. Add crime layer (initial layer, before animation)
      map.addLayer({
        id: "crimes",
        type: "circle",
        source: {
          type: "geojson",
          data: crimeData
        },
        paint: {
          "circle-radius": {
            base: 2,
            stops: [
              [11, 5],
              [22, 200]
            ]
          },
          "circle-color": [
            "case",
            ["==", ["get", "OFFENSE"], "ASSAULT W/DANGEROUS WEAPON"],
            "#9b59b6",
            ["==", ["get", "OFFENSE"], "BURGLARY"],
            "#3498db",
            ["==", ["get", "OFFENSE"], "HOMICIDE"],
            "#2ecc71",
            ["==", ["get", "OFFENSE"], "MOTOR VEHICLE THEFT"],
            "#ff7f00",
            ["==", ["get", "OFFENSE"], "ROBBERY"],
            "#f1c40f",
            ["==", ["get", "OFFENSE"], "SEX ABUSE"],
            "#e74c3c",
            ["==", ["get", "OFFENSE"], "THEFT F/AUTO"],
            "#f39c12",
            ["==", ["get", "OFFENSE"], "THEFT/OTHER"],
            "#34495e",
            "#bdc3c7"
          ],
          "circle-opacity": 0.9,
          "circle-stroke-color": "#34495e",
          "circle-stroke-width": 2
        }
      });

      // 2. Add an empty GeoJSON source for animation data
      map.addSource("crimes-animated", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      // 3. Add layer to display animation data points
      map.addLayer({
        id: "crimes-animated-layer",
        type: "circle",
        source: "crimes-animated",
        paint: {
          //  Here you can copy your 'crimes' layer's circle-paint style, or customize new styles
          "circle-radius": {
            base: 2,
            stops: [
              [11, 5],
              [22, 200]
            ]
          },
          "circle-color": [
            "case",
            ["==", ["get", "OFFENSE"], "ASSAULT W/DANGEROUS WEAPON"],
            "#9b59b6",
            ["==", ["get", "OFFENSE"], "BURGLARY"],
            "#3498db",
            ["==", ["get", "OFFENSE"], "HOMICIDE"],
            "#2ecc71",
            ["==", ["get", "OFFENSE"], "MOTOR VEHICLE THEFT"],
            "#ff7f00",
            ["==", ["get", "OFFENSE"], "ROBBERY"],
            "#f1c40f",
            ["==", ["get", "OFFENSE"], "SEX ABUSE"],
            "#e74c3c",
            ["==", ["get", "OFFENSE"], "THEFT F/AUTO"],
            "#f39c12",
            ["==", ["get", "OFFENSE"], "THEFT/OTHER"],
            "#34495e",
            "#bdc3c7"
          ],
          "circle-opacity": 0.9,
          "circle-stroke-color": "#34495e",
          "circle-stroke-width": 2
        }
      });
    }); // close the fetched data bracket
});

// Sidebar part
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");
  const animationBtn = document.getElementById("animation-btn");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
  });

  // get animation button
  // const animationBtn = document.getElementById("animation-btn");
  let isAnimationPlaying = false;

  animationBtn.addEventListener("click", () => {
    if (isAnimationPlaying) {
      isAnimationPlaying = false;
      clearTimeout(animationTimer);
      animationBtn.innerHTML =
        '<i class="fas fa-play"></i> <span class="text">Resume</span>';
    } else {
      isAnimationPlaying = true;
      animationIndex = 0;

      // clear crimes-animated dataset
      map.getSource("crimes-animated").setData({
        type: "FeatureCollection",
        features: []
      });
      //  hide crimes
      map.setLayoutProperty("crimes", "visibility", "none");

      animateCrimeData(); //  resume
      animationBtn.innerHTML =
        '<i class="fas fa-pause"></i> <span class="text">Pause</span>';
    }
  });

  // Hide/Display crime
  const toggleCrimesLayerBtn = document.getElementById(
    "toggle-crimes-layer-btn"
  );
  let isCrimesLayerVisible = true;

  toggleCrimesLayerBtn.addEventListener("click", () => {
    isCrimesLayerVisible = !isCrimesLayerVisible;

    // Change the state: dislay or not
    map.setLayoutProperty(
      "crimes",
      "visibility",
      isCrimesLayerVisible ? "visible" : "none"
    );

    if (isCrimesLayerVisible) {
      toggleCrimesLayerBtn.innerHTML =
        '<i class="fas fa-eye"></i> <span class="text">Hide crimes layer</span>';
    } else {
      toggleCrimesLayerBtn.innerHTML =
        '<i class="fas fa-eye-slash"></i> <span class="text">Show crimes layer</span>';
    }
  });
});

// Heatmap part
const heatmapBtn = document.getElementById("heatmap-btn");

heatmapBtn.addEventListener("click", () => {
  if (map.getLayer("heatmap")) {
    map.removeLayer("heatmap");
    map.removeSource("heatmap");
  } else {
    map.addLayer({
      id: "heatmap",
      type: "heatmap",
      source: {
        type: "geojson",
        data: data_url
      },
      paint: {
        "heatmap-radius": {
          stops: [
            [11, 5],
            [15, 40]
          ]
        },
        // "heatmap-opacity": 0.8,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)"
        ],
        "heatmap-intensity": 3
      }
    });
  }
});

// Get all buttons with the data-target attribute.
const toggleButtons = document.querySelectorAll("button[data-target]");

// Event for Menu button.
toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const targetConsole = document.getElementById(targetId);

    // display it or not
    if (targetConsole) {
      targetConsole.style.display =
        targetConsole.style.display === "none" ? "block" : "none";
    }
  });
});

document
  .getElementById("method-console")
  .addEventListener("change", (event) => {
    //Create a filter
    let filterType = ["!=", ["get", "METHOD"], "placeholder"];

    const type = event.target.value;
    console.log(type);

    if (type == "all") {
      filterType = ["!=", ["get", "METHOD"], "placeholder"]; //       null means no filter, in other words, all the data.
      filterType = null;
    } else if (type == "GUN") {
      filterType = ["==", ["get", "METHOD"], "GUN"];
    } else if (type == "KNIFE") {
      filterType = ["==", ["get", "METHOD"], "KNIFE"];
    } else {
      console.log("error");
    }
    console.log("filterType:", filterType); // Combine 2 filters.

    let combinedFilter = null;
    if (timeFilter && filterType) {
      combinedFilter = ["all", timeFilter, filterType];
    } else if (timeFilter) {
      combinedFilter = timeFilter;
    } else if (filterType) {
      combinedFilter = filterType;
    } else {
      combinedFilter = null;
    }
    console.log("combinedFilter:", combinedFilter);
    map.setFilter("crimes", combinedFilter);
  });

// Get all checkboxes.
const dayCheckbox = document.getElementById("day-checkbox");
const eveningCheckbox = document.getElementById("evening-checkbox");
const midnightCheckbox = document.getElementById("midnight-checkbox");

// Get Select-All Button
const selectAllBtn = document.getElementById("select-all-btn");

dayCheckbox.addEventListener("change", updateFilter);
eveningCheckbox.addEventListener("change", updateFilter);
midnightCheckbox.addEventListener("change", updateFilter);

// Event on select-all button
selectAllBtn.addEventListener("click", () => {
  const isAllChecked =
    dayCheckbox.checked && eveningCheckbox.checked && midnightCheckbox.checked;

  // Switching according to the timeshift.
  if (isAllChecked) {
    dayCheckbox.checked = false;
    eveningCheckbox.checked = false;
    midnightCheckbox.checked = false;
  } else {
    dayCheckbox.checked = true;
    eveningCheckbox.checked = true;
    midnightCheckbox.checked = true;
  }

  updateFilter(); // Call updateFilter to update time filter and combined filter
});

// Update Filter (for time shift checkboxes)
function updateFilter() {
  const selectedTimes = [];

  if (dayCheckbox.checked) selectedTimes.push("DAY");
  if (eveningCheckbox.checked) selectedTimes.push("EVENING");
  if (midnightCheckbox.checked) selectedTimes.push("MIDNIGHT");

  console.log("selectedTimes:", selectedTimes);
  timeFilter = null;
  if (selectedTimes.length > 0) {
    timeFilter = ["in", ["get", "SHIFT"], ["literal", selectedTimes]];
  }
  console.log("timeFilter:", timeFilter);

  updateCombinedFilter(); // Call updateCombinedFilter to combine filters and set map filter
}

// Function to update combined filter and set map filter
function updateCombinedFilter() {
  let combinedFilter = null;
  if (timeFilter && filterType) {
    combinedFilter = ["all", timeFilter, filterType];
  } else if (timeFilter) {
    combinedFilter = timeFilter;
  } else if (filterType) {
    combinedFilter = filterType;
  } else {
    combinedFilter = null; // null means no filter, showing all data
  }

  console.log("combinedFilter:", combinedFilter);
  map.setFilter("crimes", combinedFilter);
}

// Time selector
document.getElementById("date-input").addEventListener("change", function (e) {
  const selectedDate = e.target.value; // Turn to 'YYYY-MM-DD'.

  fetch(data_url)
    .then((response) => response.json())
    .then((data) => {
      const filteredFeatures = data.features.filter((feature) => {
        const startDateTime = feature.properties.START_DATE;
        const startDate = startDateTime.split(" ")[0];

        // Convert ‘YYYY/MM/DD’ format to ‘YYYY-MM-DD’.
        const formattedDate = startDate.replace(/\//g, "-");

        return formattedDate === selectedDate;
      });

      // Update map data
      map.getSource("crimes").setData({
        type: "FeatureCollection",
        features: filteredFeatures
      });
    });
});

// Reset button
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", () => {
  if (map.getLayer("crimes")) {
    map.removeLayer("crimes");
    map.removeSource("crimes");
  }

  // Re-adding layers
  map.addLayer({
    id: "crimes",
    type: "circle",
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": {
        base: 2,
        stops: [
          [11, 5],
          [22, 180]
        ]
      },
      "circle-color": [
        "case",
        ["==", ["get", "OFFENSE"], "ASSAULT W/DANGEROUS WEAPON"],
        "#9b59b6",
        ["==", ["get", "OFFENSE"], "BURGLARY"],
        "#3498db",
        ["==", ["get", "OFFENSE"], "HOMICIDE"],
        "#2ecc71",
        ["==", ["get", "OFFENSE"], "MOTOR VEHICLE THEFT"],
        "#ff7f00",
        ["==", ["get", "OFFENSE"], "ROBBERY"],
        "#f1c40f",
        ["==", ["get", "OFFENSE"], "SEX ABUSE"],
        "#e74c3c",
        ["==", ["get", "OFFENSE"], "THEFT F/AUTO"],
        "#f39c12",
        ["==", ["get", "OFFENSE"], "THEFT/OTHER"],
        "#34495e",
        "#bdc3c7"
      ],
      "circle-opacity": 0.9,
      "circle-stroke-color": "#34495e",
      "circle-stroke-width": 2
    }
  });
});

// Hover div part
map.on("mousemove", (event) => {
  const crimePoint = map.queryRenderedFeatures(event.point, {
    layers: ["crimes"]
  });

  document.getElementById("pointsInfo").innerHTML = crimePoint.length
    ? `<p>Block: ${crimePoint[0].properties.BLOCK}<p>
         <p>Offense: <strong>${crimePoint[0].properties.OFFENSE}</strong></p>`
    : `<p>Hover over a crime point!</p>`;
  pointsInfo.querySelector("p").style.fontSize = "14px";
});

// create legend
const legendItems = [
  { label: "ASSAULT W/DANGEROUS WEAPON", color: "#9b59b6" },
  { label: "BURGLARY", color: "#3498db" },
  { label: "HOMICIDE", color: "#2ecc71" },
  { label: "MOTOR VEHICLE THEFT", color: "#ff7f00" },
  { label: "ROBBERY", color: "#f1c40f" },
  { label: "SEX ABUSE", color: "#e74c3c" },
  { label: "THEFT F/AUTO", color: "#f39c12" },
  { label: "THEFT/OTHER", color: "#34495e" }
];

const legendContainer = document.getElementById("legend");
legendItems.forEach((item) => {
  const legendKey = document.createElement("div");
  legendKey.className = "legend-key";
  legendKey.innerHTML = `
    <div class="legend-color-box" style="background-color: ${item.color};"></div>
    <span>${item.label}</span>
  `;
  legendContainer.appendChild(legendKey);
});

// navigator/geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places",
  proximity: {
    longitude: 38.9072,
    latitude: -77.0369
  }
});

map.addControl(geocoder, "top-right");

map.addControl(new mapboxgl.NavigationControl(), "top-right");

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-right"
);

// Scale bar part
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: "imperial"
});

map.addControl(scale, "top-right");

function animateCrimeData() {
  // hide layer "crimes" first.
  map.setLayoutProperty("crimes", "visibility", "none");

  if (animationIndex < crimeData.features.length) {
    const currentFeature = crimeData.features[animationIndex];

    // Update data source to show the current feature in animation
    map.getSource("crimes-animated").setData({
      type: "FeatureCollection",
      features: [currentFeature]
    });

    animationIndex++;

    // Set up the next frame of the animation
    animationTimer = setTimeout(animateCrimeData, animationDelay);
  } else {
    // Animation complete
    console.log("Animation finished!");
  }
}