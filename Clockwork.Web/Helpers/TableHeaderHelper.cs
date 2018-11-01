using System.Web.Mvc;
using System.Web.Routing;

namespace Clockwork.Web.Helpers
{
    public static class TableHeaderHelper
    {
        public static MvcHtmlString ColumnHeader(string displayText, string property, string type)
        {
            string pattern = "<span v-on:click=\"toggleFilter('{1}', '{2}')\">" +
                                "<transition name=\"fade\" mode=\"out-in\">" +
                                "<input v-if=\"isSelectedProperty('{1}')\" v-on:click.stop v-on:keyup.enter=\"addFilter('{1}', '{0}', '{2}')\" id=\"{1}\" v-model=\"filterText\" type=\"text\"/>" +
                                "<span v-else>{0}</span>" +
                                "</transition>" +
                             "</span>";
            string html = string.Format(pattern, displayText, property, type);
            return new MvcHtmlString(html);
        }
    }
}
