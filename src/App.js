/**
 * @namespace AngularApp
 * @description  Application for binding CNS-WVF visualization to the DOM. Handles data loading, DOM binding, and script loading. 
 */
var app = angular.module('app', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'ngTable'])

/**
 * Flag to toggle verbose logging of visualization tasks and execution order.
 *
 * @type       {boolean}
 */
var verbose = false;

/**
 * Global object containing all Visualization scripts. Loaded from the {@link AngularApp.ngCnsVisual} directive, matching the {@link ngVisType} value.
 *
 * @type       {object}
 */
var visualizationFunctions = {};
var configs = {};
var events = {};
var dataprep = {};

app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
    var service = {
        mapDatasource: globalDatasourceMap,
        dataQueue: [],

        addToDataQueue: function(s) {
            if (this.dataQueue.indexOf(s) < 0) {
                this.dataQueue.push(s);
            }
        },
        addToDatasource: function(datasource, url) {
            this.mapDatasource[datasource] = {};
            this.mapDatasource[datasource].data = {};
            this.mapDatasource[datasource].url = url || datasource;
            this.mapDatasource[datasource].dataPrepared = false;
        },
        retrieveData: function(datasource, cb) {
            if (datasource) {
                if (verbose) console.log("Getting " + datasource + " data...");
                if (!this.mapDatasource[datasource]) {
                    service.addToDatasource(d);
                }
                $http({
                    method: 'GET',
                    url: this.mapDatasource[datasource].url
                }).then(function(res) {
                    if (verbose) console.log("Got " + datasource + " data!");
                    cb(res);
                });
            }
        },

        getData: function(datasource, args) {
            var args = args || {};
            var that = this;

            if (!service.mapDatasource[datasource]) {
                service.addToDatasource(datasource);
            }

            function broadcastUpdate(data) {
                if (verbose) console.log("Broadcasting: " + datasource + " updated.");
                $rootScope.$broadcast(datasource + '.update', data);
            }

            if (args.update) {
                this.retrieveData(datasource, function(res) {
                    that.mapDatasource[datasource].data = res.data;
                    broadcastUpdate(res.data);
                    that.mapDatasource[datasource].dataPrepared = true;
                    return res.data;
                });
            } else {
                if (that.mapDatasource[datasource].dataPrepared) {
                    broadcastUpdate(res.data);
                    return res.data;
                } else {
                    this.retrieveData(datasource, function(res) {
                        that.mapDatasource[datasource].data = res.data;
                        broadcastUpdate(res.data);
                        that.mapDatasource[datasource].dataPrepared = true;
                        return res.data;
                    });
                }
            }
        },

        getAllData: function() {
            var that = this;
            this.dataQueue.forEach(function(d, i) {
                that.getData(d);
            })
        }
    }
    Object.keys(service.mapDatasource).map(function(d, i) {
        service.addToDatasource(d, service.mapDatasource[d].url);
    });
    return service;
}])

