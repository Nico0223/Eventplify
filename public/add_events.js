$(document).ready(function() {
  // Declare marker variable globally
  var marker;

  // Function to initialize Google Map
  function initMap() {
      var initialLocation = { lat: 0, lng: 0 }; // Default location
      var mapOptions = {
          center: initialLocation,
          zoom: 15 // Adjust zoom level as needed
      };
      var map = new google.maps.Map(document.getElementById('map'), mapOptions);

      // Autocomplete for event location input
      var input = document.getElementById('eventlocation');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      // Set initial marker (optional)
      marker = new google.maps.Marker({
          map: map,
          position: initialLocation,
          draggable: true // Allow marker to be draggable
      });

      // Update marker position on map when location changes
      autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          if (!place.geometry) {
              return;
          }

          if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
          } else {
              map.setCenter(place.geometry.location);
              map.setZoom(15); // Adjust zoom level
          }

          marker.setPosition(place.geometry.location);
      });

      // Allow marker to be draggable and update location
      google.maps.event.addListener(marker, 'dragend', function() {
          geocodePosition(marker.getPosition());
      });
  }

  // Geocode function to convert LatLng to formatted address
  function geocodePosition(pos) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
          latLng: pos
      }, function(responses) {
          if (responses && responses.length > 0) {
              $('#eventlocation').val(responses[0].formatted_address);
          } else {
              console.error('Geocoder failed due to: ' + status);
          }
      });
  }

  // Load the map after the page has finished loading
  google.maps.event.addDomListener(window, 'load', initMap);

  // Function to handle form submission
  $('#add_event_form').on('submit', function(event) {
      event.preventDefault(); // Prevent default form submission

      // Fetch input values from the form
      const eventName = $('#eventname').val();
      const eventDescription = $('#eventdescription').val();
      const eventDate = $('#eventdate').val();
      const startTime = $('#starttime').val();
      const endTime = $('#endtime').val();
      const eventLocation = $('#eventlocation').val(); // Only get the location name

      // Check if marker is defined (added for safety)
      if (!marker || !marker.getPosition) {
          console.error('Marker is not defined or getPosition method is not available.');
          return;
      }

      // Prepare data to send in the POST request
      const eventData = {
          name: eventName,
          description: eventDescription,
          date: eventDate,
          startTime: startTime,
          endTime: endTime,
          location: eventLocation // Pass only the location name
      };

      // Send a POST request to the server
      $.ajax({
          url: '/api/events/add', // Endpoint where your backend route is defined
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(eventData),
          success: function(response) {
              alert('Event added successfully!');
              // Optionally, redirect to another page after successful addition
              window.location.href = '/events.html'; // Redirect to events page
          },
          error: function(xhr, status, error) {
              console.error('Error adding event:', error);
              alert('An error occurred while adding the event. Please try again.');
          }
      });
  });
});
