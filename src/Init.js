//Head loads scripts in parellel, but executes them in order.



/** @global 
    @description If set to true, will provide details on visualization binding. */
var verbose = false;
(function() {
    'use strict';
    head.js({
            "style.css": "css/style.css"
        }, {
            "svg.css": "css/svg.css"
        }, {
            "roboto": "css/fonts/roboto.css"
        }, {
            "opensans": "css/fonts/opensans.css"
        }, {
            "jQuery": "lib/jquery-1.11.2.min.js"
        }, {
            "bootstrap.min.js": "lib/bootstrap.min.js"
        }, {
            "d3.v3.min.js": "lib/d3.v3.min.js"
        }, {
            "head.js": "lib/head.js"
        }, {
            "immutable.js": "lib/immutable.js"
        }, {
            "jquery-1.11.2.min.js": "lib/jquery-1.11.2.min.js"
        }, {
            "json2.js": "lib/json2.js"
        }, {
            "matchMedia": "lib/fills/matchMedia.js"
        }, {
            "matchMediaListener": "lib/fills/matchMedia.addListener.js"
        }, {
            "DatasourceMap.js": "src/DatasourceMap.js"
        }, {
            "Utilities.js": "src/Utilities.js"
        }, {
            "journalMapping.js": "data/journalMapping.js"
        },
        //Nothing goes after this script
        //configs go down there
        {
            "Visualization.js": "src/Visualization.js"
        });
}).call(this);


//configs scripts go here
var configFiles = []

head.ready('Visualization.js', function() {
    $(document).ready(function() {
        head.js(
            {'ng-table.min.js': 'lib/angular/ng-table.min.js'},
            {'angular-material.css': 'lib/angular/angular-material.css'},
            {'docs.css': 'lib/angular/docs.css'},
            {'angular-animate.min.js': 'lib/angular/angular-animate.min.js'},
            {'angular-route.min.js': 'lib/angular/angular-route.min.js'},
            {'angular-aria.min.js': 'lib/angular/angular-aria.min.js'},
            {'angular-messages.min.js': 'lib/angular/angular-messages.min.js'},
            {'svg-assets-cache.js': 'lib/angular/svg-assets-cache.js'},
            {'angular-material.js': 'lib/angular/angular-material.js'},
            {'App.js': 'src/App.js'},
            {'ViewControllers': 'src/ViewControllers.js'}
        );
    });
});