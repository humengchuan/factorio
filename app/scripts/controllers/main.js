'use strict';

/**
 * @ngdoc function
 * @name factorioApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the factorioApp
 */
// sp1 copper plate iron gear wheel
// sp2 inserter transport belt copper cable
angular.module('factorioApp')
    .controller('MainCtrl', function(productService) {
        var vm = this;

        vm.products = productService.getScienceProducts();

        vm.effectsList = [								// 影响因素列表
        	{name: '采矿机', type: '1'},
        	{name: '组装机', type: '1'},
        	{name: '冶炼炉', type: '1'},
        ]; 				

        vm.productList = []; 							// 所选的产品列表
        vm.productType = 'scienceProducts'; 			// 产品列表类型
        vm.miningEffect = vm.effectsList[0];			// 采矿影响
        vm.assemblingEffect = vm.effectsList[1];		// 组装影响
        vm.smeltEffect = vm.effectsList[2];				// 冶炼影响

        vm.changeProductList = function () {
        	switch (vm.productType) {
        		case 'scienceProducts':
        			vm.products = productService.getScienceProducts();
        			break;
        		case 'allProducts':
        			vm.products = productService.products;
        			break;
        		default:
        			vm.products = productService.products;
        			break;
        	}
        };
        // 添加产品
        vm.addProduct = function(product, number) {
            if (product && product.name) {
                vm.productList.push({
                    product: product,
                    number: number
                });
            }

        };
        // 删除产品
        vm.removeProduct = function(item) {
            vm.productList.forEach(function(element, index) {
                if (element.product.name === item.product.name) {
                    vm.productList.splice(index, 1);
                }
            });
        };
        // 产品加一
        vm.plus = function (item) {
        	item.number += 1;
        };

        vm.minus = function (item) {
        	if(item.number > 1){
				item.number -= 1;
        	}
        };

        // 分析
        vm.analysize = function() {
            vm.resultList = productService.analysizeProductList(vm.productList, vm.effectsList);
            console.log(vm.products);
        };



    });
