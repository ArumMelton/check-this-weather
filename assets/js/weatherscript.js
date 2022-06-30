// declare global variables //
var apiKey = ("6a5351e3bb34047eab840624b2434dea");
var currentCity = "";
var prevCity = "";



// catch/handle errors from fetch//

var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// function for API call to get current weather from OpenWeatherMaps //
var getCurrentConditions = (event) => {
    // grabs city name from search bar and assigns it to currentCity//
    let city = $('#input-city').val();
    currentCity = $('#input-city').val();

    // construct queryURL for fetch from API (changing units to imperial) //
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "$APIID=" + apiKey;
    fetch(queryURL)
    .then(handleErrors)
        .then((response) => {
        return response.json()
        
    })
    

    .then((response) => {
        // commits to local storage //
        saveCity(city);
        $('#search-error').text("");
        // Create icon for current weather //
        let currentWeatherIcon = ("https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
        
        // moment code (aligns timezone)
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

        // builds list of cities //
        renderCities();
        console.log(response.json);
        // gets 5 day forecast //

        getFiveDayForecast(event);
        // SETS HEADER TEXT //

        $('#header-text').text(response.name);
        
        // html for results of city search //

        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        // Append the results to the DOM
        $('#current-weather').html(currentWeatherHTML);
        // Get the latitude and longitude for the UV search from Open Weather Maps API
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + apiKey;
        
        fetch(uvQueryURL)
        .then(handleErrors)
        .then((response) => {
            return response.json();
        })
        
        .then((response) => {
            let uvIndex = response.current.uvi.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}

