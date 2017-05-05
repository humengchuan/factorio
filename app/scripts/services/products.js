'use strict';

/**
 * @ngdoc service
 * @name factorioApp.products
 * @description
 * # products
 * Constant in the factorioApp.
 */

angular.module('factorioApp')
    .service('productService', function($log) {
        
        var products = [];

        // 设置产品
        function setProduct(name, time, components, number, type) {
            if (getProduct(name) === -1) {
                products.push({
                    name: name,								// 产品的名称
                    time: time, 							// 产品的生产时间
                    _components: components, 				// 产品的组成
                    number: number || 1, 					// 产品的产量
                    // 产品的生产类型，1-冶炼类, 2-装配机类, 3-化工类, 4-采矿类
                    type: type || '2', 						
                });
            }
        }

        // 获取指定名称产品
        function getProduct (name, isWarn) {
        	for(var i = 0, length1 = products.length; i < length1; i++){
        		if(products[i].name === name){
        			return products[i];
        		}
        	}
    		if(isWarn)	{
    			$log.warn('未在产品列表找到' + name);
    		}
    		return -1;
        }
        // 初始化并解析产品组成的字符串
        function pharseComponents () {
        	products.forEach(function (element) {
        	  	element.components = [];
        	  	if(element._components){
        	  		var _components = element._components.split(',');
	        	  	_components.forEach( function(_component) {
	        	  		var _componentArr = _component.split('*');
	        	  		if(!_componentArr[1]) {
	        	  			$log.warn(element,'有数据问题');
	        	  		}
	        	  		element.components.push({
		        	  		name: _componentArr[1],
		        	  		number: Number(_componentArr[0])
		        	  	});
	        	  	});
        	  	}
        	});
        }

        // 计算产品的产率和需要率
        function initRate () {
        	products.forEach(function (product) {
        		var rate = 1 / product.time * product.speed;
        		product.productRate = rate * product.number;
        	});
        }

        // 初始化原件信息
        function initComponent(){
        	products.forEach(function (element) {
        		element.components.forEach( function(component) {
        			if(!component.name){
        				$log.warn(element,'数据有问题');
        				return;
        			}
        			var product = getProduct(component.name, true);
        			if(!product){
        				return;
        			}
        			component.needRate = element.productRate * component.number; 	// 原件的需求率=产品的生产率*原件的数量
        			component.needNum = component.needRate / product.productRate;	// 原件的需求数=原件的需求率/原件的生产率
        			component.type = product.type; 									// 初始化原件的类型
        		});
        	});
        }

        // 根据影响因素计产品的生产速度
        function initSpeed (effectsList) {
        	products.forEach(function (product) {
        		if(product.type === '1'){
        			switch (effectsList[2].type) {
        				case '1':
        					product.speed = 1;			//石炉的冶炼速度为1
        					break;
        				case '2':
        					product.speed = 2;			//钢炉的冶炼速度为2
        					break;
        				case '3':
        					product.speed = 2;			//电炉的冶炼速度为3
        					break;
        				default:
        					break;
        			}
        		}else if(product.type === '2'){
        			switch (effectsList[1].type) {
        				case '1':
        					product.speed = 0.5;		//组装机1型的速度为0.5
        					break;
        				case '2':
        					product.speed = 0.75;		//组装机2型的速度为0.75
        					break;
        				case '3':
        					product.speed = 1;		//组装机3型的速度为1
        					break;
        				default:
        					break;
        			}	
        		}else if(product.type === '4'){
        			switch (effectsList[0].type) {
        				case '1':
        					product.speed = 0.35; 		//热力采矿机的速度为0.35
        					break;
        				case '2':
        					product.speed = 0.5; 		//电力采矿机的速度为0.5
        					break;
        				default:
        					break;
        			}
        			product.speed = product.speed * (1 + effectsList[3].value / 100);	
        		}else{
        			product.speed = 1;					//其余计为1
        		}
        	});
        }

        // 结果集中是否包含物品，有则返回对应的下标，没有则返回-1
        function isContain(list, name) {
            if (!list || list.length === 0) {
                return -1;
            }
            for (var i = 0, length1 = list.length; i < length1; i++) {
                if (list[i].name === name) {
                    return i;
                }
            }
            return -1;
        }

        // 判断原件的生产类型
        // function () {
        // 	 body... 
        // }

        // 计算可装配物品所需机器的个数
        function calculateComponent(component, result, num) {
            if (component) {
                var i = isContain(result, component.name);
                var j = isContain(products, component.name);

                
                if (i > -1) {
                    result[i].number += (component.needNum * num);
                } else {
                    result.push({
                        name: component.name, 								// 产品名称
                        number: component.needNum * num, 					// 产品组装机所需要个数
                        type: component.type,								// 生产机器类型
                        speed: 1,											// 速度
                        components: j > -1 ? products[j].components : [],	// 原件		
                    });
                }
            }
        }


        // 计算产品的生产相关产品列表及个数
        function analysizeMNumber(product, number, relativeProducts) {
            // 将输入的产品放入结果集
            var result = relativeProducts || [];
	        if(!product || !number) {
	         	return result;
	        }
            if(!relativeProducts){
            	result.push({
            		name: product.name,
            		number: number,
            		type: product.type,
            		components: product.components,
            	});
            }
            if (product.components.length > 0) {
				for (var i = 0, length1 = product.components.length; i < length1; i++) {
	                calculateComponent(product.components[i], result, number);
	                analysizeMNumber(getProduct(product.components[i].name, true), product.components[i].needNum * number, result);
	            }
            }          

            return result;
        }
        // 计算结果集中的等级
        function analysizeLevel(product, resultList) {
        	var index = isContain(resultList, product.name);
        	if(index > -1){
        		if(resultList[index].components.length === 0){
        			resultList[index].level = 0;
        		}else{
        			var level = 0;
        			resultList[index].components.forEach( function(element) {
        				var l = analysizeLevel(getProduct(element.name), resultList);
        				if ( l >= level){
        					level = l;
        				}
        			});
        			resultList[index].level = level + 1; // 物品等级为所原件等最高级加1
        		}
        		return resultList[index].level;
        	}
        }



        // 加一层封装，防止直接调用内部的接口函数
        function analysizeProduct(product, number) {
        	var resultList = analysizeMNumber(product, number);		// 分析产品原件的制造机的数量
        	analysizeLevel(product, resultList);					// 分析产品原件的等级
        	return resultList;
        }

        // 分析产品列表
		function analysizeProducts (productList, effectsList) {
        	// 初始化生产产品机器的速率
			initSpeed(effectsList);
	    	// 初始化产品产率和需求率
	    	initRate();
	    	// 初始化原件的信息
	    	initComponent();
        	var resultList = [];
        	productList.forEach(function (element) {
        		var result = {};
        		result.name = element.product.name; // 结果名称
        		result.list = analysizeProduct(element.product, element.number);
        		resultList.push(result);
        	});
        	analysizeResultList(resultList); // 对结果进行汇总
        	return resultList; 
        }

        // 结果列表分析
        function analysizeResultList (resultList) {
        	var totalResult = {};
        	totalResult.name = '总计';
        	totalResult.list = [];
        	resultList.forEach(function(result) {
        		result.list.forEach(function(item) {
        			item.number = item.number.toFixed(4) - 0;
        			var i = isContain(totalResult.list, item.name);
        			if(i > -1){
        				totalResult.list[i].number += item.number;
        			}else{
        				// 不能将item直接push进去，这样会影响单项计算结果
        				var obj = {};
        				for (var variable in item) {
        					obj[variable] = item[variable];
        				}
        				totalResult.list.push(obj);
        			}
        		});
        	});
        	resultList.push(totalResult);
        }


        // 初化产品数据
        function initData(){

        	// 产品的生产类型，1-冶炼类, 2-装配机类, 3-化工类, 4-采矿类, 5-采集类, o-其他分类
        	// 来源为非组装机的产品
        	// type-1 治炼类
	        setProduct('铁板', 				3.5, 	'1*铁矿'								, 1 , 	'1');
	    	setProduct('铜板', 				3.5, 	'1*铜矿'								, 1 , 	'1');
	    	setProduct('钢材', 				17.5, 	'5*铁板'		 						, 1 , 	'1');
	       	setProduct('石砖', 				3.5, 	'2*石头'						 		, 1 ,	'1');
	    	
	    	// type-7 抽油类 生产自抽油机
	    	setProduct('原油', 				1, 		''		 							, 1 , 	'7');

	    	// type-6 炼油类，生产自炼油厂
	    	setProduct('重油', 				1, 		''		 							, 1 , 	'6');
	    	setProduct('轻油', 				1, 		''		 							, 1 , 	'6');
	    	setProduct('石油气', 			1, 		''		 							, 1 , 	'6');

	    	// type-3 化工类，生产自化工厂
	    	setProduct('硫酸', 				1, 		'5*硫磺,1*铁板,100*水'				, 50 , 	'3');
	    	setProduct('硫磺', 				1, 		'30*水,30*石油气'					, 2 , 	'3');
	    	setProduct('润滑油', 			1, 		'10*重油'		 					, 10 , 	'3');
	    	setProduct('电池', 				5, 		'1*铁板,1*铜板,20*硫酸'		 		, 1 , 	'3');
	    	setProduct('塑料', 				1, 		'1*煤矿,20*石油气'		 			, 2 , 	'3');
	    	setProduct('炸药', 				5, 		'1*硫磺,1*煤矿,10*水'					, 1 , 	'3');
	    	setProduct('固体燃料', 			1, 		''		 							, 1 , 	'3');
	    	
	    	// type-4 采矿类
	    	setProduct('石头', 				1, 		''									, 1 , 	'4');
	    	setProduct('铁矿', 				1, 		''		 							, 1 , 	'4');
	    	setProduct('铜矿', 				1, 		''		 							, 1 , 	'4');
	    	setProduct('煤矿', 				1, 		''		 							, 1 , 	'4');

	    	
	    	// type-5 采集类
	    	setProduct('原木', 				1, 		''									, 1 , 	'5');

	    	// type-o 暂未分类
	    	setProduct('水', 				1, 		''		 							, 1 , 	'o');
	    	setProduct('铀-235', 			1, 		''		 							, 1 , 	'o');
	    	setProduct('铀-238', 			1, 		''		 							, 1 , 	'o');
	    	

	    	// 来源为组装机的产品
	        setProduct('组装机1型', 			0.5, 	'2*电路板,5*铁齿轮,9*铁板'						);
	       	setProduct('组装机2型', 			0.5, 	'9*铁板,3*电路板,5*铁齿轮,1*组装机1型'		 		);
	        setProduct('灯', 				0.5, 	'1*电路板,3*铁棒, 1*铁板'							);
	        setProduct('石墙', 				0.5, 	'5*石砖'											);
	        setProduct('填海材料', 			0.5, 	'20*石头'								 		);
	        setProduct('机枪炮塔', 			8, 		'10*铁齿轮,10*铜板, 20*铁板'						);
	    	setProduct('手枪', 				5, 		'5*铜板,5*铁板'									);
	        setProduct('冲锋枪', 			10, 	'10*铁齿轮,5*铜板,10*铁板'						);
	        setProduct('霰弹枪', 			10, 	'15*铁板,5*铁齿轮,10*铜板,5*木板'					);
	        setProduct('制式霰弹', 			3, 		'2*铜板,2*铁板'									);
	        setProduct('基础地下传送带', 		1, 		'10*铁板,5*基础传送带'			 	, 2 		);
	        setProduct('基础分流器', 			1, 		'5*电路板,5*铁板,4*基础传送带'		 				);
	        setProduct('钢制箱', 			0.5, 	'8*钢材'		 							 		);
	        setProduct('钢斧镐', 			0.5, 	'5*钢材,2*铁棒'							 		);
	        setProduct('高速机械臂', 			0.5, 	'2*电路板,2*铁板,1*电力机械臂'		 				);
	       	setProduct('筛选机械臂', 			0.5, 	'1*高速机械臂,4*电路板'					 		);
	        setProduct('加长机械臂', 			0.5, 	'1*铁齿轮,1*铁板, 1*电力机械臂'					);
	       	setProduct('重型护甲', 			8, 		'100*铜板,50*钢材'						 		);
	       	setProduct('木制箱', 			0.5, 	'4*木板'									 		);
	       	setProduct('铁制箱', 			0.5, 	'8*铁板'									 		);
	       	setProduct('基础传送带', 			0.5, 	'1*铁板,1*铁齿轮'						, 2  		);
	       	setProduct('热能机械臂', 			0.5, 	'1*铁板,1*铁齿轮'							 		);
	       	setProduct('电力机械臂', 			0.5, 	'1*电路板,1*铁齿轮,1*铁板'				 		);
	       	setProduct('小型电线杆', 			0.5, 	'2*木板,2*铜线'						, 2  		);
	       	setProduct('管道', 				0.5, 	'1*铁板'					 						);
	       	setProduct('地下管道', 			0.5, 	'10*管道,5*铁板'				 		, 2			);
	       	setProduct('铁斧镐', 			0.5, 	'3*铁板,2*铁棒'							 		);
	       	setProduct('修理包', 			0.5, 	'2*电路板,2*铁齿轮'						 		);
	       	setProduct('锅炉', 				0.5, 	'1*石炉,4*管道'							 		);
	       	setProduct('蒸汽机', 			0.5, 	'8*铁齿轮,5*管道,10*铁板'					 		);
	       	setProduct('热能采矿机', 			2, 		'3*铁齿轮,1*石炉,3*铁板'					 		);
	       	setProduct('电力采矿机', 			2, 		'3*电路板,5*铁齿轮,10*铁板'				 		);
	       	setProduct('供水泵', 			0.5, 	'2*电路板,1*管道,1*铁齿轮'				 		);
	       	setProduct('石炉', 				0.5, 	'5*石头'				 							);
	    	setProduct('钢炉', 				3, 		'6*钢材,10*石砖'									);
	       	setProduct('研究中心', 			5, 		'10*电路板,10*铁齿轮,4*基础传送带'					);
	    	setProduct('木板', 				0.5, 	'1*原木'											);
	       	setProduct('铜线', 				0.5, 	'1*铜板'								, 2			);
	    	setProduct('铁棒', 				0.5, 	'2*铁板'								, 2			);
	    	setProduct('铁齿轮', 			0.5, 	'2*铁板'											);
	    	setProduct('科机包1', 			5, 		'1*铜板,1*铁齿轮'									);
	    	setProduct('科机包2', 			6, 		'1*电力机械臂,1*基础传送带'						);
	    	setProduct('科机包3',			12, 	'1*集成电路,1*内燃机,1*组装机1型'					);
	    	setProduct('生产科技包',			14, 	'1*抽油机,1*电动机,1*电炉'				, 2		);
	    	setProduct('尖端科技包',			14, 	'1*电池,3*处理器,1*速度插件1,30*铜线'		, 2		);
	    	setProduct('制式弹匣', 			1, 		'4*铁板'											);
	    	setProduct('轻型护甲', 			3, 		'40*铁板'										);
	    	setProduct('雷达', 				0.5, 	'5*电路板,5*铁齿轮,10*铁板'						);
	    	setProduct('储液罐', 			3, 		'20*铁板,5*钢材'									);
	    	setProduct('空桶', 				1, 		'1*钢材'											);
	    	setProduct('穿甲弹匣', 			3, 		'1*制式弹匣,1*钢材,5*铜板'						);
	    	setProduct('制式手雷', 			8, 		'5*铁板,10*煤矿'									);
	    	setProduct('军备科技包', 			10, 	'1*穿甲弹匣,1*制式手雷,1*机枪炮塔'		, 2			);
	    	setProduct('夜视模块', 			10, 	'5*集成电路,10*钢材'								);
	    	setProduct('电池组模块', 			10, 	'5*电池,10*钢材'									);
	    	setProduct('速度插件1', 			15, 	'5*集成电路,5*电路板'								);
	    	setProduct('速度插件2', 			30, 	'4*速度插件1,5*集成电路,5*电路板'					);
			setProduct('速度插件3', 			60, 	'5*速度插件2,5*集成电路,5*电路板'					);
	    	setProduct('产能插件1', 			15, 	'5*集成电路,5*电路板'								);
	    	setProduct('产能插件2', 			30, 	'4*产能插件1,5*集成电路,5*电路板'					);
	    	setProduct('产能插件3', 			60, 	'5*产能插件2,5*集成电路,5*电路板'					);
	    	setProduct('节能插件1', 			15, 	'5*集成电路,5*电路板'								);
	    	setProduct('节能插件2', 			30, 	'4*节能插件1,5*集成电路,5*电路板'					);
	    	setProduct('节能插件3', 			60, 	'5*节能插件2,5*集成电路,5*电路板'					);
	    	setProduct('直线铁轨', 			0.5, 	'1*石头,1*铁棒,1*钢材'				, 2			);
	    	setProduct('内燃机车', 			0.5, 	'20*内燃机,10*电路板,30*钢材'						);
	    	setProduct('货运车厢', 			0.5, 	'10*铁齿轮,20*铁板,20*钢材'						);
	    	setProduct('液罐车厢', 			1.5, 	'10*铁齿轮,16*钢材,8*管道,3*储液罐'				);
	    	setProduct('铁路信号灯', 			0.5, 	'1*电路板,5*铁板'									);
	    	setProduct('铁路联锁信号灯', 		0.5, 	'1*电路板,5*铁板'									);
	    	setProduct('机器人指令平台', 		15, 	'45*钢材,45*铁齿轮,45*集成电路'					);
	    	setProduct('按需供货箱',			0.5, 	'1*钢制箱,3*电路板,1*集成电路'						);
	    	setProduct('建设机器人',			0.5, 	'1*机器人构架,2*电路板'							);
	    	setProduct('物流机器人',			0.5, 	'1*机器人构架,2*集成电路'							);
	    	setProduct('抽油机',				10, 	'5*钢材,10*铁齿轮,5*电路板,10*管道'				);
	    	setProduct('炼油厂',				20, 	'15*钢材,10*铁齿轮,10*电路板,10*管道'				);
	    	setProduct('化工厂',				10, 	'5*钢材,5*铁齿轮,5*电路板,5*管道'					);
	    	setProduct('汽车',				0.5, 	'8*内燃机,20*铁板,5*钢材'							);
	    	setProduct('模块装甲',			15, 	'30*集成电路,50*钢材'								);
	    	setProduct('太阳能模块',			10, 	'5*太阳能板,1*集成电路,5*钢材'						);
	    	setProduct('中型电线杆',			0.5, 	'2*钢材,2*铜板'									);
	    	setProduct('运程输电塔',			0.5, 	'5*钢材,5*铜板'									);
	    	setProduct('蓄电器',				10, 	'2*铁板,5*电池'									);
	    	setProduct('机器人构架',			20, 	'1*电动机,2*电池,1*钢材,3*电路板'					);
	    	setProduct('集装机械臂',			0.5, 	'15*铁齿轮,15*电路板,1*集成电路,1*高速机械臂'		);
	    	setProduct('集装筛选机械臂',		0.5, 	'1*集装机械臂,5*电路板'							);
	    	setProduct('电路板', 			0.5, 	'1*铁板,3*铜线'									);
	    	setProduct('集成电路',			6, 		'2*电路板,2*塑料,4*铜线'							);
	    	setProduct('处理器',				10, 	'20*电路板,2*集成电路,5*硫酸'						);
	    	setProduct('高速传送带',			0.5, 	'5*铁齿轮,1*基础传送带'							);
	    	setProduct('高速地下传送带',		0.5, 	'20*铁齿轮,2*基础地下传送带'				, 2		);
	    	setProduct('高速分流器',			2, 		'1*基础分流器,10*铁齿轮,1*电路板'					);
	    	setProduct('太阳能板',			10, 	'5*钢材,15*电路板,5*铜板'							);
	    	setProduct('混凝土',				10, 	'5*石砖,1*铁矿,100*水'					, 10	);
	    	setProduct('标识混凝土',			0.25, 	'10*混凝土'								, 10	);
	    	setProduct('机器人指令模块',		10, 	'10*集成电路,40*铁齿轮,20*钢材,45*电池'			);
	    	setProduct('外骨骼指令模块',		10, 	'10*处理器,30*电动机,20*钢材'						);
	    	setProduct('广域配电站',			0.5, 	'10*钢材,5*集成电路,5*铜板'						);
	    	setProduct('电池组模块MK2',		10, 	'10*电池组模块,20*处理器'							);
	    	setProduct('能量装甲',			20, 	'40*处理器,20*电动机,40*钢材'						);
	    	setProduct('电炉',				5, 		'10*钢材,5*集成电路,10*石砖'						);
	    	setProduct('核反应堆',			4, 		'500*混凝土,500*钢材,500*集成电路,500*铜板'		);
	    	setProduct('离心机',				4, 		'100*混凝土,50*钢材,100*集成电路,100*铁齿轮'		);
	    	setProduct('铀燃料棒',			10, 	'10*铁板,1*铀-235,19*铀-238'				, 10	);
	    	setProduct('换热器',				0.5, 	'10*钢材,100*铜板,10*管道'						);
	    	setProduct('热管',				0.5, 	'10*钢材,20*铜板'								);
	    	setProduct('汽轮机',				0.5, 	'50*铁齿轮,50*铜板,20*管道'						);
	    	setProduct('火焰喷射器',			10, 	'5*钢材,10*铁齿轮'								);
	    	setProduct('油料储罐',			6, 		'5*钢材,50*轻油,50*重油'							);
	    	setProduct('火焰炮塔',			20, 	'30*钢材,15*铁齿轮,10*管道,5*内燃机'				);
	    	setProduct('剧毒胶囊',			8, 		'3*钢材,3*电路板,10*煤矿'							);
	    	setProduct('减速胶囊',			8, 		'2*钢材,2*电路板,5*煤矿'							);
	    	setProduct('冲锋霰弹枪',			10, 	'15*钢材,5*铁齿轮,10*铜板,10*木板'					);
	    	setProduct('地雷',				5, 		'1*钢材,2*炸药'							, 4		);
	    	setProduct('爆破火箭弹',			8, 		'1*火箭弹,2*炸药'									);
	    	setProduct('激光防御模块',		10, 	'1*处理器,5*钢材,5*激光炮塔'						);
	    	setProduct('放电防御模块',		10, 	'5*处理器,20*钢材,10*激光炮塔'						);
	    	setProduct('放电防御发射器',		0.5, 	'1*电路板'										);
	    	setProduct('火箭筒',				10, 	'5*铁板,5*铁齿轮,5*电路板'						);
	    	setProduct('火箭弹',				8,	 	'1*电路板,1*炸药,2*铁板'							);
	    	setProduct('防御机器人胶囊',		8,	 	'1*穿甲弹匣,2*电路板,3*铁齿轮'						);
	    	setProduct('掩护机器人胶囊',		15,	 	'4*防御机器人胶囊,3*集成电路'						);
	    	setProduct('能量盾模块',			10,	 	'5*集成电路,10*钢材'								);
	    	setProduct('能量盾模块MK2',		10,	 	'10*能量盾模块,10*处理器'							);
	    	setProduct('激光炮塔',			20,	 	'20*钢材,20*电路板,12*电池'						);
	    	setProduct('穿甲霰弹',			8,	 	'2*制式霰弹,5*铜板,2*钢材'						);
	    	setProduct('集束手雷',			8,	 	'7*制式手雷,5*炸药,5*钢材'						);
	    	setProduct('聚变堆模块',			10,	 	'250*处理器'										);
	    	setProduct('机器人指令模块MK2',	20,	 	'5*机器人指令模块,100*处理器'						);
	    	setProduct('进攻机器人胶囊',		15,	 	'4*掩护机器人胶囊,1*速度插件1'						);
	    	setProduct('能量装甲MK2',		25,	 	'5*节能插件3,5*速度插件3,40*处理器,40*钢材'			);
	    	setProduct('贫铀弹匣',			10,	 	'1*穿甲弹匣,1*铀-238'								);
	    	setProduct('贫铀贫铀炮弹',		12,	 	'1*制式炮弹,1*铀-238'								);
	    	setProduct('爆破贫铀炮弹',		12,	 	'1*爆破炮弹,1*铀-238'								);
	    	setProduct('火箭发射井',			30,	 	'1000*钢材,1000*混凝土,100*管道,200*处理器,200*电动机');
	    	setProduct('轻质框架',			30,	 	'10*钢材,5*铜板,5*塑料'							);
	    	setProduct('火箭燃料',			30,	 	'10*固体燃料'									);
	    	setProduct('火箭控制器',			30,	 	'1*处理器,1*速度插件1'							);
	    	setProduct('火箭组件',			3,	 	'10*轻质框架,10*火箭燃料,10*火箭控制器'				);
	    	setProduct('卫星',				3,	 	'100*轻质框架,100*太阳能板,100*蓄电器,5*雷达,100*处理器,50*火箭燃料');
	    	setProduct('原子弹',				50,	 	'20*处理器,10*炸药,30*铀-235'						);
	    	setProduct('坦克',				0.5,	'32*内燃机,50*钢材,15*铁齿轮,10*集成电路'			);
	    	setProduct('制式炮弹',			8,		'2*钢材,2*塑料,1*炸药'							);
	    	setProduct('爆破炮弹',			8,		'2*钢材,2*塑料,2*炸药'							);
	    	setProduct('插件效果分享塔',		15,		'20*电路板,20*集成电路,10*钢材,10*铜线'			);
	    	setProduct('内燃机',				10,		'1*钢材,1*铁齿轮,2*管道'							);
	    	setProduct('电动机',				10,		'1*内燃机,2*电路板,15*润滑油'						);
        }
        
        // 获得科技产品列表
        function getScienceProducts() {
        	var products = ['科机包1','科机包2','科机包3','军备科技包','生产科技包','尖端科技包'];
        	var resultList = [];
        	products.forEach(function(name){
				resultList.push(getProduct(name));
        	});
        	return resultList;
        }
        
        // 获得武器产品列表
        function getWeaponProducts() {
        	var products = ['手枪','冲锋枪','霰弹枪','制式弹匣','穿甲弹匣','穿甲霰弹'];
        	var resultList = [];
        	products.forEach(function(name){
				resultList.push(getProduct(name));
        	});
        	return resultList;
        }
       	// 初化产品数据
       	initData();

    	// 解析产品原件的组成，将字符串信息，解析为数组
    	pharseComponents();

        return {
        	products: products, 						// 产品列表
        	analysizeProductList: analysizeProducts,	// 分析列品列表生产机器的数量
        	getScienceProducts: getScienceProducts,		// 获取科技类的产品
        	getWeaponProducts: getWeaponProducts
        };
    });
