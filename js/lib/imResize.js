/* Image Resize */
(function ( $ , undefined  ) {

		/* Методы */
		var imresize_methods = {
			/* Инициализация */
			init : function ( options ) {
			
				var options = $.extend( {
					
					/* рамка */
					outer : '',
					/* ширина контейнера */
					outer_width : false,
					/* высота контейнера */
					outer_height : false,
					/* способ встраивания */
					method : 'notfield',  // field ,  notfield
					/* коэффициент */
					k : 1,
					/* сдвинуть к центру без изменения размеров */
					noresize_to_center : false,   //false, true, top, left
					/* callback */
					callback : ""
					
				}, options );
			
				return this.each( function () {
				
					var $this = $(this);
					var data = $this.data("imResize");
					
					if ( !data ) {

						var forImgDelay = function () {
							
							if (!imresize_methods.isImageLoaded.call( $this , $this[0] )) {
								delay = setTimeout(forImgDelay , 100);
								return false;
							}

							/* маштабируемая часть */
							var inner = $this;   
							/* рамка */
							var outer = ( options.outer.length > 0 ) ? $this.parents( options.outer ) : $this.parent();
												
							/* ширина маштабируемой части */
							var inner_width = inner.width();
							/* высота маштабируемой части */
							var inner_height = inner.height();
							/* отношения сторон маштабируемой части */
							var inner_rel = inner_width/inner_height;
							/* ширина рамки */
							var outer_width = options.outer_width || outer.width();
							/* высота рамки */
							var outer_height = options.outer_height || outer.height();
													
							$this.data( "imResize", {
								
								inner : inner,                                        //маштабируемая часть
								outer : outer,                                        //рамка

								inner_width : inner_width,                                    //ширина маштабируемой части
								inner_height : inner_height,                                  // высота маштабируемой части
								inner_rel : inner_rel,                                        //отношения сторон маштабируемой части
						
								outer_width : outer_width,                                    //ширина рамки
								outer_height : outer_height,                                  //высота рамки
								
								method : options.method,                                      //метод встраивания
								k : options.k,                                                //коэффициент
								noresize_to_center : options.noresize_to_center,              //сдвинуть к центру без изменения размеров
								callback : options.callback                                   //callback
								
							});
												
							imresize_methods.move.call( $this , $(this) );

							
							$(window).resize(function () {
								imresize_methods.resize.call( $this , options.outer_width , options.outer_height );
							});
						
						}
						forImgDelay();

					} 				
				})
			},
			resize : function ( w , h ) {
				return this.each(function () {
					var $this = $(this);
					var data = $this.data("imResize");
									
					/* ширина рамки */
					data.outer_width = w || data.outer.width();
					/* высота рамки */
					data.outer_height = h || data.outer.height();
					
					imresize_methods.move.call( $this );
					

				});
			},
			move : function () {
				
				return this.each(function () {
					var $this = $(this);
					var data = $this.data("imResize");
					
					var new_inner_width;
					var new_inner_height;
					var new_inner_top;
					var new_inner_left;
					
					var relation = data.outer_width*data.inner_height < data.inner_width*data.outer_height;  //выбор варианта изменения размеров
					var resize_type = data.noresize_to_center;                                               //тип измения размеров
					
					/* стандартная функция расчета новых значений */
					function calc_default () {
						if ( relation ) {
							new_inner_height = data.outer_height*data.k;
							new_inner_width = data.outer_height*data.inner_rel*data.k;
							new_inner_top = (data.outer_height - new_inner_height)/2;
							new_inner_left = (data.outer_width - new_inner_width)/2;
						}
						else {
							new_inner_width = data.outer_width*data.k;
							new_inner_height = data.outer_width/data.inner_rel*data.k;
							new_inner_top = (data.outer_height - new_inner_height)/2;
							new_inner_left = (data.outer_width - new_inner_width)/2;
						}
					}
					/* функция расчета новых значений без изменения размеров */
					function calc_noresize ( option ) {
						new_inner_width = data.inner_width*data.k;
						new_inner_height = data.inner_height*data.k;
						
						switch ( option ) { 
							case true:
								new_inner_top = (data.outer_height - new_inner_height)/2;
								new_inner_left = (data.outer_width - new_inner_width)/2;
								break;
							case 'top':
								new_inner_top = (data.outer_height - new_inner_height)/2;
								break;
							case 'left':
								new_inner_left = (data.outer_width - new_inner_width)/2;
								break;
						}		
					}
					
					if ( data.method == 'field' ) {
						relation = !relation;
					} 
					
					/* проверка на расчет значений с изменением размеров или нет */
					if ( !!data.noresize_to_center ) calc_noresize(data.noresize_to_center);
					else calc_default();
					
					data.inner.css({
						width : new_inner_width,
						height : new_inner_height,
						left : new_inner_left,
						top : new_inner_top
					})
					
							
					/* вызов callback */
					if( data.callback && typeof data.callback == "function" ) {
						data.callback.call( this, data.indicators.eq( tab_index ) );
					}
				});
			},
			/* состояние закгрузки картинок */
			isImageLoaded : function ( img ) {
				// Во время события load IE и другие браузеры правильно
				// определяют состояние картинки через атрибут complete.
				// Исключение составляют Gecko-based браузеры.
				if (!img.complete) {
					return false;
				}
				// Тем не менее, у них есть два очень полезных свойства: naturalWidth и naturalHeight.
				// Они дают истинный размер изображения. Если какртинка еще не загрузилась,
				// то они должны быть равны нулю.
				if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
					return false;
				}
				// Картинка загружена.
				return true;
			},
			destructor : function () {
				return this.each( function () {
					var $this = $(this);
					var data = $this.removeData("imResize");
					$this.off('.imResize');
				});
			}
		}
	/* Плагин */
	$.fn.imResize = function ( method ) {
		if ( imresize_methods[method] ) {
			return imresize_methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || !method ) {
			return imresize_methods.init.apply(this, arguments);
		}
		else {
			$.error('Method ' +  method + ' does not exist on jQuery.accordIon' );
		}  		
	}
	

})(jQuery);