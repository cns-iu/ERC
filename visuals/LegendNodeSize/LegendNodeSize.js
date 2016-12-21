visualizationFunctions.LegendNodeSize = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    // context.SVG = context.config.easySVG(element[0])
    context.VisFunc = function() {
        d3.xml("visuals/LegendNodeSize/LegendNodeSize/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
            if (error) throw error;
            element.appendChild(xml.documentElement);
        });
    }
    return context;
}
