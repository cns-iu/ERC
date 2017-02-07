head.js({
    'underlyingScimapData': 'visuals/MapOfScience/MapOfScience/underlyingScimapData.js'
}, {
    'disc_lookup': 'visuals/MapOfScience/MapOfScience/disc_lookup.js'
});




// head.js('visuals/MapOfScience/MapOfScience/mingle/graph.js');
// head.js('visuals/MapOfScience/MapOfScience/mingle/mingle.js');
// head.js('visuals/MapOfScience/MapOfScience/mingle/kdtree.js');

visualizationFunctions.MapOfScience = function(element, data, opts) {
    var that = this;
    this.config = this.CreateBaseConfig();


    this.SVG = this.config.easySVG(element[0], {
        zoomable: true,
        zoomLevels: [.5, 20],
        background: false
    })
    this.VisFunc = function() {
        head.ready('disc_lookup', function() {
            that.SVG.background = that.SVG.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white")
                .attr("opacity", .00000001)
            var defaultNodeSize = 1;
            underlyingScimapData.nodes.forEach(function(d, i) {
                d.disc_name = underlyingScimapData.disciplines.filter(function(d1, i1) {
                    return d.disc_id == d1.disc_id
                })[0].disc_name
            })
            that.nestedData = nestDiscChildData(nestDiscData(that.filteredData[that.PrimaryDataAttr].data));
            createScales();
            that.SVG.underlyingNodeG = createNodes(underlyingScimapData);
            that.SVG.underlyingNodes = that.SVG.underlyingNodeG.selectAll("circle");
            // results = bundleData(underlyingScimapData);
            that.SVG.underlyingEdges = createEdges(underlyingScimapData);
            that.SVG.underlyingLabels = createLabels(underlyingScimapData);
            // that.SVG.underlyingEdges = that.SVG.underlyingEdgeG.selectAll("path");

            function nestDiscData(data) {
                data.forEach(function(d, i) {
                    var disc = disc_lookup.records.data.filter(function(d1, i1) {
                        return d[that.config.meta.visualization.subd_id] == d1.subd_id
                    })
                    d.disc_id = disc[0].disc_id;
                    // console.log(d);
                })

                return {
                    disc: d3.nest()
                        .key(function(d) {
                            return parseInt(d.disc_id);
                        })
                        .rollup(function(leaves) {
                            var obj = {
                                children: leaves
                            };
                            that.filteredData[that.PrimaryDataAttr].schema.forEach(function(d) {
                                if (d.type == "numeric") {
                                    obj[d.name] = d3.sum(leaves, function(d1) {
                                        return d1[d.name];
                                    })
                                }
                            })
                            return obj;
                        })
                        .entries(data),
                    sub_disc: []
                }
            }

            function nestDiscChildData(data) {
                data.disc.forEach(function(d, i) {
                    d.values.nestedChildren = d3.nest()
                        .key(function(d1) {
                            return parseInt(d1[that.config.meta.visualization.subd_id]);
                        })
                        .rollup(function(leaves) {
                            var obj = {
                                children: leaves
                            };
                            that.filteredData[that.PrimaryDataAttr].schema.forEach(function(d1) {
                                if (d1.type == "numeric") {
                                    obj[d1.name] = d3.sum(leaves, function(d2) {
                                        return d2[d1.name];
                                    })
                                }
                            })
                            return obj;
                        }).entries(d.values.children);
                    data.sub_disc = data.sub_disc.concat(d.values.nestedChildren);
                });
                return data;
            }

            function createScales() {
                that.Scales.translateX = d3.scale.linear()
                    .domain(d3.extent(underlyingScimapData.nodes, function(d) {
                        return d.x
                    }))
                    .range([10, that.config.dims.fixedWidth - 10])
                that.Scales.translateY = d3.scale.linear()
                    .domain(d3.extent(underlyingScimapData.nodes, function(d) {
                        return d.y
                    }))
                    .range([that.config.dims.fixedHeight - 10, 10])
                that.Scales.sizeScale = d3.scale.linear()
                    .domain(d3.extent(that.nestedData.sub_disc, function(d) {
                        return d.values[that.config.meta[that.PrimaryDataAttr].styleEncoding.size.attr]
                    }))
                    .range(that.config.meta[that.PrimaryDataAttr].styleEncoding.size.range || [2, 16])
            }


            function createNodes(underlyingData) {
                var nodeG = that.SVG.selectAll(".underlyingNodes")
                    .data(underlyingData.nodes)

                nodeG.enter()
                    .append("g")
                    .attr("class", function(d, i) {
                        return "wvf-node-g subd_id" + d.subd_id + " disc_id" + d.disc_id;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + that.Scales.translateX(d.x) + "," + that.Scales.translateY(d.y) + ")"
                    })

                nodeG
                    .append("circle")
                    .attr("r", defaultNodeSize)
                    .attr("class", function(d, i) {
                        return "wvf-node subd_id" + d.subd_id + " disc_id" + d.disc_id;
                    })
                    .attr("fill", function(d, i) {
                        var disc = underlyingData.disciplines.filter(function(d1, i1) {
                            if (d.disc_id == d1.disc_id) {
                                return d1;
                            }
                        })
                        return disc[0].color;
                    })
                    .property("x", function(d, i) {
                        return that.Scales.translateX(d.x)
                    })
                    .property("y", function(d, i) {
                        return that.Scales.translateY(d.y)
                    })
                nodeG.append("text")
                    .attr("class", "subd")
                    .text(function(d, i) {
                        return d.subd_name
                    })
                    .attr("x", 0)
                    .attr("y", -defaultNodeSize)
                    .attr("text-anchor", "middle")
                return nodeG
            }


            that.labelClicked = false;

            function createLabels(underlyingData) {
                return that.SVG.selectAll(".underlyingLabels")
                    .data(underlyingData.labels)
                    .enter()
                    .append("text")
                    .attr("class", "wvf-label")
                    .attr("text-anchor", function(d, i) {
                        var x = that.Scales.translateX(d.x);
                        var m = d3.mean(that.Scales.translateX.range())
                        if (x > m) {
                            return "end";
                        } else if (x < m) {
                            return "start";
                        }
                        return "middle"
                    })
                    .attr("x", function(d, i) {
                        return that.Scales.translateX(d.x)
                    })
                    .attr("y", function(d, i) {
                        return that.Scales.translateY(d.y)
                    })
                    .style("fill", function(d, i) {
                        return d.color
                    })
                    .text(function(d, i) {
                        return d.disc_name;
                    })
                    .on("click", function(d, i) {
                        if (that.labelClicked) {
                            that.SVG.selectAll("*").classDefault();
                            that.labelClicked = false;
                        } else {
                            that.SVG.underlyingNodes.classDeselect();
                            that.SVG.underlyingEdges.classDeselect();
                            that.SVG.underlyingLabels.classDeselect();
                            d3.select(this).classSelect();

                            that.SVG.underlyingNodes.filter(function(d1, i1) {
                                if (d.disc_id == d1.disc_id) {
                                    d3.select(this).classSelect();
                                    return true;
                                }
                                return false;
                            }).each(function(d1, i1) {
                                that.SVG.underlyingEdges.filter(".s" + d1.subd_id + ", .t" + d1.subd_id).each(function(d2, i2) {
                                    d3.select(this).classSelect();
                                    that.SVG.underlyingNodes.filter(".subd_id" + d2.subd_id1 + ".subd_id" + d2.subd_id2).classSelect();
                                })
                            })
                            that.labelClicked = true;
                        }
                    })
            }

            function createEdges(underlyingData) {
                // var newEdges = [];

                // underlyingScimapData.edges.forEach(function(d, i) {
                //     var sourceNode = underlyingScimapData.nodes.filter(function(d1, i1) {
                //         return d1.subd_id == d.subd_id1;
                //     })[0];
                //     var targetNode = underlyingScimapData.nodes.filter(function(d1, i1) {
                //         return d1.subd_id == d.subd_id2;
                //     })[0];

                //     var sourceDisc = underlyingScimapData.labels.filter(function(d1, i1) {
                //         return d1.disc_id == sourceNode.disc_id;
                //     })[0];

                //     var targetDisc = underlyingScimapData.labels.filter(function(d1, i1) {
                //         return d1.disc_id == targetNode.disc_id;
                //     })[0];



                //     newEdges.push([
                //         that.Scales.translateX(sourceNode.x),
                //         that.Scales.translateY(sourceNode.y),
                //         that.Scales.translateX(sourceDisc.x),
                //         that.Scales.translateY(sourceDisc.y)
                //     ])

                //     newEdges.push([
                //         that.Scales.translateX(sourceDisc.x),
                //         that.Scales.translateY(sourceDisc.y),
                //         that.Scales.translateX(targetDisc.x),
                //         that.Scales.translateY(targetDisc.y)
                //     ])

                //     newEdges.push([
                //         that.Scales.translateX(targetDisc.x),
                //         that.Scales.translateY(targetDisc.y),
                //         that.Scales.translateX(targetNode.x),
                //         that.Scales.translateY(targetNode.y)
                //     ])

                // })

                // var edgeMap = [];
                // newEdges.forEach(function(d1, i1) {
                //     if (i1 < 20) {
                //         console.log(d1);
                //     }
                //     edgeMap.push({
                //         id: i1,
                //         name: i1,
                //         data: {
                //             coords: d1,
                //             weight: d1.Weight
                //         }
                //     })
                // })

                // var bundle = new Bundler();
                // bundle.setNodes(edgeMap);
                // bundle.buildNearestNeighborGraph();
                // bundle.MINGLE();

                // that.SVG.edges = that.SVG.append("g");

                // bundle.graph.each(function(node) {
                //     var edges = node.unbundleEdges(1);
                //     edges.forEach(function(d, i) {
                //         var lineArr = [];
                //         d.forEach(function(d1, i1) {
                //             lineArr.push({
                //                 x: d1.pos[0],
                //                 y: d1.pos[1]
                //             })
                //         })
                //         that.SVG.edges.append("path")
                //             // .attr("class", "wvf-edge")
                //             .attr("opacity", .2)
                //             .attr("stroke", "grey")
                //             .attr("stroke-width", .5)
                //             .attr("fill", "none")
                //             .attr("d", Utilities.lineFunction(lineArr))
                //             .on("click.remove", function(d, i) {
                //                 d3.select(this).remove();
                //             })
                //     })
                // })






                return that.SVG.selectAll("paath")
                    .append("g")
                    .data(underlyingData.edges)
                    .enter()
                    .append("path")
                    .attr("class", function(d1, i1) {
                        return "wvf-edge s" + d1.subd_id1 + " t" + d1.subd_id2;
                    }).attr("d", function(d, i) {
                        var sourceNode = that.SVG.underlyingNodes.filter(".subd_id" + d.subd_id1)
                        var targetNode = that.SVG.underlyingNodes.filter(".subd_id" + d.subd_id2)

                        return Utilities.lineFunction([{
                            "x": sourceNode.property("x"),
                            "y": sourceNode.property("y")
                        }, {
                            "x": targetNode.property("x"),
                            "y": targetNode.property("y")
                        }])
                    })
                    .on("mouseover", function(d, i) {
                        that.SVG.underlyingLabels.classDeselect();
                        that.SVG.underlyingEdges.classDeselect();
                        d3.select(this).classSelect();
                        that.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1).classSelect().selectAll("text").classSelect();
                        that.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id2).classSelect().selectAll("text").classSelect();

                    }).on("mouseout", function(d, i) {
                        that.SVG.selectAll("*").classDefault();
                        that.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1).classSelect().selectAll("text").classDeselect();
                        that.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id2).classSelect().selectAll("text").classDeselect();
                    })
            }


            that.SVG.applyNodeEvents = function(sel) {
                sel.on("mouseover", function(d, i) {
                        that.SVG.underlyingNodes.classDeselect();
                        // that.SVG.underlyingEdges.classDeselect();
                        that.SVG.underlyingLabels.classDeselect();
                        d3.select(this).classSelect();
                        that.SVG.underlyingEdges.filter(".s" + d.subd_id).mergeSelections(that.SVG.underlyingEdges.filter(".t" + d.subd_id)).each(function(d, i) {
                            that.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1 + ", .subd_id" + d.subd_id2).selectAll("*").classSelect();
                            // d3.select(this).classSelect();
                        })
                    })
                    .on("mouseout", function(d, i) {
                        that.SVG.selectAll("*").classDefault();
                    })
            }
            that.SVG.applyNodeEvents(that.SVG.underlyingNodeG)


            that.SVG.update = function(newData) {
                if (newData) {
                    that.nestedData = nestDiscChildData(nestDiscData(newData));
                    createScales();
                }

                that.SVG.underlyingNodes
                    .attr("r", defaultNodeSize)

                that.SVG.underlyingLabels

                that.SVG.recalculateMaxGlobalDomain(function(d) {
                    return d[that.config.meta[that.PrimaryDataAttr].styleEncoding.size.attr]
                })
                that.SVG.updateNodeR(function(d) {
                    return d[that.config.meta[that.PrimaryDataAttr].styleEncoding.size.attr]
                })
            }

            that.SVG.recalculateMaxGlobalDomain = function(func) {
                rVals = [];
                that.nestedData.sub_disc.forEach(function(d, i) {
                    var rVal = 0;
                    d.values.children.forEach(function(d1, i1) {
                        rVal += func(d1) || 0;
                    })
                    rVals.push(rVal);
                })
                that.SVG.maxGlobalDomain = d3.extent(rVals);
            }
            that.SVG.recalculateMaxGlobalDomain(function(d) {
                return d[that.config.meta[that.PrimaryDataAttr].styleEncoding.size.attr];
            })

            that.SVG.updateNodeR = function(func) {
                that.nestedData.sub_disc.forEach(function(d, i) {
                    var rVal = 0;
                    d.values.children.forEach(function(d1, i1) {
                        rVal += func(d1) || 0;
                    })
                    d.rScaleVal = rVal;
                });

                if (that.SVG.maxGlobalDomain[0] == that.SVG.maxGlobalDomain[1]) {
                    if (that.SVG.maxGlobalDomain[0] >= 0) {
                        that.SVG.maxGlobalDomain[0] = 0
                    } else {
                        that.SVG.maxGlobalDomain[1] = 0
                    }
                }
                var scale = Utilities.makeDynamicScaleNew(that.SVG.maxGlobalDomain, that.config.meta[that.PrimaryDataAttr].styleEncoding.size.range || [2, 24], "linear");
                that.nestedData.sub_disc.forEach(function(d, i) {
                    var currNode = that.SVG.underlyingNodeG.filter(".subd_id" + d.key)

                    try {
                        currNode.selectAll("circle").attr("r", scale(d.rScaleVal))
                        currNode.selectAll("text").attr("y", -scale(d.rScaleVal))
                    } catch (e) {
                        currNode.selectAll("circle").attr("r", defaultNodeSize)
                    }
                })
            }

            that.SVG.underlyingNodeG.moveToFront();
            that.SVG.underlyingLabels.moveToFront();

            that.SVG.update();
        })
    }
    return that;
}




d3.selection.prototype.classSelect = function() {
    return this.each(function() {
        d3.select(this).classed("deselected", false).classed("selected", true);
    });
}

d3.selection.prototype.classDeselect = function() {
    return this.each(function() {
        d3.select(this).classed("selected", false).classed("deselected", true);
    });
}

d3.selection.prototype.classDefault = function() {
    return this.each(function() {
        d3.select(this).classed("selected", false).classed("deselected", false);
    });
}
