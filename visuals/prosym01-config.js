configs.prosym01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: "weight",
                range: [4, 10],
                scaleType: "linear"
            }
            // "color": {
            //     "attr": "",
            //     "range": ["[string]"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale. 
            // }
        }
    },

    edges: {
        styleEncoding: {
            size: {
                attr: "weight",
                range: [.5, 2]
            }
            // "color": {
            //     "attr": "",
            //     "range": ["[string]"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale. 
            // }
        },
        bundle: true
    },
    identifier: "id", //Unique identifier
    lat: "lat",
    lng: "lng",
    categories: ["city", "id", "state"]
}


dataprep.prosym01 = function(ntwrk) {
}

events.prosym01 = function(ntwrk) {
    setTimeout(function() {
        nodeSize.setTitle("Weight")
        nodeSize.setNote("Based on zoom level")
        nodeSize.updateNodeSize(configs.prosym01.nodes.styleEncoding.size.range);
        nodeSize.updateText([ntwrk.categoryScales[ntwrk.currCategory].size(8), ntwrk.categoryScales[ntwrk.currCategory].size(76.8), ntwrk.categoryScales[ntwrk.currCategory].size(128)]);
    }, 20)
    ntwrk.SVG.background.on("mousewheel", function() {
        setTimeout(function() {
            nodeSize.updateText([ntwrk.categoryScales[ntwrk.currCategory].size(12.5) / ntwrk.zoom.scale(), ntwrk.categoryScales[ntwrk.currCategory].size(76.8) / ntwrk.zoom.scale(), ntwrk.categoryScales[ntwrk.currCategory].size(128) / ntwrk.zoom.scale()]);
        }, 10)
    })
    ntwrk.SVG.nodeG.on("click", function(d, i) {

        console.log(d);
        angular.element($("#legend-table")).scope().$apply(function(scope) {
            var something = [];

            d.values.children.forEach(function(d1, i1) {
                something.push({
                    label: d1.label,
                    name: d1.title
                })
            })

            if (d.values.children.length > 0) {
                $(".legend").removeClass("default");
                $("#legend-location-name").text(d.key);
                $("#legend-table-container").removeClass("default");
            } else {
                $(".legend").addClass("default");
            }

            scope.rowCollection = something
        })
    })
    ntwrk.SVG.background.on("click", function(d, i) {
        $(".legend").addClass("default");
    })

}
