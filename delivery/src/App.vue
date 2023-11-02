<template>
 <div>

    <img alt="Vue logo" src="./assets/logo.png" style="align-items: center;" />
    <HelloWorld msg="Welcome to Your Delivery App" style="text-align: center;" />

    <div class="map-container">
      <GMapMap
        :center="center"
        :zoom="zoomLevel"
        map-type-id="terrain"
        style="width: 100%; height: 20rem;"
        :options="{
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true
        }"
      >
        <GMapMarker
          v-if="center.lat !== 0 && center.lng !== 0"
          :position="center"
          :draggable="true"
          :clickable="true"
          @dragend="onMarkerDragEnd"
        />
      </GMapMap>
    </div>

    <div class="search-container">
      <!-- Desired Location Input -->
      <input
        ref="locationInput"
        class="form-control"
        type="text"
        placeholder="Search for a location"
        @input="onDesiredLocationChange"
      />
    </div>

    <div class="button-container">
      <button @click="returnToExactLocation" class="btn btn-primary">
        Return to Exact Location
      </button>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import { ref, onMounted, onBeforeMount } from 'vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },

  setup() {
    // Initialize center using localStorage or default values
    const center = ref({
      lat: 0, // Default to 0 for latitude
      lng: 0, // Default to 0 for longitude
    });

    const zoomLevel = ref(10);

    let google = null; // Initialize google here

    const loadGoogleMapsAPI = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          google = window.google;
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAFp165fHH3fpXVJpV5eKV059_Ok95PLJg&libraries=places`;
          script.defer = true;
          script.async = true;

          script.onload = () => {
            google = window.google;
            resolve();
          };

          script.onerror = reject;

          document.head.appendChild(script);
        }
      });
    };

    const locationInput = ref(null);

    onBeforeMount(() => {
      loadGoogleMapsAPI();
    });

    const fetchUserLocation = () => {
      if ('geolocation' in navigator) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const newCenter = { lat, lng };
              zoomLevel.value = 20;
              resolve(newCenter);
            },
            (error) => {
              reject(error);
            }
          );
        });
      } else {
        console.error("Geolocation is not supported in this browser.");
        return null;
      }
    };

    const onMarkerDragEnd = (event) => {
      const newLocation = event.latLng;
      center.value = newLocation;
      saveLocationToLocalStorage(newLocation);
    };

    const saveLocationToLocalStorage = (location) => {
      const locationJSON = JSON.stringify(location);
      localStorage.setItem('pinLocation', locationJSON);
    };

    const returnToExactLocation = () => {
      fetchUserLocation()
        .then((newCenter) => {
          center.value = newCenter;
          saveLocationToLocalStorage(center.value);
        })
        .catch((error) => {
          console.error("Error getting user location: " + error.message);
        });
    };

    onMounted(() => {
      fetchUserLocation();
    });

    const onDesiredLocationChange = () => {
      // Ensure that the google object is available before using it
      if (google && locationInput.value) {
        const input = locationInput.value;
        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: input.value,
          },
          (predictions) => {
            if (predictions && predictions.length > 0) {
              // Use the first prediction or handle multiple predictions as needed
              const placeId = predictions[0].place_id;
              fetchPlaceDetails(placeId);
            }
          }
        );
      }
    };

    const fetchPlaceDetails = (placeId) => {
      if (google) {
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        placesService.getDetails(
          {
            placeId,
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry && place.geometry.location) {
              center.value = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
            }
          }
        );
      }
    };

    return {
      center,
      zoomLevel,
      returnToExactLocation,
      onMarkerDragEnd,
      onDesiredLocationChange,
      locationInput,
    };
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 20rem;
}

.search-container {
  margin: 10px;
}

.button-container {
  text-align: center;
  margin: 10px;
}
</style>


<style scoped>
.map-container {
  width: 100%;
  height: 20rem;
}

.search-container {
  margin: 10px;
}

.button-container {
  text-align: center;
  margin: 10px;
}
.dark-mode {
    background-color: #333; /* Change this color to your preferred dark background color */
    color: #fff; /* Change text color to contrast with the dark background */
  }

</style>
