// map.js
import L from 'leaflet';

export function initMap() {
  // Map setup and configuration code here
  const map = L.map('map').setView([51.505, -0.09], 13);
  // Rest of the map setup...
    // Add a tile layer for the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; OpenStreetMap contributors',
      }).addTo(map);
}