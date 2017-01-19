configs.forceNetwork01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: "number_of_authored_works",
                range: [2, 10],
                scale: "linear"
            },
            color: {
                attr: "weightFromEdges",
                range: ["#D9D9D9", "#61899E"]
            }
        },
        identifier: {
            attr: "id" //Unique identifier
        }
    },
    edges: {
        styleEncoding: {
            strokeWidth: {
                attr: "weight",
                range: [1, 5]
            },
            color: {
                attr: "weight",
                range: ["#131313", "#131313"]
            },
            opacity: {
                attr: "weight",
                range: [.375, 1]
            },
        },
        identifier: {
            attr: "id"
        }
    },
    labels: {
        identifier: {
            attr: "label"
        }
    },
    visualization: {
        forceLayout: {
            linkStrength: 0.9,
            friction: 0.9,
            linkDistance: 20,
            theta: 0.1,
            alpha: 1
        }
    }
}

events.forceNetwork01 = function(ntwrk) {
    $('.drawer').drawer();

    setTimeout(function() {
        ntwrk.SVG.force.lock = true;
    }, 25000)
    setTimeout(function() {
        nodeSize.setTitle("#Authored Works")
        nodeSize.setNote("Based on current zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
        nodeSize.updateNodeSize(configs.forceNetwork01.nodes.styleEncoding.size.range);
        nodeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        edgeSize.setTitle("Coauthorship Count")
        edgeSize.setNote("Based on current zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
        edgeSize.updateEdgeSize(configs.forceNetwork01.edges.styleEncoding.strokeWidth.range);
        edgeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        nodeColor.setTitle("Coauthorship Count")
        nodeColor.updateStopColors(configs.forceNetwork01.nodes.styleEncoding.color.range)
        nodeColor.updateText([d3.min(ntwrk.Scales.nodeColorScale.domain()), d3.mean(ntwrk.Scales.nodeColorScale.domain()), d3.max(ntwrk.Scales.nodeColorScale.domain())])

        nodeType.setTitle("User Type (RANDOM)")
        nodeType.updateTypeColors(["#BBADFF", "#B1D632"])
        //Faculty, Student, Unknown
        nodeType.updateText(["Type A", "Type B", "Type C"])

    }, 20);
    ntwrk.SVG.background.on("mousewheel", function() {
        setTimeout(function() {
            nodeSize.updateTextFromFunc(function(d) {
                return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
            });
            edgeSize.updateTextFromFunc(function(d) {
                return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
            });
        nodeSize.setNote("Based on current zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
        edgeSize.setNote("Based on current zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")


        }, 10);
    });

    ntwrk.SVG.background.on("click", function() {
        $(".popup").css({display: "none"})
    })

    setTimeout(function() {
        var color1 = "#BBADFF"
        var color2 = "#B1D632"
        ntwrk.SVG.nodeG.each(function(d, i) {
            d3.select(this).selectAll("circle").style("stroke", "lightgrey");
            barChart01.SVG.barGroups.filter(function(d1, i1) {
                return d.label == d1.key;
            }).selectAll("rect").style("fill", "lightgrey")
            var rand = Math.floor(Math.random() * 100);
            if (rand > 30) {
                d3.select(this).selectAll("circle").style("stroke", color1)
                barChart01.SVG.barGroups.filter(function(d1, i1) {
                    return d.label == d1.key;
                }).selectAll("rect").style("fill", color1)

            }
            if (rand > 10 && rand < 20) {
                d3.select(this).selectAll("circle").style("stroke", color2)
                barChart01.SVG.barGroups.filter(function(d1, i1) {
                    return d.label == d1.key;
                }).selectAll("rect").style("fill", color2)
            }
        })
    }, 1000)



    ntwrk.SVG.edges.on("mouseover", function(d, i) {
        ntwrk.SVG.nodeG.selectAll("*").classed("deselected", true).classed("selected", false)
        ntwrk.SVG.edges.classed("deselected", true).classed("selected", false)
        barChart01.SVG.barGroups.selectAll("*").classed("deselected", true).classed("selected", false)

        d3.select(this).classed("deselected", false).classed("selected", true);

        var selectedNode = ntwrk.SVG.nodeG.filter(function(d1, i1) {
            return d.source.id == d1.id || d.target.id == d1.id;
        })
        selectedNode.selectAll("*").classed("deselected", false).classed("selected", true)
        selectedNode.selectAll("text").style("display", "block") 
        barChart01.SVG.barGroups.filter(function(d1, i1) {
            return d.source.id == d1.values.id || d.target.id == d1.values.id;
        }).selectAll("*").classed("deselected", false).classed("selected", true);
    })

    ntwrk.SVG.edges.on("mouseout", function(d, i) {
        ntwrk.SVG.nodeG.selectAll("text").style("display", "none");
        ntwrk.SVG.nodeG.selectAll("*").classed("deselected", false).classed("selected", false);
        ntwrk.SVG.edges.classed("deselected", false).classed("selected", false);
        barChart01.SVG.barGroups.selectAll("*").classed("deselected", false).classed("selected", false);        
    })


    ntwrk.SVG.nodeG.on("mouseover", function(d, i) {
        d3.select(this).moveToFront();
        d3.select(this).selectAll("text").style("display", "block")

        ntwrk.SVG.nodeG.selectAll("*").classed("deselected", true).classed("selected", false)
        ntwrk.SVG.edges.classed("deselected", true).classed("selected", false)
        barChart01.SVG.barGroups.selectAll("*").classed("deselected", true).classed("selected", false)

        var selectedEdges = ntwrk.SVG.edges.filter(function(d1, i1) {
            return d.id == d1.source.id || d.id == d1.target.id
        })
        selectedEdges.each(function(d1, i1) {
            var newselectedbars = barChart01.SVG.barGroups.filter(function(d2, i2) {
                return d1.source.id == d2.values.id || d1.target.id == d2.values.id
            }).selectAll("*").classed("deselected", false).classed("selected", true);
        })

        selectedEdges.classed("deselected", false).classed("selected", true);

        d3.select(this).selectAll("*").classed("deselected", false).classed("selected", true);
    })

    ntwrk.SVG.nodeG.on("mouseout", function(d, i) {
        ntwrk.SVG.nodeG.selectAll("text").style("display", "none");
        ntwrk.SVG.nodeG.selectAll("*").classed("deselected", false).classed("selected", false);
        ntwrk.SVG.edges.classed("deselected", false).classed("selected", false);
        barChart01.SVG.barGroups.selectAll("*").classed("deselected", false).classed("selected", false);
    })

    ntwrk.SVG.nodeG.on("click", function(d, i) {
        $("#popup-name").text(d[configs.forceNetwork01.labels.identifier.attr])
        $(".popup").css({ display: "block" });
        $("#popup-table").css("display", "block");
        angular.element($("#popup-table-container")).scope().addTableData([{ coauthor: "Author, Ex.", publist: "Pub1, Pub2, Pub3" }]);
        angular.element($("#popup-table-container")).scope().$apply();
        $("#popup-table-container").css("display", "block");
    })
}

dataprep.forceNetwork01 = function(ntwrk) {
    //Calculate node weight from edges
    ntwrk.filteredData.nodes.data.forEach(function(d, i) {
        d.weightFromSourceEdge = ntwrk.filteredData.edges.data.filter(function(d1, i1) {
            return d.id == d1.source;
        }).length
        d.weightFromTargetEdge = ntwrk.filteredData.edges.data.filter(function(d1, i1) {
            return d.id == d1.target;
        }).length
        d.weightFromEdges = d.weightFromSourceEdge + d.weightFromTargetEdge;
    })
}
