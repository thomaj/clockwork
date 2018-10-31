using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;

namespace Clockwork.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var timezones = TimeZoneInfo.GetSystemTimeZones().ToList();

            var timeZoneDisplays = timezones.Select(tz =>
            {
                String name = tz.DisplayName;
                int startIndex = Math.Max(name.IndexOf('/') + 1, 0);
                name = name.Substring(startIndex).Replace('_', ' ');
                String offset = String.Format("({0:+0;-#}:{1:D2})", tz.BaseUtcOffset.Hours, tz.BaseUtcOffset.Minutes);
                String text = offset + " " + name;

                return new SelectListItem()
                {
                    Text = text,
                    Value = tz.Id
                };
            });

            var list = new SelectList(timeZoneDisplays, "Value", "Text", TimeZoneInfo.Local);
            ViewData["TimeZones"] = list;

            return View();
        }
    }
}
