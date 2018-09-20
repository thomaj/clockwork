using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Clockwork.API.Models;

namespace Clockwork.API.Controllers
{
    [Route("api/[controller]")]
    public class CurrentTimeController : Controller
    {
        // Route: api/currenttime/requests
        [HttpGet]
        [Route("requests")]
        public IActionResult GetRequests()
        {
            CurrentTimeQuery[] returnVal = new CurrentTimeQuery[0];

            // Get all of the entries in the database
            using (var db = new ClockworkContext())
            {
                returnVal = (from c in db.CurrentTimeQueries select c).ToArray();
            }

            // Send the entries back to the client
            return Ok(returnVal);
        }


        // Route: api/currenttime
        //        can also provide 'timezone' parameter (ie. api/currenttime?timezone="US/central"
        [HttpGet]
        public IActionResult GetWithTimezone(string timezone)
        {
            // Get the correct time to add to the database and send back to client
            var utcTime = DateTime.UtcNow;
            var timeZoneTime = DateTime.Now;
            if (timezone != null)
            {
                TimeZoneInfo tzInfo;
                try
                {
                    tzInfo = TimeZoneInfo.FindSystemTimeZoneById(timezone);
                }
                catch (TimeZoneNotFoundException)
                {
                    // COuld not find the specified timezone in the system.  Return bad request
                    return BadRequest("Cannot find timezone " + timezone);
                }
                timeZoneTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, tzInfo);
            }
            // Get the ip address
            var ip = this.HttpContext.Connection.RemoteIpAddress.ToString();

            // Create the object to store in the Database and to send to client
            var returnVal = new CurrentTimeQuery
            {
                UTCTime = utcTime,
                ClientIp = ip,
                Time = timeZoneTime,
                TimeZoneRequested = timezone
            };

            // Store the object in the database
            using (var db = new ClockworkContext())
            {
                db.CurrentTimeQueries.Add(returnVal);
                var count = db.SaveChanges();
                Console.WriteLine("{0} records saved to database", count);

                Console.WriteLine();
                foreach (var CurrentTimeQuery in db.CurrentTimeQueries)
                {
                    Console.WriteLine(" - {0}", CurrentTimeQuery.UTCTime);
                }
            }

            // Send back the object to the client
            return Ok(returnVal);
        }
    }
}
