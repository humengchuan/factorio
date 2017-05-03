'use strict';

/**
 * @ngdoc filter
 * @name factorioApp.filter:machineType
 * @function
 * @description
 * # machineType
 * Filter in the factorioApp.
 */
angular.module('factorioApp')
    .filter('machineType', function() {
        return function(input, effectsList) {
            var result = '';
            switch (input) {
                case '1':
                    result = '矿炉';
                    switch (effectsList[2].type) {
                        case '1':
                            result = '石炉';
                            break;
                        case '2':
                            result = '钢炉';
                            break;
                        case '3':
                            result = '电炉';
                            break;
                        default:
                            break;
                    }
                    break;
                case '2':
                    result = '组装机';
                    switch (effectsList[1].type) {
                        case '1':
                            result = '组装机1型';
                            break;
                        case '2':
                            result = '组装机2型';
                            break;
                        case '3':
                            result = '组装机3型';
                            break;
                        default:
                            break;
                    }
                    break;
                case '3':
                    result = '化工厂';
                    break;
                case '4':
                    result = '采矿机';
                    switch (effectsList[0].type) {
                        case '1':
                            result = '热力采矿机';
                            break;
                        case '2':
                            result = '电力采矿机';
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            return result;
        };
    });
