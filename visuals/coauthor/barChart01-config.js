configs.barChart01 = {
    nodes: {
        colAggregator: "label"
    },
    bars: {
        styleEncoding: {
            size: {
                attr: "number_of_authored_works"
                    // attr: "weightFromEdges"
            },
            graphOffset: [10, 10]
        }
    },
    labels: {
        xAxis: {
            attr: "#Authored Works",
            orientation: "top"
        },
        yAxis: {
            attr: "",
            orientation: "right"
        },
    },
    orientation: "vertical"
}

events.barChart01 = function(ntwrk) {
    var labels = [];
    ntwrk.filteredData.nodes.data.forEach(function(d, i) {
        if (labels.indexOf(d.key) == -1) {
            labels.push(d.key);
        }
    })

    var newyAxis = d3.svg.axis()
        .scale(d3.scale.ordinal()
            .domain(labels)
            .range(ntwrk.chart.yscale().range()))
        .tickValues([])
        .ticks([])
    ntwrk.chart.chartYG().call(newyAxis)

    ntwrk.SVG.barGroups.each(function(d, i) {
        var currG = d3.select(this);
        var rect = d3.select(currG.selectAll("rect")[0][0])
        var offset = parseFloat(rect.attr("y")) - (parseFloat(rect.attr("height")) / 2) + parseFloat(rect.attr("height") * 1.25)
        currG.append("text")
            .text(d.key)
            .attr("y", offset)
    });
    ntwrk.SVG.barGroups.on("mouseover", function(d, i) {

        forceNetwork01.SVG.nodeG.selectAll("*").classed("deselected", true).classed("selected", false)
        forceNetwork01.SVG.edges.classed("deselected", true).classed("selected", false)
        ntwrk.SVG.barGroups.selectAll("*").classed("deselected", true).classed("selected", false)

        var selected = forceNetwork01.SVG.nodeG.filter(function(d1, i1) {
            return d1.id == d.values.id
        })
        selected.selectAll("*").classed("deselected", false).classed("selected", true);
        selected.selectAll("text").style("display", "block")


        forceNetwork01.SVG.edges.filter(function(d1, i1) {
            return d.values.id == d1.source.id || d.values.id == d1.target.id;
        }).classed("deselected", false).classed("selected", true);

        d3.select(this).selectAll("*").classed("deselected", false).classed("selected", true)
    })

    ntwrk.SVG.barGroups.on("mouseout", function(d, i) {
        forceNetwork01.SVG.nodeG.selectAll("*").classed("deselected", false).classed("selected", false);
        forceNetwork01.SVG.nodeG.selectAll("text").style("display", "none");
        forceNetwork01.SVG.edges.classed("deselected", false).classed("selected", false);
        ntwrk.SVG.barGroups.selectAll("*").classed("deselected", false).classed("selected", false);

    })














    ntwrk.SVG.barGroups.on("click", function(d, i) {
        $("#popup-name").text(d.key)
        $(".popup").css({ display: "block" });
        $("#popup-table").css("display", "block");
        angular.element($("#popup-table-container")).scope().addTableData([{ coauthor: "Author, Ex.", publist: "Pub1, Pub2, Pub3" }]);
        angular.element($("#popup-table-container")).scope().$apply();
        $("#popup-table-container").css("display", "block");
    })


}

dataprep.barChart01 = function(ntwrk) {
    ntwrk.filteredData.nodes.data.forEach(function(d, i) {
        d.weightFromSourceEdge = ntwrk.filteredData.edges.data.filter(function(d1, i1) {
            return d.id == d1.source;
        }).length
        d.weightFromTargetEdge = ntwrk.filteredData.edges.data.filter(function(d1, i1) {
            return d.id == d1.target;
        }).length
        d.weightFromEdges = d.weightFromSourceEdge + d.weightFromTargetEdge;
    });
    ntwrk.filteredData[ntwrk.PrimaryDataAttr].schema = ntwrk.guessDataSchema(ntwrk.filteredData)
}
