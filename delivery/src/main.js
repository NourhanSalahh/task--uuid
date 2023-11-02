import { createApp } from 'vue';
import App from './App.vue';
import VueGoogleMaps from '@fawmi/vue-google-maps';

const app = createApp(App);

// Use VueGoogleMaps with your API key and any additional configuration
app.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAFp165fHH3fpXVJpV5eKV059_Ok95PLJg', // Replace with your Google Maps API key
    libraries: 'places', // Add any additional Google Maps libraries you need
  },
});

app.mount('#app');