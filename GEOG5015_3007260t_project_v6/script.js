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

map.on("load", () => {
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
});

// Sidebar part
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
  });
});

// Heatmap part
// Get heatmap button
const heatmapBtn = document.getElementById("heatmap-btn");

// Event on heatmap
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
      filterType = ["!=", ["get", "METHOD"], "placeholder"];
      //       null means no filter, in other words, all the data.
      filterType = null;
    } else if (type == "GUN") {
      filterType = ["==", ["get", "METHOD"], "GUN"];
    } else if (type == "KNIFE") {
      filterType = ["==", ["get", "METHOD"], "KNIFE"];
    } else {
      console.log("error");
    }
    console.log("filterType:", filterType);

    // Combine 2 filters.
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

  //  Switching according to the timeshift.
  if (isAllChecked) {
    dayCheckbox.checked = false;
    eveningCheckbox.checked = false;
    midnightCheckbox.checked = false;
  } else {
    dayCheckbox.checked = true;
    eveningCheckbox.checked = true;
    midnightCheckbox.checked = true;
  }

  updateFilter();
});

// Update Filter
function updateFilter() {
  const selectedTimes = [];

  if (dayCheckbox.checked) selectedTimes.push("DAY");
  if (eveningCheckbox.checked) selectedTimes.push("EVENING");
  if (midnightCheckbox.checked) selectedTimes.push("MIDNIGHT");

  console.log("selectedTimes:", selectedTimes);
  let timeFilter = null;
  if (selectedTimes.length > 0) {
    timeFilter = ["in", ["get", "SHIFT"], ["literal", selectedTimes]];
  }
  console.log("timeFilter:", timeFilter);

  // Then combine them together.
  let combinedFilter = null;
  if (timeFilter && filterType) {
    combinedFilter = ["all", timeFilter, filterType];
  } else if (timeFilter) {
    combinedFilter = timeFilter;
  } else if (filterType) {
    combinedFilter = filterType;
  } else {
    combinedFilter = null; //REMINDER: null has the same effects with all here.
  }

  console.log("combinedFilter:", combinedFilter);
  map.setFilter("crimes", combinedFilter);
}

//   Time selector
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