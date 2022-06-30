// Set global variables, including Open Weather Maps API Key
var apiKey = ("6a5351e3bb34047eab840624b2434dea");
var currentCity = "";
var prevCity = "";

//error handling//

var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// function to fetch current conditions of searched city and display to page //
var getCurrentConditions = (event) => {
    // Obtain city name from the search box
    let city = $('#input-city').val();
    currentCity= $('#input-city').val();
    // Set the queryURL to fetch from API using weather search, uses imperial for query parameter //
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })

    .then((response) => {

        // Save city to local storage
        saveCity(city);
        $('#search-error').text("");
        // Create icon for the current weather using Open Weather Maps //
        let currentWeatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        // establish variables for latitude and longitude //
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        // Offset UTC timezone - using moment.js //
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);


        // renders cities //
        renderCities();

        // call function for 5 day forecast //
        getFiveDayForecast(event);

        // Sets the header for city upon search //

        $('#header-text').text(response.name);

        // HTML for the results main display //
        let currentWeatherHTML = `

                <div class="card-body p-8">
                  <div class="d-flex">
                    <h3 class="flex-grow-1">${response.name}</h3>
                    <h4>${currentMoment.format("(MM/DD/YYYY)")}</h4>
                  </div>
                  <div class="d-flex flex-column text-center mt-5 mb-4">
                  <h5 id="mtemp" class="display-4 mb-0 style="font-weight-bolder"> ${response.main.temp}\u00B0F</h5>
                    <h6 id="mtemp">Feels Like: ${response.main.feels_like}\u00B0F</h6>
                    <span style="font-size: xx-small" id="max-min">
                    High: 
                    <br>
                    Low:
                    </span>
                  </div>
                  <div class="d-flex align-items-center">
                    <div class="flex-grow-1" style="font-size: .8rem;">
                    
                      <div><i class="fas fa-wind fa-fw" style="color: #868B94;"></i> <span class="ms-1">Wind Speed: ${response.wind.speed} mph
                        </span></div>
                      <div><i class="fas fa-tint fa-fw" style="color: #868B94;"></i> <span class="ms-1">Humidity: ${response.main.humidity}%</span>
                      </div>
                      <div><i class="fas fa-sun fa-fw" style="color: #868B94;"></i> <span class="ms-1" id="uvIndex">UV Index</span>
                      </div>
                      <div><i class="fas fa-thermometer-empty fa-fw" style="color: #868B94;"></i> <span class="ms-1">Barometric Pressure: ${response.main.pressure}Pa</span>
                      </div>
                      <div><i class="fab fa-cloudversify" style="color: #868B94;"></i> <span class="ms-1">Cloud Cover: ${response.clouds.all}%</span>
                      </div>
                    </div>
                    <div>
                    <img src="${currentWeatherIcon}"
                        width="60px">
                        <span style="text-transform: uppercase;"> ${response.weather[0].description} </span>
                    </div>
                  </div>
        </div>`;

        // Append the results to the DOM //
        $('#current-weather').html(currentWeatherHTML);

        //query to get UV data //
        
        let uvQueryURL = ("https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=" + "imperial" + "&appid=" + apiKey);

        fetch(uvQueryURL)
        .then(handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.current.uvi;
            let mainTemp = response.current.temp;

            // changes main temp color based on temperature data //

            $('#mainTemp').html('<div id="mtemp" style="font-weight-bolder"> ${response.main.temp} \u00B0F</div>');
            if (mainTemp>=50 && mainTemp<79){
                $('#mtemp').attr("class", "temp-moderate");
            } else if (mainTemp<49){
                $('#mtemp').attr("class", "temp-cold");
            } else if (mainTemp>=80){
                $('#mtemp').attr("class", "temp-hot");
            }

            // displays the high and low for current day //

            $('#max-min').html(`<span id="max-min">
            High: ${response.daily[0].temp.max}\u00B0F
            <br>
            Low: ${response.daily[0].temp.min}\u00B0F
            </span>`);

            // changes uv display color based on UV data //

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

// Function to obtain the five day forecast and display to HTML
var getFiveDayForecast = (event) => {
    let city = $('#input-city').val();

    // URL for API search using forecast search //
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    // Fetch from API
    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        // HTML template for weather cards //
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;

        // Loop over the 5 day forecast and build the template HTML using UTC offset and Open Weather Map icon //
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            console.log(dayData)

            // Only displaying mid-day forecasts //

            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li style="font-size: 18px">${thisMoment.format("MM/DD/YYYY")}</li>
                        <li class="weather-icon"><img src="${iconURL}" width="35px"></li>
                        <li style="text-transform: uppercase; font-size: x-small;">${dayData.weather[0].description}</li>
                        <br>
                        <li style="font-size: smaller;">Temp: ${dayData.main.temp}&#8457;</li>
                        <li style="font-size: smaller;">Wind: ${dayData.wind.speed} mph</li>
                        <li style="font-size: smaller;">Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }

        // Build the HTML template //
        fiveDayForecastHTML += `</div>`;

        // Append the five-day forecast to the DOM //
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

// Function to save the city to localStorage
var saveCity = (newCity) => {
    let cityExists = false;
    // Check if City exists in local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // Save to localStorage if city is new
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// Render the list of searched cities

var renderCities = () => {
    $('#city-results').empty();
    // If localStorage is empty
    if (localStorage.length===0){
        if (prevCity){
            $('#input-city').attr("value", prevCity);
        } else {
            $('#input-city').attr("value", "Raleigh");
        }

    } else {

        // Build key of last city written to localStorage
        let prevCityKey="cities"+(localStorage.length-1);
        prevCity=localStorage.getItem(prevCityKey);
        // Set search input to last city searched
        $('#input-city').attr("value", prevCity);
        // Append stored cities to page
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            // Set to prevCity if currentCity not set
            if (currentCity===""){
                currentCity=prevCity;
            }
            // Set button class to active for currentCity
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            }

            // Append city to page //
            $('#city-results').prepend(cityEl);
        }

        // Add a "clear" button to page if there is a cities list //
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
};

// New city search button event listener
$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#input-city').val();
getCurrentConditions(event);
});

// Old searched cities buttons event listener
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#input-city').val(event.target.textContent);
    currentCity=$('#input-city').val();
    getCurrentConditions(event);
});

// Clear old searched cities from localStorage event listener
$("#clear-storage").on("click", (event) => {
    localStorage.clear();
    renderCities();
});

// Render the searched cities //
renderCities();

// Get the current conditions (which also calls the five day forecast)//
getCurrentConditions();