
/**
 * Using a Vue Object to control the page
 */
var app = new Vue({
    el: '#app',
    data: {
        timezone: '',
        dateTimeObj: undefined,
        requests: [],
        errors: {
            requests: '',
            time: ''
        },
        filterText: '',
        filterProperty: '',
        filters: []
    },
    mounted: function () {
        // When the page is loaded, send a request to get all of the requests in the database
        this.getAllRequests();
    },
    computed: {
        filteredRequests: function () {
            let filteredByPreiousFilters = this.filters.reduce((list, filter) => {
                let filterFunc = filter.func;
                return list.filter(filterFunc.bind(filter));
            }, this.requests)

            return filteredByPreiousFilters.filter((value) => {
                let pattern = new RegExp(this.filterText, 'gi');
                return pattern.test(value[this.filterProperty]);
            })
        }
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

            let hourDegrees = (this.dateTimeObj.getHours() % 12) * 30 + ((this.dateTimeObj.getMinutes() / 60) * 30);
            let minuteDegrees = this.dateTimeObj.getMinutes() * 6;

            hourHand.style.transform = `translateY(-100%) rotate(${hourDegrees}deg)`;
            minuteHand.style.transform = `translateY(-100%) rotate(${minuteDegrees}deg)`;

        },
        // Sends a request to the API to get the current time.  Can also pass in an optional parameter which is
        // the time zone display string.  It will add this string to the api call appropriately.
        // Returns a Promise Object
        getTime: function (timezone) {
            let self = this;
            let query = "http://127.0.0.1:5000/api/currenttime";
            if (timezone) {
                query += "?timezone=" + encodeURIComponent(timezone);
            }
            
            return this.get(query).then(response => {
                self.errors = '';
                self.dateTimeObj = response ? new Date(response.time) : undefined;
                self.updateClock();
            }).catch(err => {
                self.errors.time = 'There was an error getting the time';
            })
        },
        // Sends a request to the API to get all of the requests that are in the database.
        // Returns a Promise Object
        getAllRequests: function () {
            let self = this;
            return this.get("http://127.0.0.1:5000/api/currenttime/requests").then(response => {
                self.errors.requests = '';
                response.reverse();
                self.requests = response;
            }).catch(err => {
                self.errors.requests = 'There was an error getting the requests';
            });
        },
        // Sends a request to the API to get the time as well as a request to get all of the requests
        getTimeAndRequests: function () {
            // Not the Vue way, but need to do it this way because an option comes in pre selected
            let timezoneSelect = document.getElementById('timezone');
            let timezone = timezoneSelect.options[timezoneSelect.selectedIndex].value;
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
            return new Promise((resolve, reject) => {
                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let response = JSON.parse(this.responseText);
                            resolve(response);
                        } else {
                            reject(this.status);
                        }
                    }
                }
                xhttp.open("GET", query, true);
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send();
            })
        },




        toggleFilter: function (property) {
            this.filterText = ''
            if (this.filterProperty == property) {
                this.filterProperty = '';
            } else {
                this.filterProperty = property;
            }
        },
        isSelectedProperty: function (property) {
            return this.filterProperty == property;
        },
        addFilter: function (property, propertyDisplay) {
            let filterObj = {
                text: this.filterText,
                property: property,
                propertyDisplay: propertyDisplay,
                func: function (item) {
                    let pattern = new RegExp(this.text, 'gi');
                    return pattern.test(item[this.property]);
                }
            }
            this.filters.push(filterObj);
            this.filterText = '';
        },
        removeFilter: function (filter) {
            let index = this.filters.indexOf(filter);
            if (index < 0) {
                console.log('Could not find index of filter to remove it');
            } else {
                this.filters.splice(index, 1);
            }
        }
    }
})