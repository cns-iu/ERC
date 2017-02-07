configs.scimap01 = {
    visualization: {
        disc_id: "disc_id",
        subd_id: "subd_id",

    },
    records: {
        styleEncoding: {
            size: {
                attr: "values",
                range: [4, 20],
                scaleType: "log"
            }
        }
    },
};


events.scimap01 = function(ntwrk) {
    ntwrk.Scales.rScale = d3.scale[configs.scimap01.records.styleEncoding.size.scaleType]()
        .domain(d3.extent(ntwrk.nestedData.sub_disc, function(d, i) {
            return d.values.children.length
        }))
        .range(configs.scimap01.records.styleEncoding.size.range)


    ntwrk.nestedData.sub_disc.forEach(function(d, i) {
        var currNodeG = ntwrk.SVG.underlyingNodeG.filter(".subd_id" + d.key);
        var currNode = currNodeG.selectAll("circle").attr("r", ntwrk.Scales.rScale(d.values.children.length));
    })

    ntwrk.SVG.underlyingEdges.on("mouseover", null)
    ntwrk.SVG.underlyingEdges.on("mouseout", null)

    ntwrk.SVG.underlyingNodeG.on("click", function(d, i) {
        angular.element($("#legend-table")).scope().$apply(function(scope) {
            var something = [];
            var filtered = ntwrk.nestedData.sub_disc.filter(function(d1, i1) {
                return parseInt(d1.key) == d.subd_id
            })

            filtered.forEach(function(d1, i1) {
                d1.values.children.forEach(function(d2, i2) {
                    something.push({
                        journal: d2.journal,
                        name: d2.title
                    })
                })
            })

            if (filtered.length > 0) {
                $(".legend").removeClass("default");
                $("#legend-disc-name").text(d.disc_name);
                $("#legend-subd-name").text(d.subd_name);
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
};



scimap01.Update = function() {
    dataprep.scimap01(scimap01);
    events.scimap01(scimap01);
}


dataprep.scimap01 = function(ntwrk) {
    var mappingJournal = journalMapping;

    var foundCount = 0;
    var notFoundCount = 0;
    var newData = [];
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        var match = mappingJournal.records.data.filter(function(d1, i1) {
            return d1.formal_name.toLowerCase() == d["journal"].toLowerCase()
        })

        match.forEach(function(d1, i1) {
            var newDataObj = new Object(d);
            newDataObj.subd_id = d1.subd_id;
            newData.push(newDataObj);
        })
        if (match.length > 0) {
            foundCount++;
        } else {
            notFoundCount++;
        }
    })
    console.log("Found: " + foundCount);
    console.log("Not Found: " + notFoundCount);
    ntwrk.filteredData.records.data = newData;
};
