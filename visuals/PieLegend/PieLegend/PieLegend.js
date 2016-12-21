dataprep.pieLegend01 = function(ntwrk) {
    ntwrk.filteredData.records.data = angular.element($("#metricForm0")).scope().selected;
    ntwrk.type = angular.element($("#toggleMetricDisplay")).scope().selected[0]
    
}

visualizationFunctions.PieLegend = function(element, data, opts) {
    var that = this;
    this.config = this.CreateBaseConfig();
    this.VisFunc = function() {
        that.SVG = that.config.easySVG(element[0], {
            background: false
        })

        if (that.type == "Bar") {
            that.SVG.rectG = that.SVG.append("g")
                .attr("transform", "translate(" + [that.config.dims.fixedWidth *.125, that.config.dims.fixedHeight / 2] + ")")

            that.SVG.rect = that.SVG.rectG.selectAll("rect")
                .data(that.filteredData.records.data)
                .enter()
                .append("rect")
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("x", function(d, i) {
                    return that.config.dims.fixedWidth / 2 / that.filteredData.records.data.length * i;
                })
                .attr("y", -that.config.dims.fixedHeight / 4)
                .attr("width", that.config.dims.fixedWidth / 2 / that.filteredData.records.data.length)
                .attr("height", that.config.dims.fixedHeight / 2)
                .on("click", function(d, i) {
                    that.SVG.metricTitle.html(formatText(d))
                })
        }
        if (that.type == "Arc") {
            that.SVG.circleG = that.SVG.append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + (that.config.dims.fixedWidth / 2) + "," + (that.config.dims.fixedHeight / 2) + ")"
                })

            that.SVG.circle = that.SVG.circleG.append("circle")
                .attr("r", that.config.dims.fixedHeight / 4)
                .attr("fill", "lightgrey")

            that.SVG.paths = that.SVG.circleG.selectAll("path")
                .data(that.filteredData.records.data)
                .enter()
                .append("path")
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("d", function(d, i) {
                    return d3.svg.arc()
                        .innerRadius(that.config.dims.fixedHeight / 16)
                        .outerRadius(that.config.dims.fixedHeight / 4)
                        .startAngle((3.14 * 2) / that.filteredData.records.data.length * i)
                        .endAngle((3.14 * 2) / that.filteredData.records.data.length * (i + 1))()
                })
                .on("click", function(d, i) {
                    that.SVG.metricTitle.html(formatText(d))
                })

        }
        that.concentricText;
        if (that.type == "Concentric") {
            that.SVG.circleG = that.SVG.append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + (that.config.dims.fixedWidth / 2) + "," + (that.config.dims.fixedHeight / 2) + ")"
                })

            that.SVG.circle = that.SVG.circleG.append("circle")
                .attr("r", that.config.dims.fixedHeight / 4)
                .attr("fill", "lightgrey")

            that.SVG.circle = that.SVG.circleG.selectAll("circ")
                .data(that.filteredData.records.data)
                .enter()
                .append("circle")
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("r", function(d, i) {
                    return that.config.dims.fixedHeight / 4 / that.filteredData.records.data.length * (that.filteredData.records.data.length - i)
                })

            that.concentricText = that.SVG.append("svg:foreignObject")

            that.concentricText
                .attr("width", (that.config.dims.fixedWidth - 40))
                .attr("x", 20)
                .attr("y", (that.config.dims.fixedWidth / 4 * 3 + 40))
                .append("xhtml:span")
                .html()

        }

        if (that.type == "Clover") {
            that.SVG.circleG = that.SVG.append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + (that.config.dims.fixedWidth / 2) + "," + (that.config.dims.fixedHeight / 2) + ")"
                })

            that.SVG.circle = that.SVG.circleG.append("circle")
                .attr("r", that.config.dims.fixedHeight / 4)
                .attr("fill", "lightgrey")

            that.SVG.circle = that.SVG.circleG.selectAll("circ")
                .data(that.filteredData.records.data)
                .enter()
                .append("circle")
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("cx", function(d1, i1) {
                    if (i1 == 0 || i1 == 2) {
                        return -that.config.dims.fixedHeight / 10
                    }
                    if (i1 == 1 || i1 == 3) {
                        return that.config.dims.fixedHeight / 10
                    }
                })
                .attr("cy", function(d1, i1) {
                    if (i1 == 0 || i1 == 1) {
                        return -that.config.dims.fixedHeight / 10
                    }
                    if (i1 == 2 || i1 == 3) {
                        return that.config.dims.fixedHeight / 10
                    }
                })                 
                .attr("r", function(d, i) {
                    return that.config.dims.fixedHeight / 10
                }).on("click", function(d, i) {
                    that.SVG.metricTitle.html(formatText(d))
                })
        }


        if (that.type == "Radius") {
            that.SVG.circleG = that.SVG.append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + (that.config.dims.fixedWidth / 2) + "," + (that.config.dims.fixedWidth / 2) + ")"
                })
            that.SVG.circle = that.SVG.circleG.selectAll("circ")
                .data([2, 25, 48].reverse())
                .enter()
                .append("circle")
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("r", function(d, i) {
                    return d
                })
                .attr("cy", function(d, i) {
                    if (i > 0) {
                        return 48 - d
                    }
                })

        }

        that.SVG.something = that.SVG.append("svg:foreignObject")
            .attr("width", (that.config.dims.fixedWidth - 40))
            .attr("x", 20)
            .attr("y", 20)
            .html("Click for metric name.")

        that.SVG.metricTitle = that.SVG.append("svg:foreignObject")
            .attr("width", (that.config.dims.fixedWidth - 40))
            .attr("x", 20)
            .attr("y", (that.config.dims.height - 40))
            .append("xhtml:span")
            .html(formatText("Metric Name"))

        function formatText(title, desc) {
            return "<b>" + title + "</b>"
        }


    }
    return that;
}
