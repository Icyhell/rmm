/* Аккордеон */
/* <div class="accordion">
	<p class="tabs">Вкладка</p>
	<div class="content">
		<p>Текст</p>
	</div>
	<p class="tabs">Вкладка</p>
	<div class="content">
		<p>Текст</p>
	</div>
	<p class="tabs">Вкладка</p>
	<p class="tabs">Вкладка</p>
	<div class="content">
		<p>Текст</p>
	</div>
</div>
<script type="text/javascript">
	$('.accordion').accordIon({
		tabs_class : '.tabs',
		blocks_class : '.content',
		indicators_class : '.tabs'
	});
</script> */
(function ( $ , undefined  ) {

		/* Методы */
		var accordion_methods = {
			/* Инициализация */
			init : function ( options ) {
			
				var options = $.extend( {
		
					/* закрывать вкладку при повторном нажатии */
					tab_second_click_close : true,
					/* закрывать остальные вкладки при открытие одной */
					closed_tabs_after_open_new : true,
					/* открывать первую либо активную(false, first, active) */
					open_first_or_active : false,
					/* блокировать переход по ссылке, если есть подменю */
					blocked_top_links_go : false,
					/* класс вкладок */
					tabs_class : '> ul > li:has(ul) > a', //.link
					/* класс закрывающейся части */
					blocks_class : '> ul > li > ul', //.container
					/* класс индикатора закрытия/открытия */
					indicators_class : '> ul > li:has(ul) > a', //.turn
					/* класс активной вкладка */
					active_tab_class : '.active',
					/* метод анимации */
					animate_method : 'slide',
					/* скорость анимации */
					animate_speed : 150,
					/* тип обработчика */
					handler_type : 'click',
					/* callback */
					callback : ""
					
				}, options );
			
				return this.each( function () {
				
					var $this = $(this);
					var data = $this.data("accordIon");
					
					if ( !data ) { 
					
						/* вкладки */
						var tabs = $this.find( options.tabs_class );
						/* закрывающаяся часть */
						var blocks = $this.find( options.blocks_class );
						/* индикатор закрытия/открытия */
						var indicators = $this.find( options.indicators_class );
						/* активная вкладка */
						var active_tab = $this.find( options.active_tab_class );
						
						$this.data( "accordIon", {
						
							container : $this,                                        //контейнер
							tab_second_click_close : options.tab_second_click_close,    //закрывать вкладку при повторном нажатии
							closed_tabs_after_open_new : options.closed_tabs_after_open_new, //закрывать остальные вкладки при открытие одной
							open_first_or_active : options.open_first_or_active,       //открывать первую либо активную
							blocked_top_links_go : options.blocked_top_links_go,      //блокировать переход по ссылке, если есть подменю
							tabs : tabs,                                           //вкладки
							blocks : blocks,                                           //закрывающаяся часть
							indicators : indicators,                                   //индикатор закрытия/открытия
							active_tab : active_tab,                                       //активная вкладка
							animate_method : options.animate_method,                             //метод анимации
							animate_speed : options.animate_speed,                             //скорость анимации
							handler_type : options.handler_type,                           //тип обработчика
							callback : options.callback                             //callback
							
						});
						
						
						tabs.css( 'cursor', 'pointer' );
						
						if ( options.handler_type == 'click' ) {
						/* Обработчик нажатия */
						$this.on('click.accordIon', options.tabs_class, function ( event ) {
							if ( options.blocked_top_links_go ) {
								var href = $(event.currentTarget).attr('href');
								
								/* блокирует переход по ссылке, если есть подменю */
								if ($(event.currentTarget).parent().find('ul').length) {
									event.preventDefault();
								}
							}
							var elem_index = tabs.index(event.currentTarget);
							accordion_methods.move.call( $this, elem_index );
						});
						}
						else if ( options.handler_type == 'hover' ) {
						/* Обработчик наведения */
						$this.on('hover.accordIon', options.tabs_class, function ( event ) {
							if ( options.blocked_top_links_go ) {
								var href = $(event.currentTarget).attr('href');
								
								/* блокирует переход по ссылке, если есть подменю */
								if ($(event.currentTarget).parent().find('ul').length) {
									event.preventDefault();
								}
							}
							var elem_index = tabs.index(event.currentTarget);
							accordion_methods.move.call( $this, elem_index );
						});
						}
						
						accordion_methods.start.call( $this );

					} 
					
					
				})
			},
			/* Переключение выделенности */
			start : function () {
				return this.each(function () {
					var $this = $(this);
					var data = $this.data("accordIon");
					
					data.blocks.accordIon_slide( {turn : 'off', method : data.animate_method}, 0 );
					data.indicators.removeClass('accordion_minus').addClass('accordion_plus');
				
					switch ( data.open_first_or_active ) {
						case 'first': 
							accordion_methods.move.call( $this, 0 );
							break;
						case 'active': 
							accordion_methods.move.call( $this, data.active_tab.index() );
							break;
						default: 
							break;
					}
				});
			},
			move : function ( elem_index ) {
				
				return this.each(function () {
					var $this = $(this);
					var data = $this.data("accordIon");
					
					var elem = $( data.tabs ).eq( elem_index ) ;  //вкладка
					var tab_index = elem_index;                //индекс вкладки
					
					/* Написать проверку, если индикатор среди родителей или потомков вкладки */
					var tab_open = elem.hasClass('accordion_minus');    //открыта ли вкладка 
					if ( !tab_open ) {
						tab_open = elem.parents('.accordion_minus').hasClass('accordion_minus')
					}
					if ( !tab_open ) {
						tab_open = elem.find('.accordion_minus').hasClass('accordion_minus');
					}
					
					/* не закрывает вкладку при повторном нажатии */
					if ( tab_open && !data.tab_second_click_close ) {
						return false;
					}
					/* закрывает при повторном нажатии */
					else if ( tab_open ) {
						data.indicators.eq( tab_index ).removeClass('accordion_minus').addClass('accordion_plus');
						data.blocks.eq( tab_index ).accordIon_slide( {turn : 'off', method : data.animate_method}, data.animate_speed )
					}
					/* открывает */
					else {
						/* закрывает остальные вкладки при открытии новой */
						if ( data.closed_tabs_after_open_new ) {
							data.indicators.removeClass('accordion_minus').addClass('accordion_plus').eq( tab_index ).removeClass('accordion_plus').addClass('accordion_minus');
							data.blocks.accordIon_slide( {turn : 'off', method : data.animate_method}, data.animate_speed ).eq( tab_index ).accordIon_slide( {turn : 'on', method : data.animate_method}, data.animate_speed );
						}
						else {
							data.indicators.eq( tab_index ).removeClass('accordion_plus').addClass('accordion_minus');
							data.blocks.eq( tab_index ).accordIon_slide( {turn : 'on', method : data.animate_method}, data.animate_speed );
						}
						
					}
					
					/* вызов callback */
					if( data.callback && typeof data.callback == "function" ) {
						data.callback.call( this, data.indicators.eq( tab_index ) );
					}
				});
			},
			destructor : function () {
				return this.each( function () {
					var $this = $(this);
					var data = $this.removeData("accordIon");
					$this.off('.accordIon');
				});
			}
		}
	/* Плагин */
	$.fn.accordIon = function ( method ) {
		if ( accordion_methods[method] ) {
			return accordion_methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || !method ) {
			return accordion_methods.init.apply(this, arguments);
		}
		else {
			$.error('Method ' +  method + ' does not exist on jQuery.accordIon' );
		}  		
	}
	
	$.fn.accordIon_slide = function ( options, speed ) {
	
		var options = $.extend({
				method : 'slide',
				turn : 'on'
				
			}, options);
	
		return this.each(function () {
		
			var $this = $(this);
			
			var slide_methods = {
				slide : {
					on : function () {
						$this.stop().slideDown( speed );
					},
					off : function () {
						$this.stop().slideUp( speed );
					}
				},
				change_height : {
					on : function () {
						var into_height = 0;
						$this.children().each(function () {
							into_height = into_height + $(this).height();
						})
						$this.animate({'height': into_height}, 300 , function () {
							$this.css({'height': 'auto'});
						});
					},
					off : function () {
						$this.animate({height : $this.css('min-height')},200);
					}
				},
				comments_slide : {
					on : function () {
						var min_height = parseInt( $this.css('min-height') );
						
						$this.find('> div').css('position' , 'relative');
					
						var into_height = 0;
						$this.children().each(function () {
							into_height = into_height + $(this).height();
						})
						$this.animate({ 'height' : into_height }, 300 , function () {
							$this.css({'height': 'auto'});
							//$this.find('div').css({ 'position' : 'relative'});
						})
						.find('div').animate({'bottom' : 0 }, 300);
					},
					off : function () {
						var min_height = parseInt( $this.css('min-height') );
					
						var into_height = 0;
						$this.children().each(function () {
							into_height = into_height + $(this).height();
						})
						var min_height = ( into_height != 0 ) ? parseInt( $this.css('min-height') ) : 0;
						
						if ( min_height == 0 ) {
							$this.find('> div').css('position' , 'absolute');
						}
						
						$this.animate({ height : $this.css('min-height') } , 200 , function () {
							//$this.find('div').css({ 'position' : 'absolute'});
						})
						.find('> div').animate({'bottom' : into_height - min_height }, 200 , function () {
							$(this).css({'position' : 'absolute' , 'bottom' : 0})
						});
					}
				}
			}
			
			switch ( options.method ) {
				case 'slide':
					if ( options.turn == 'on' ) {
						slide_methods.slide.on();
					}
					else if (  options.turn == 'off'  ) {
						slide_methods.slide.off();
					}
					break;
				case 'change_height':
					if ( options.turn == 'on' ) {
						slide_methods.change_height.on();
					}
					else if (  options.turn == 'off'  ) {
						slide_methods.change_height.off();
					}
					break;
				case 'comments_slide':
					if ( options.turn == 'on' ) {
						slide_methods.comments_slide.on();
					}
					else if (  options.turn == 'off'  ) {
						slide_methods.comments_slide.off();
					}
					break;
				default:
					break;
			}
			
			return this;
		})
		
	}

})(jQuery);