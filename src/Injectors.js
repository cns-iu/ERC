angular.module('app').requires.push('ngTable');

app.controller('tableCtrl', ['$scope', function($scope) {
    $scope.tableData = [];
    $scope.addTableData = function(data) {
        $scope.tableData = $scope.tableData.concat(data);
        $scope.sortTableData("last_name");
    } 

    $scope.sortTableData = function(val) {
            $scope.tableData = $scope.tableData.sort(function(a, b) {
                return a[val] - b[val]
            })
    }
    $scope.clearTableData = function() {
            $scope.tableData = [];
    }
}]).directive('stRatio', function() {
    return {
        link: function(scope, element, attr) {
            var ratio = +(attr.stRatio);

            element.css('width', ratio + '%');

        }
    };
})


function mergeDupes(data, authorID, duplicateOf) {

    // console.log(data);
    // var oldAuth = data.authors.data.filter(function(d, i) { return d.id == authorID})[0];
    // var newAuth = data.authors.data.filter(function(d, i) { return d.id == duplicateOf})[0];
    // // console.log('[' + oldAuth + '] became [' + newAuth + ']');

    data.records.data.forEach(function(d, i) {
        d.author_ids.forEach(function(d1, i1) {
            if (d1 == authorID) {
                d.author_ids.splice(i1, 1);
                d.author_ids.push(duplicateOf);
            }
        })
    })
    data.authors.data.forEach(function(d, i) {
        if(d.id == authorID) {
            data.authors.data.splice(i, 1);
        }
    });

    
    return data;
}


function mergeDupeGroup(data) {
        //TODO: Remove this after demo. 
    mergeDupes(data, '81b66fdc80446107595807ee3257cc09', 'c8d1da8ffe2665ac7301b14a64269f2a');
    mergeDupes(data, '6f5c17a4ad2ed6312a3458aba63c9fab', 'c8d1da8ffe2665ac7301b14a64269f2a');
    mergeDupes(data, 'b0da1fdff155542bfa72e6e224309dbf', 'c8d1da8ffe2665ac7301b14a64269f2a');
    mergeDupes(data, '8998cdf96cbba52d8aadc7c471eb106b', 'c8d1da8ffe2665ac7301b14a64269f2a');
    mergeDupes(data, 'c4f6e4ba3ad26620cc19e470154644a4', '86d041990b8e8bba24ef9a7b7bfe7f26');
    mergeDupes(data, '9537373b32efa3c8e258f854ab590d6c', 'e04fa2cbe343dc97233658b47659046e');
    mergeDupes(data, 'e5608c5fd007553e3ad3aa478132f41b', '3e2b1055a9abfb55b984849d1f9be185');
    mergeDupes(data, '0c821f675f132d790b3f25e79da739a7', '45caebe9efe411acce49cc656788fd9b');
    mergeDupes(data, 'c2eaa4c670cd4c1c537b2a2ae4fbeb5d', '4ad9f20f42e2605988f31a145ccb3c71');
    mergeDupes(data, 'f0430316502eda28f8d28ab8c104ea74', '69b668ecfd9e39ffead07a0c5a4da931');
    mergeDupes(data, '2ac43aa43bf473f9a9c09b4b608619d3', '93d5a18ad45f545326d1408ddb61697f');
    mergeDupes(data, '250b6b53a0f3ca2cbb47d47af0a8e754', 'c57248bca141e0abb9d5ccd3b4ab5e95');
    mergeDupes(data, '230412ffdd194ddac551180c35f7d08a', '239a57d0121a321d5b0d30887505047f');
}


function processAuthorSpec(data) {
    
    if (location.search == "?manualMerge") {
        mergeDupeGroup(data);
    } else {
        console.log("Manual merge is off");
    }


    var nodes = data.authors.data;
    var edges = [];
    nodes.forEach(function(d, i) {
        d.idd = d.id;
        d.id = i;
    })

    data.records.data.forEach(function(record, recordIndex) {
        var s = record.author_ids[0]
        var t;
        if (record.author_ids.length > 1) {
            for (var i = 1; i < record.author_ids.length; i++) {
                    var t = record.author_ids[i];
                    var filteredEdge = edges.filter(function(d1, i1) {
                        return (d1.s == s && d1.t == t) || (d1.s == t && d1.t == s)
                    })

                    if (filteredEdge.length > 0) {
                        filteredEdge[0].coauthoredWorks.push(record);
                    } else {
                        edges.push({
                            s: s,
                            t: t,
                            coauthoredWorks: [record]
                        })
                    }
            }
        }
    })

    edges.forEach(function(d, i) {
        d.source = nodes.filter(function(d1, i1) { return d1.idd == d.s})[0].id;
        d.target = nodes.filter(function(d1, i1) { return d1.idd == d.t})[0].id;
        d.weight = d.coauthoredWorks.length;
    })

    nodes.forEach(function(author, authorIndex) {
        var papers = data.records.data.filter(function(d, i) {
            return d.author_ids.indexOf(author.idd) > -1;
        });
        author.numPapers = papers.length;
        author.firstYearPublished = d3.min(papers, function(d, i) {
            return d.year;
        })

    });

    var res = {
        nodes: {
            data: nodes,
            schema: data.authors.schema
        },
        edges: {
            data: edges,
            schema: [{
                name: "source",
                type: "numeric"
            }, {
                name: "target",
                type: "numeric"
            }, {
                name: "weight",
                type: "numeric"
            }]
        }
    }
    res.nodes.schema.push({
        name: "numPapers",
        type: "numeric"
    }, {
        name: "id",
        type: "numeric"
    })
    return res;
}