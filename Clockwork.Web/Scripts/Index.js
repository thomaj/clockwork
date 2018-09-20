
/**
 * Using a Vue Object to control the page
 */
var app = new Vue({
    el: '#app',
    data: {
        timezone: '',
        dateTimeObj: undefined,
        requests: []
    },
    mounted: function () {
        // When the page is loaded, send a request to get all of the requests in the database
        this.getAllRequests();
    },
    methods: {
        // Takes a Date Object or date string and returns the time in the format "HH:MM ampm"
        time: function (dateObj) {
            let retVal = '';
            if (dateObj !== undefined) {
                dateObj = new Date(dateObj);
                let hour = dateObj.getHours() % 12;
                if (hour == 0) hour = 12;
                retVal = `${hour}:${dateObj.getMinutes().toString().padStart(2, '0')} ${dateObj.getHours() < 12 ? 'AM' : 'PM'}`;
            }
            return retVal;
        },
        // Takes a Date Object or date string and returns the date in the format "day month date year"
        date: function (dateObj) {
            let retVal = '';
            if (dateObj !== undefined) {
                dateObj = new Date(dateObj);
                retVal = dateObj.toDateString();
            }
            return retVal;
        },
        // Updates the clock to display the time of the current Date object in the data member 'dateTimeObj'
        updateClock: function() {
            let hourHand = this.$refs.hourHand;
            let minuteHand = this.$refs.minuteHand;

            let hourDegrees = (this.dateTimeObj.getHours() % 12) * 30;
            let minuteDegrees = this.dateTimeObj.getMinutes() * 6;

            hourHand.style.transform = `translateY(-100%) rotate(${hourDegrees}deg)`;
            minuteHand.style.transform = `translateY(-100%) rotate(${minuteDegrees}deg)`;

        },
        // Sends a request to the API to get the current time.  Can also pass in an optional parameter which is
        // the time zone display string.  It will add this string to the api call appropriately.
        // Returns a Promise Object
        getTime: function (timezone) {
            let query = "http://127.0.0.1:5000/api/currenttime";
            if (timezone) {
                query += "?timezone=" + encodeURIComponent(timezone);
            }
            let self = this;
            return new Promise((resolve, reject) => {
                this.get(query, function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let response = JSON.parse(this.responseText);
                            self.dateTimeObj = response ? new Date(response.time) : undefined;
                            self.updateClock()
                            self.$forceUpdate();
                        }
                        resolve();
                    } 
                })
            })
        },
        // Sends a request to the API to get all of the requests that are in the database.
        // Returns a Promise Object
        getAllRequests: function () {
            let self = this;
            return new Promise((resolve, reject) => {
                this.get("http://127.0.0.1:5000/api/currenttime/requests", function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let response = JSON.parse(this.responseText);
                            response.reverse()
                            self.requests = response;
                            self.$forceUpdate();
                        }
                        resolve();
                    }
                });
            })
        },
        // Sends a request to the API to get the time as well as a request to get all of the requests
        getTimeAndRequests: function () {
            // Not the Vue way, but need to do it this way because an option comes in pre selected
            let timezone = this.$refs.timezones.options[this.$refs.timezones.selectedIndex].value;
            this.getTime(timezone).then(() => {
                this.getAllRequests();
            }).catch((err) => {
                console.log(err);
            })
        },
        // Sends a http request using the given query string.  The callback (cb) will be called
        // each time the ready state changes on the xhttp object.
        // query (String) the path to send a get request to.
        // cb (Function) a callback that the xhttp.onreadystatechange gets set to.
        get: function (query, cb) {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = cb;
            xhttp.open("GET", query, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        }
    }
})