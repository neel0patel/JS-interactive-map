const myMap = {
  coordinates: [],
  businesses: [],
  map: {},
  markers: {},

  buildMap() {
    this.map = L.map("map", {
      center: this.coordinates,
      zoom: 11,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: "15",
    }).addTo(this.map);
    //geo-marker
    const marker = L.marker(this.coordinates);
    marker
      .addTo(this.map)
      .bindPopup("<p1><b>You are here!</b><br><p1>")
      .openPopup();
  },
  addMarkers() {
    for (var i = 0; i < this.businesses.length; i++) {
      this.markers = L.marker([this.businesses[i].lat, this.businesses[i].long])
        .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
        .addTo(this.map);
    }
  },
};

async function getCoords() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  return [pos.coords.latitude, pos.coords.longitude];
}
async function getFoursquare(business) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq3QKgcj3o05b2B0o0gt292yfF3f82JY/oQwg2PcN5k8gc=",
    },
  };
  let limit = 5;
  let lat = myMap.coordinates[0];
  let lon = myMap.coordinates[1];
  let response = await fetch(
    `https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`,
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let businesses = parsedData.results;
  return businesses;
}

function processBusinesses(data) {
  let businesses = data.map((element) => {
    let location = {
      name: element.name,
      lat: element.geocodes.main.latitude,
      long: element.geocodes.main.longitude,
    };
    return location;
  });
  return businesses;
}

//window load
window.onload = async () => {
  const coords = await getCoords();
  myMap.coordinates = coords;
  myMap.buildMap();
};
// business submit btn
document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();
  let business = document.getElementById("business").value;
  let data = await getFoursquare(business);
  myMap.businesses = processBusinesses(data);
  myMap.addMarkers();
});
