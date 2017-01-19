visualizationFunctions.ForceNetwork = function(element, data, opts) {
    var context = this;
    this.VisFunc = function() {

        this.SVG = this.config.easySVG(element[0], {
                zoomable: true,
                zoomLevels: [.5, 20],
                background: false
            }).attr("transform", "translate(" + (this.config.margins.left + this.config.dims.width / 2) + "," + (this.config.margins.top + this.config.dims.height / 2) + ")")
            //Fits the nodes to the canvas a little bit better.
        var k = Math.sqrt(context.filteredData.nodes.data.length / (context.config.dims.width * context.config.dims.height));

        context.SVG.background = context.SVG.append("rect")
            .attr("opacity", .000001)
            // .attr("fill", "red")
            .attr("width", "400%")
            .attr("height", "400%")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(" + -(this.config.margins.left + this.config.dims.width) + "," + -(this.config.margins.top + this.config.dims.height) + ")")

        context.SVG.force = d3.layout.force()
            .nodes(context.filteredData.nodes.data)
            .links(context.filteredData.edges.data)
            .linkStrength(context.config.meta.visualization.forceLayout.linkStrength || 0.1)
            .friction(context.config.meta.visualization.forceLayout.friction || 0.9)
            .linkDistance(context.config.meta.visualization.forceLayout.linkDistance || 20)
            //Initially set lower to prevent springy mess
            .charge(0)
            .gravity(0)
            .theta(context.config.meta.visualization.forceLayout.theta || 0.8)
            .alpha(context.config.meta.visualization.forceLayout.alpha || 0.1)

        context.Scales.nodeSizeScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.nodes.data, function(d, i) {
            return d[context.config.meta.nodes.styleEncoding.size.attr]
        }), context.config.meta.nodes.styleEncoding.size.range)

        context.Scales.nodeColorScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.nodes.data, function(d, i) {
            return d[context.config.meta.nodes.styleEncoding.color.attr]
        }), context.config.meta.nodes.styleEncoding.color.range)

        context.Scales.edgeSizeScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.strokeWidth.attr]
        }), context.config.meta.edges.styleEncoding.strokeWidth.range)

        context.Scales.edgeColorScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.color.attr]
        }), context.config.meta.edges.styleEncoding.color.range)
        context.Scales.edgeOpacityScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.opacity.attr]
        }), context.config.meta.edges.styleEncoding.opacity.range)


        context.SVG.force.physicsOn = true;
        context.SVG.force.physicsToggle = function() {
            if (context.SVG.force.physicsOn) {
                context.SVG.force.physicsOn = false;
                this.stop();
            } else {
                context.SVG.force.physicsOn = true;
                this.start();
            };
        };
        var drag = context.SVG.force.drag()
            .on("dragstart", function() {
                d3.event.sourceEvent.stopPropagation();
            })


        context.SVG.force.lock = false;
        context.SVG.force.on("tick", function() {
            if (!context.SVG.force.lock) {
                context.SVG.nodeG.each(function() {
                    var currNode = d3.select(this);
                    var nodeR = context.SVG.select(".wvf-node" + currNode.data()[0].id).attr("r");
                    currNode.attr("transform", function(d) {
                        x = forceBoundsCollisionCheck(d.x, context.config.dims.width, nodeR);
                        y = forceBoundsCollisionCheck(d.y, context.config.dims.height, nodeR);
                        return "translate(" + x + "," + y + ")"
                    });
                });
                context.SVG.edges.each(function() {
                    d3.select(this).attr("d", function(d) {
                        return Utilities.lineFunction([{
                            "x": forceBoundsCollisionCheck(d.source.x, context.config.dims.width),
                            "y": forceBoundsCollisionCheck(d.source.y, context.config.dims.height)
                        }, {
                            "x": forceBoundsCollisionCheck(d.target.x, context.config.dims.width),
                            "y": forceBoundsCollisionCheck(d.target.y, context.config.dims.height)
                        }])
                    });
                });
            }
        });

        context.SVG.edges = context.SVG.selectAll(".link")
            .data(context.filteredData.edges.data)
            .enter().append("path")
            .attr("class", function(d, i) {
                return "" + " link wvf-edge s s" + d.source + " t t" + d.target;
            })
            .style("stroke-width", function(d, i) {
                return context.Scales.edgeSizeScale(d[context.config.meta.edges.styleEncoding.strokeWidth.attr])
            })
            .style("stroke", function(d, i) {
                return context.Scales.edgeColorScale(d[context.config.meta.edges.styleEncoding.color.attr])
            })
            .attr("opacity", function(d, i) {
                return context.Scales.edgeOpacityScale(d[context.config.meta.edges.styleEncoding.opacity.attr])
            })
        context.SVG.nodeG = context.SVG.selectAll(".node")
            .data(context.filteredData.nodes.data)
            .enter().append("g")
            .attr("class", function(d, i) {
                return "node g g" + d[context.config.meta.nodes.identifier.attr];
            }).call(drag);
        context.SVG.nodes = context.SVG.nodeG.append("circle")
            .attr("class", function(d, i) {
                return d[context.config.meta.labels.identifier.attr] + " wvf-node wvf-node" + d[context.config.meta.nodes.identifier.attr];
            })
            .attr("r", function(d, i) {
                return context.Scales.nodeSizeScale(d[context.config.meta.nodes.styleEncoding.size.attr])
            })
            .style("fill", function(d, i) {
                return context.Scales.nodeColorScale(d[context.config.meta.nodes.styleEncoding.color.attr])
            })
        context.SVG.labels = context.SVG.nodeG.append("text")
            .attr("class", "wvf-label-mid")
            .text(function(d, i) {
                return d[context.config.meta.labels.identifier.attr]
            })
            .attr("display", "none")



        context.SVG.nodeG.on("mouseover.labels", function(d, i) {
            d3.select(this).selectAll("text").attr("display", "block");
        })
        context.SVG.nodeG.on("mouseout.labels", function(d, i) {
            d3.select(this).selectAll("text").attr("display", "none");
        })
        context.SVG.nodeG.on("mouseup.pinNodes", function(d, i) {
            if (d3.event.shiftKey) {
                d.fixed = true;
            } else {
                d.fixed = false;
            }
        })
        context.SVG.nodeG.on("click.showEdges", function(d, i) {
            context.SVG.edges
                .classed("selected", false)
                .classed("deselected", true)

            context.SVG.edges.filter(function(d1, i1) {
                return d.id == d1.source.id || d.id == d1.target.id
            }).classed("selected", true).classed("deselected", false)
        })



        //TODO: Fix this. Is it an issue with the canvas dimensions?
        function forceBoundsCollisionCheck(val, lim, off) {
            var offset = 0;
            if (off) {
                offset = off;
            }
            if (val <= -lim / 2 - offset) return -lim / 2 - offset;
            if (val >= lim / 2 - offset) return lim / 2 - offset;
            return val;
        };
        context.SVG.force.start();

        context.easeForceInterval = null;
        var intervalIteration = 0;
        var maxIntervalIteration = 5
        context.easeForceInterval = setInterval(function() {
            if (intervalIteration >= maxIntervalIteration) {
                clearInterval(context.easeForceInterval)
            } else {
                context.SVG.force.stop()
                context.SVG.force
                    .charge((context.config.meta.visualization.forceLayout.charge || -10 / k) / maxIntervalIteration * intervalIteration)
                    .gravity((context.config.meta.visualization.forceLayout.gravity || 100 * k) / maxIntervalIteration * intervalIteration)
                context.SVG.force.start()
                intervalIteration += 1;
            }
        }, 250);

        // context.SVG.force.stop()
        // context.SVG.force
        //     .charge((context.config.meta.visualization.forceLayout.charge || -10 / k) / maxIntervalIteration * intervalIteration)
        //     .gravity((context.config.meta.visualization.forceLayout.gravity || 100 * k) / maxIntervalIteration * intervalIteration)
        // context.SVG.force.start()

    }

    this.configSchema = {
        nodes: {
            styleEncoding: {
                size: {
                    attr: "id",
                    range: [1, 1],
                    scale: "linear"
                },
                color: {
                    attr: "id",
                    range: ["black", "black"]
                }
            },
            identifier: {
                attr: "id"
            },
            prettyMap: {}
        },
        edges: {
            styleEncoding: {
                strokeWidth: {
                    attr: "id",
                    range: [1, 1]
                },
                opacity: {
                    attr: "id",
                    range: [1, 1]
                },
                color: {
                    attr: "id",
                    range: ["black", "black"]
                }
            },
            identifier: {
                attr: "id"
            },
            prettyMap: {}
        },
        labels: {
            identifier: {
                attr: "id"
            }
        },
        visualization: {
            forceLayout: {}
        }
    }
    this.config = this.CreateBaseConfig();


    return context;
}
