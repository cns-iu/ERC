/** @global 
  * @description Maps pretty names for datasource URLs. Mapped from (ng-data-field) 
  * @type {Object} */
var globalDatasourceMap = {
    one: {
        url: 'data/sampleData.json'
    },
    sampleGeoData: {
        url: 'data/sampleGeoData.json'
    },
    newt: {
    	url: 'data/newt-coauthor.json'
    },
    assist: {
    	url: 'data/assist-coauthor.json'
    },
    nanhub: {
        url: 'https://dev.nanohub.org/citations/curate/download/',
        params: {
            hash: 'QUERYSTRING'
        }
    }
}