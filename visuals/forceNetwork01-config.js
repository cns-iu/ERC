//**DONE**AS long as popup exists, persist click event
//**DONE**Make no year nodes white
//**DONE**Fix labels
//Fix zoom origin transform
//Find two complimentary colors that have different contrasts
//Zoom buttons need to ignore other events
//**DONE**Add manual merge to url param
configs.forceNetwork01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: "numPapers",
                range: [2, 10],
                scale: "linear"
            },
            color: {
                //TODO: Color code year of publication
                attr: "firstYearPublished",
                range: ["#61899E", "#D9D9D9"]
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
            attr: "author"
        }
    },
    visualization: {
        forceLayout: {
            linkStrength: 0.9,
            friction: .9,
            linkDistance: 20,
            theta: 0.1,
            alpha: 1
        }
    }
}

events.forceNetwork01 = function(ntwrk) {
    ntwrk.isPopupShowing = false;



    setTimeout(function() {
        configureDOMElements();
    }, 500)
    // setTimeout(function() {
    //     var color1 = "darkred"
    //     var color2 = "darkblue"
    //     ntwrk.SVG.nodeG.each(function(d, i) {
    //         d3.select(this).selectAll("circle").style("stroke", "lightgrey");
    //         barChart01.SVG.barGroups.filter(function(d1, i1) {
    //             return d.label == d1.key;
    //         }).selectAll("rect").attr("stroke", "black")
    //         var rand = Math.floor(Math.random() * 100);
    //         if (rand > 30) {
    //             d3.select(this).selectAll("circle").style("stroke", color1)
    //             barChart01.SVG.barGroups.filter(function(d1, i1) {
    //                 return d.label == d1.key;
    //             }).selectAll("rect").style("stroke", color1)

    //         }
    //         if (rand > 10 && rand < 20) {
    //             d3.select(this).selectAll("circle").style("stroke", color2)
    //             barChart01.SVG.barGroups.filter(function(d1, i1) {
    //                 return d.label == d1.key;
    //             }).selectAll("rect").style("stroke", color2)
    //         }
    //     })
    // }, 1000)

    ntwrk.SVG.nodeG.each(function(d, i) {
        if (d.firstYearPublished == null) {
            d3.select(this).selectAll("circle").attr("fill", "white");
        }
    })

    ntwrk.SVG.nodeG.selectAll("text").style("pointer-events", "none")

    ntwrk.SVG.edges.on("mouseover", edgeMouseover)
    ntwrk.SVG.edges.on("mouseout", function(d, i) {
        edgeMouseout()
    })
    ntwrk.SVG.nodeG.on("mouseover", nodeMouseover)
    ntwrk.SVG.nodeG.on("mouseout", function(d, i) {
        nodeMouseout()
    })

    ntwrk.SVG.nodeG.selectAll("circle").on("click", nodeClickEvent)
    ntwrk.SVG.nodeG.selectAll("rect").on("click", nodeClickEvent)


    function nodeClickEvent(d, i) {
        if (!legendToggleOff) {
            toggleLegend();
        }
        var tableData = [];
        ntwrk.filteredData.edges.data.forEach(function(d1, i1) {
            var found = false;
            var coauth;
            if (d1.source.id == d.id) {
                found = true;
                coauth = d1.target;
            }
            if (d1.target.id == d.id) {
                found = true;
                coauth = d1.source;
            }
            if (found) {
                var publist = "";
                d1.coauthoredWorks.forEach(function(d, i) {
                    publist += d.title + "; ";
                })

                tableData.push({
                    coauthor: coauth.author,
                    publist: publist.substring(0, publist.length - 2),
                    weight: d1.weight
                })
            }
        })
        $("#popup-name").text(d[configs.forceNetwork01.labels.identifier.attr])
        $(".popup").css({ display: "block" });
        $("#popup-table").css("display", "block");
        angular.element($("#popup-table-container")).scope().clearTableData();
        angular.element($("#popup-table-container")).scope().addTableData(tableData.sort(function(a, b) {
            return a.weight > b.weight
        }));
        angular.element($("#popup-table-container")).scope().$apply();
        $("#popup-table-container").css("display", "block");
        ntwrk.isPopupShowing = true;
    }


    function edgeMouseover(d, i) {
        if (!ntwrk.isPopupShowing) {
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart01.SVG.barGroups);
            selectSelection(d3.select(this));
            selectSelection(barChart01.SVG.barGroups.filter(function(d1, i1) {
                return d.source.id == d1.values.id || d.target.id == d1.values.id;
            }));

            var selectedNode = ntwrk.SVG.nodeG.filter(function(d1, i1) {
                return d.source.id == d1.id || d.target.id == d1.id;
            });
            selectSelection(selectedNode);
            selectedNode.selectAll("text").style("display", "block");

        }
    }

    function edgeMouseout() {
        if (!ntwrk.isPopupShowing) {
            defaultSelection(ntwrk.SVG.nodeG);
            defaultSelection(ntwrk.SVG.edges);
            defaultSelection(barChart01.SVG.barGroups);
            showFilteredLabels();
        }
    }
    function nodeMouseover(d, i) {
        if (!ntwrk.isPopupShowing) {
            d3.select(this).moveToFront();
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart01.SVG.barGroups);

            var selectedEdges = ntwrk.SVG.edges.filter(function(d1, i1) {
                return d.id == d1.source.id || d.id == d1.target.id
            });
            selectedEdges.each(function(d1, i1) {
                selectSelection(barChart01.SVG.barGroups.filter(function(d2, i2) {
                    return d1.source.id == d2.values.id || d1.target.id == d2.values.id
                }));
            });
            selectSelection(selectedEdges);
            selectSelection(d3.select(this));
            ntwrk.SVG.nodeG.selectAll("text").style("display", "none");
            d3.select(this).selectAll("text").style("display", "block");
        }
    }
    function nodeMouseout() {
        if (!ntwrk.isPopupShowing) {
            defaultSelection(ntwrk.SVG.nodeG);
            defaultSelection(ntwrk.SVG.edges);
            defaultSelection(barChart01.SVG.barGroups);
            showFilteredLabels();
        }
    }


    function updateNodes(val, orderedSizeCoding) {
        console.log("updating nodes");
        var p = orderedSizeCoding[Math.floor(val / 100 * orderedSizeCoding.length)];
        // ntwrk.filteredData.nodes.data = ntwrk.allNodes.filter(function(d, i) {
        //     return (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] > p);
        // });
        ntwrk.filteredData.nodes.data = [];
        ntwrk.SVG.force.restart();
    }

    function updateLabelVisibility(val, orderedSizeCoding) {
        var p = orderedSizeCoding[Math.floor(val / 100 * orderedSizeCoding.length)];
        ntwrk.SVG.nodeG.selectAll("text").style("display", "none").classed("deselected", false).classed("selected", false);
        ntwrk.SVG.nodeG.selectAll("text").style("display", function(d, i) {
            if (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] >= p) {
                d.keepLabel = true;
                return "block"
            } else {
                d.keepLabel = false;
                return "none"
            }
        });
    }

    function showFilteredLabels() {
        ntwrk.SVG.nodeG.selectAll("text").style("display", "block")
        ntwrk.SVG.nodeG.selectAll("text").style("display", function(d1, i1) {
            if (!d1.keepLabel) {
                return "none"
            }
            return "block"
        });
    }

    function deselectSelection(sel) {
        sel.classed("deselected", true).classed("selected", false);
    }

    function selectSelection(sel) {
        sel.classed("deselected", false).classed("selected", true);
    }

    function defaultSelection(sel) {
        sel.classed("deselected", false).classed("selected", false);
    }

    ntwrk.SVG.background.on("click", function() {
        $(".popup").css({ display: "none" })
        ntwrk.isPopupShowing = false;
        nodeMouseout();
    })


    function configureDOMElements() {

        $('.drawer').drawer();

        var orderedSizeCoding = [];
        ntwrk.filteredData.nodes.data.forEach(function(d, i) {
            orderedSizeCoding.push(d[configs.forceNetwork01.nodes.styleEncoding.size.attr]);
        })
        orderedSizeCoding.sort(function(a, b) {
            return Number(a) - Number(b);
        });


        var $range = $("#range");
        $range.ionRangeSlider({
            min: 0,
            max: 100,
            from: 90,
            // type: 'double',
            step: 1,
            grid: true,
            onChange: function(newVal) {
                updateLabelVisibility(newVal.from, orderedSizeCoding)
            }
        });

        var $range = $("#range1");
        $range.ionRangeSlider({
            min: 0,
            max: 100,
            from: 0,
            // type: 'double',
            step: 1,
            grid: true,
            onChange: function(newVal) {
                updateNodes(newVal.from, orderedSizeCoding)
            }
        });
        ntwrk.allNodes = [].concat(ntwrk.filteredData.nodes.data);
        ntwrk.allEdges = [].concat(ntwrk.filteredData.edges.data);
        updateLabelVisibility(90, orderedSizeCoding);

        slider = $("#range").data("ionRangeSlider");
        var sliderFormElem = $("#sliderForm");
        var sliderFormScope = angular.element(sliderFormElem).scope();
        nodeSize.setTitle("#Papers")
        nodeSize.setNote("Based on zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
        nodeSize.updateNodeSize(configs.forceNetwork01.nodes.styleEncoding.size.range);
        nodeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        edgeSize.setTitle("#Co-authored Papers")
        edgeSize.setNote("Based on zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
        edgeSize.updateEdgeSize(configs.forceNetwork01.edges.styleEncoding.strokeWidth.range);
        edgeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        nodeColor.setTitle("Year of First Publication")
        nodeColor.updateStopColors(configs.forceNetwork01.nodes.styleEncoding.color.range)
        nodeColor.updateText([d3.min(ntwrk.Scales.nodeColorScale.domain()), d3.mean(ntwrk.Scales.nodeColorScale.domain()), d3.max(ntwrk.Scales.nodeColorScale.domain())])

        nodeType.setTitle("Author Type (DISABLED)")
        nodeType.updateTypeColors(["#610009", "limegreen"])

        //Faculty, Student, Unknown
        nodeType.updateText(["Type A", "Type B", "Type C"])
        ntwrk.SVG.on("mousewheel", function() {
            setTimeout(function() {
                nodeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                edgeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                nodeSize.setNote("Based on zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
                edgeSize.setNote("Based on zoom level (x " + Utilities.round(ntwrk.zoom.scale(), 1) + ")")
            }, 10);
        });
    }

}

dataprep.forceNetwork01 = function(ntwrk) {
    if (ntwrk.DataService.mapDatasource[ntwrk.attrs.ngDataField].toProcess) {
        var processedData = processAuthorSpec(ntwrk.filteredData);
        ntwrk.filteredData.nodes = processedData.nodes;
        ntwrk.filteredData.edges = processedData.edges;
    }
}
