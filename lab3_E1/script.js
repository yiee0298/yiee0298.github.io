// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoieWllZTAyOTgiLCJhIjoiY201d2Y4eW9uMGQycTJrcXpjNjY2bm92MSJ9.KM7XU1SW7BQPbp1X9_H8GA";

//Before map
const beforeMap = new mapboxgl.Map({
  container: "before",
  style: "mapbox://styles/yiee0298/cm6gj0xkx00dx01qx4gw07023",
  center: [-0.089932, 51.514441],
  zoom: 14
});
//After map
const afterMap = new mapboxgl.Map({
  container: "after",
  style: "mapbox://styles/yiee0298/cm6gjcclb00aa01qrfecsbmkr",
  center: [-0.089932, 51.514441],
  zoom: 14
});

const container = "#comparison-container";
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {});