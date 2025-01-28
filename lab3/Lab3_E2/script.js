// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoieWllZTAyOTgiLCJhIjoiY201d2Y4eW9uMGQycTJrcXpjNjY2bm92MSJ9.KM7XU1SW7BQPbp1X9_H8GA";

const style_2022 = "mapbox://styles/yiee0298/cm6gj0xkx00dx01qx4gw07023";
const style_2024 = "mapbox://styles/yiee0298/cm6gjcclb00aa01qrfecsbmkr";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: style_2022,
  center: [-0.089932, 51.514441],
  zoom: 14
});

const layerList = document.getElementById("menu");
const inputs = layerList.getElementsByTagName("input");
//On click the radio button, toggle the style of the map.
for (const input of inputs) {
  input.onclick = (layer) => {
    if (layer.target.id == "style_2022") {
      map.setStyle(style_2022);
    }
    if (layer.target.id == "style_2024") {
      map.setStyle(style_2024);
    }
  };
}