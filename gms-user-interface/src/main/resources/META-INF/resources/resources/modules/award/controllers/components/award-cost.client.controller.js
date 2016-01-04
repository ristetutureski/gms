'use strict';

angular.module('award').controller('Award.CostController', ['$scope', '$stateParams', '$translate'
    , 'UtilService', 'ObjectService', 'Helper.UiGridService', 'ConfigService', 'Object.CostService', 'Helper.ObjectBrowserService'
    , function ($scope, $stateParams, $translate, Util, ObjectService, HelperUiGridService, ConfigService, ObjectCostService, HelperObjectBrowserService) {

        var gridHelper = new HelperUiGridService.Grid({scope: $scope});

        var promiseConfig = ConfigService.getComponentConfig("award", "cost").then(function (config) {
            gridHelper.setColumnDefs(config);
            gridHelper.setBasicOptions(config);
            gridHelper.disableGridScrolling(config);

            for (var i = 0; i < $scope.config.columnDefs.length; i++) {
                if ("name" == $scope.config.columnDefs[i].name) {
                    $scope.gridOptions.columnDefs[i].cellTemplate = "<a href='#' ng-click='grid.appScope.onClickObjLink($event, row.entity)'>{{row.entity.acm$_formName}}</a>";
                } else if ("tally" == $scope.config.columnDefs[i].name) {
                    $scope.gridOptions.columnDefs[i].field = "acm$_costs";
                }
            }
            return config;
        });

        var currentObjectId = HelperObjectBrowserService.getCurrentObjectId();
        if (Util.goodPositive(currentObjectId, false)) {
            ObjectCostService.queryCostsheets(ObjectService.ObjectTypes.CASE_FILE, currentObjectId).then(
                function (costsheets) {
                    promiseConfig.then(function (config) {
                        for (var i = 0; i < costsheets.length; i++) {
                            costsheets[i].acm$_formName = $translate.instant("award.comp.cost.formNamePrefix") + " " + Util.goodValue(costsheets[i].parentNumber);
                            costsheets[i].acm$_costs = _.reduce(Util.goodArray(costsheets[i].costs), function (total, n) {
                                return total + Util.goodValue(n.value, 0);
                            }, 0);
                        }

                        $scope.gridOptions = $scope.gridOptions || {};
                        $scope.gridOptions.data = costsheets;
                        $scope.gridOptions.totalItems = Util.goodValue(costsheets.length, 0);
                       // gridHelper.hidePagingControlsIfAllDataShown($scope.gridOptions.totalItems);
                        return config;
                    });
                    return costsheets;
                }
            );
        }


        $scope.onClickObjLink = function (event, rowEntity) {
            event.preventDefault();
            gridHelper.showObject(ObjectService.ObjectTypes.COSTSHEET, Util.goodMapValue(rowEntity, "id", 0));
        };
    }
]);