app.controller('ngCnsVisual', ['$rootScope', '$scope', '$element', '$attrs', 'Data', function($rootScope, $scope, elem, attrs, Data) {
    $scope.attrs = attrs;
    $scope.elem = elem;
    $scope.Visualization = new Visualization($scope, elem, attrs);
    /**
     * @name AngularApp.ngCnsVisual.scope.attrs.ngIdentifier
     * @type       {string}
     * @description Required attribute. Unique identifier for each visualization instance. The directive uses this identifier as a reference and creates a global reference to the directive's scope , Visualization, and data.
     */

    window[attrs.ngIdentifier] = $scope;

    if (attrs.ngConfig) {
        var configObj = new Object();

        configObj.config = attrs.ngConfig;
        head.js(configObj)
        head.ready('config', function() {
            angular.element(elem).scope().configs = configs[attrs.ngIdentifier]
            resume();
        })
    } else {
        resume();
    }

    function resume() {
        /**
         * @namespace AngularApp.ngCnsVisual.scope.element
         * @type       {jqlite}
         * @description  DOM Element bound to this directive.
         */
        $scope.element = elem;
        /**
         * @namespace AngularApp.ngCnsVisual.scope.attrs
         * @type       {object}
         * @description  Attributes specified on the DOM element.
         */
        $scope.attrs = attrs;

        if (verbose) console.log("Visual pre link for: " + attrs.ngIdentifier);

        if (attrs.ngDataField) {
            Data.getData(attrs.ngDataField)
        }
        // Data.addToDataQueue(attrs.ngDataField);
        /**
         * @name AngularApp.ngCnsVisual.scope.attrs.ngComponentFor
         * @type       {string}
         * @description If this value is set on the element, creates a parent/child relationship with the instance matching the value of the attribute. The children will optionally follow procedures of the parent and may inherit the data as it exists in the parent data. 
         */
        if (attrs.ngComponentFor) {
            $scope.$watch(attrs.ngComponentFor + '.created', function() {
                window[attrs.ngComponentFor].Children.push(attrs.ngIdentifier);
                $scope.Parent = window[attrs.ngComponentFor];
            })
        } else {
            $rootScope.$broadcast(attrs.ngIdentifier + '.created')
        }



        /**
         * @name AngularApp.ngCnsVisual.scope.attrs.ngVisType
         * @type       {string}
         * @description Required attribute. Contains the exact name of the visualization to be loaded. These scripts live in /visualizations/PROJECTNAME/. The value given to this attribute must match this value exactly. The {@link AngularApp.ngCnsVisRunner} directive will use this value to look for visualization scripts to load. In the case that >1 directive instances use the same visualization, that script will be loaded only once and cloned when the Visualization class is created.
         */


        // if ($rootScope.visTypes.indexOf(attrs.ngVisType) == -1) {
        //     $rootScope.visTypes.push(attrs.ngVisType)
        // }
        // $rootScope.visBinders.push({
        //     name: attrs.ngIdentifier,
        //     type: attrs.ngVisType
        // })
        if (!visualizationFunctions[attrs.ngVisType]) {
            var obj = new Object();
            obj[attrs.ngVisType] = 'visuals/' + attrs.ngVisType + '/' + attrs.ngVisType + '/' + attrs.ngVisType + '.js'
            head.js(obj);
            head.ready(attrs.ngVisType, function(d) {
                $scope.VisScript = visualizationFunctions[attrs.ngVisType];
            })
        } else {
            $scope.VisScript = visualizationFunctions[attrs.ngVisType];
        }

        /**
         * @name AngularApp.ngCnsVisual.scope.switchDataSource
         * @type       {function}
         * @description  Unbinds all listeners for this directive and uses the ds parameter to create new listeners and aquire new data. Runs the {@link Visualization.Update} function upon retrieval. 
         * @param {string} ds Datasource to switch to. Should be a string containing an entry in {@link globalDatasourceMap}, a static file, or a URL with a JSON response. 
         */
        $scope.switchDatasource = function(ds) {
            $scope.$$listeners[attrs.ngDataField + '.update'] = [];
            attrs.ngDataField = ds;
            $scope.$$listeners[ds + '.update'] = [];
            $scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
                if (verbose) console.log("Updating: " + attrs.ngIdentifier);
                if (newVal !== oldVal) {
                    $scope.filteredData = newVal
                    $scope.setData(newVal);
                    $timeout(function() {
                        $scope.Update();
                    })
                }
            })
            Data.getData(attrs.ngDataField);
        };
    }
    if (verbose) console.log("Visual post link for: " + attrs.ngIdentifier);
    if (attrs.ngDataField) {
        if ($scope.$$listeners.hasOwnProperty(attrs.ngDataField) + '.update' && Data.mapDatasource[attrs.ngDataField]) {
            if (Data.mapDatasource[attrs.ngDataField].dataPrepared) {
                $scope.setData(Data.mapDatasource[attrs.ngDataField].data)
                $scope.RunVis();
            }
        }
        // $scope.$$listeners[attrs.ngDataField + '.update'] = null;
        $scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
            if (verbose) console.log("Updating: " + attrs.ngIdentifier);
            if (newVal !== oldVal) {
                $scope.filteredData = newVal;
                $scope.setData(newVal)
                $scope.RunVis();
            }
        })
    } else {
        if (!attrs.ngComponentFor) {
            if (attrs.ngConfig) {
                head.js(attrs.ngConfig);
            }
            $scope.RunVis();
        }
    }
}]);

app.controller('demoCtrl', ['$scope', 'Data', function($scope, Data) {
    $scope.networkVisualizations = [{
        name: "ForceNetwork",
        description: "Node/edge network with force."
    }]
    $scope.tableVisualizations = [{
        name: "HeatMap",
        description: "Blah"
    }, {
        name: "Bipartite",
        description: "Blah"
    }, {
        name: "D3ProportionalSymbol",
        description: "SVG Map with size coded geographic nodes."
    }]
    console.log($scope.tableVisualizations)
    $scope.selectedVis;
    $scope.changeView = function(name, type) {
        if (type == "network") {
            $scope.selectedVis = $scope.networkVisualizations.filter(function(d, i) {
                return d.name == name
            })[0]
        }
        if (type == "table") {
            $scope.selectedVis = $scope.tableVisualizations.filter(function(d, i) {
                return d.name == name
            })[0]
        }
    }
    $scope.getInclude = function() {
        if ($scope.selectedVis) {
            if ($scope.selectedVis.name) {
                return "partials/visualizations/" + $scope.selectedVis.name + ".html";
            }
        }
    }
}])

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
}])


angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
    visRunnerContext = angular.element(document);
    head.js(configFiles);
});
