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
}])