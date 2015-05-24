$(document).ready(function () {
	Uppod({m:"video",uid:"video_player",file:"video/lec.mp4",poster:"video/FMA.jpg",sub:"texts/text_.srt"});

	$('.text_learn').click(function () {
		$.ajax({
			url: 'set_corpus.py', 
			beforeSend : function () {
				$('.loader').css({display : 'block'});
			},
			success: function (data, textStatus) { 
				$('.status_message').addClass('success').html(data);
				
			},
			complete : function (data, textStatus) {
				console.log(textStatus);
				$('.loader').css({display : 'none'});
			}
		});
	});
	
	$('.text_analiz').click(function () {
		$.ajax({
			url: 'analiz.py', 
			beforeSend : function () {
				$('.loader').css({display : 'block'});
			},
			success: function (data, textStatus) { 
				//data.match(/`[а-яА-Я]*`/g);
				/* var result = data.replace(/`[а-яА-Я]*`/g , function (str) {
					return "<i class='red'>"+str.replace(/`/g , "")+"</i>";
				});
				$('.textarea').html(result); */
				var text = $('.textarea').html();
				var data_object = $.parseJSON(data);
				
				var position = 0;
				for (word in data_object) { 
					//position = text.indexOf('*', position);
					//console.log(data_object[word])
					var variants = "";
					var words_for_sort = [];
					for (variant in data_object[word]) {
						if (data_object[word].length == 0) {
							
						}
						variants += data_object[word][variant] + "|" + variant + ";";
						words_for_sort.push(data_object[word][variant] + "|" + variant);
					}
					words_for_sort.sort(function (a , b) {
						return parseFloat(b) - parseFloat(a);
					});
					if (typeof(words_for_sort[0]) == 'undefined') {
						words_for_sort[0] = "1|ничего не найдено"
					}
					text = text.replace("*", "<i class='red' data-words='" + variants.replace(new RegExp(";$",'g') , '') + "'>"+words_for_sort[0].split("|")[1]+"</i>")
				}
				$('.textarea').html(text);
				
			},
			complete : function (data, textStatus) {
				console.log(textStatus);
				$('.loader').css({display : 'none'});
			}
		});
	});
	
	$('.textarea').on('click' , '.red' , function () {
		var words = $(this).attr('data-words').split(';')
		words.sort(function (a , b) {
			return parseFloat(b) - parseFloat(a);
		});
		var inner_html = "";
		for (word in words) {
			word = words[word].split("|");
			inner_html += '<li><a href="javascript:" class="advice_word">' + word[1] + '</a></li>'
		}
		$('.advice_words').html(inner_html);
	});
	
	$('.text_add').on('change' , function () {
		$this = $(this);
	
		if ( typeof ( file = this.files[0] ) == "undefined" ) {
			return false;
		}
		else {
			var file = this.files[0];
		}
		
		
		var xhr = new XMLHttpRequest();
		/* xhr.upload.addEventListener('progress', function () {
			$('.loader').css({display : 'block'});
		}, false); */
		xhr.onprogress = function () {
			$('.loader').css({display : 'block'});
		}
		xhr.onerror = function () {
			if (this.status == 200) {
				$('.status_message').addClass('success').html("Файл загружен!");
			} else {
				$('.status_message').addClass('error').html(this.status);
			}
			
		}
 		xhr.onreadystatechange = function ( data ) {
			$('.loader').css({display : 'none'});
			if ( xhr.readyState == 4 ) {
				if (xhr.status == 200) {
					var result_obj = $.parseJSON(xhr.responseText) , i = 0 , result = "";
					for ( index in result_obj ) {
						result += "<b>" + (1+parseInt(index)) + ": </b><span class='sub_line'> " + result_obj[index] + " </span><br>"
					}
								
					$('.status_message').addClass('success').html("Файл загружен!");
					
					$('.textarea').html( result );
                    $('.present_buttons').find('input').removeAttr('disabled');
				} else {
					$('.status_message').addClass('error').html(this.status);
				}
			}
		};  
		xhr.open('POST', '/upload.py');
		xhr.setRequestHeader( 'X-FILE-NAME', file.name );
		var form_data = new FormData
		form_data.append("file" , file);
		form_data.append("change" , "page_image");
		//fd.append("type", page_type);
		//fd.append("id", page_id);
		xhr.send( form_data )
	});
	
	var sub_inter = 0;
	var current_text = "";
	$("#video_player iframe").contents().on( 'click' , '.uppod-control_play' , function () {
		var input_text = $('.textarea').html();
		var subtit_parent = $("#video_player iframe").contents().find('body > div:first-child');
	
		sub_inter = setInterval(function () {
			current_text = subtit_parent.find('> div:last-child').text().trim();
			
			//if (current_text.indexOf('Загрузка') > 0) current_text = "";
			if ( input_text.indexOf(current_text) > 0 ) {
				var light_text = input_text.replace(current_text , '<i class="light"> ' + current_text + ' </i>');
				console.log(current_text);
				$('.textarea').html( light_text );
				//$('.window_input').find('input.sub_input').attr('data-num' , $('.light').prev().text() ).val( current_text );
				
				var new_position = Math.abs($('.textarea').find('b:first-child').position().top) + Math.abs( $('.light').position().top ) - 50;
				
				if ( $('.light').position().top > $('.textarea').height() ) {
					$('.textarea').animate({scrollTop: new_position } , 300)
				}
			}
		} , 1000)
	});
	$("#video_player iframe").contents().on( 'click' , '.uppod-control_pause , canvas' , function () {
		clearInterval(sub_inter);
	});
	
	$('.textarea').on('click' , 'span.sub_line' , function () {	
		$('.window_input').find('input.sub_input').attr('data-num' , parseInt( $(this).prev().text() ) ).val( $(this).text() );
		$('.sub_input_save').removeAttr('disabled');
	});
	
	$('.window_input').on('click' , '.sub_input_save' , function () {
		var sub_input = $('.sub_input');
		var sub_num = sub_input.attr('data-num');
		var sub_string = sub_input.val();
		
		$.ajax({
			url: 'saveChange.py',   
			data : "string=" + sub_string + "&string_num=" + sub_num,
			success: function (data, textStatus) { 
				console.log(data);
				$('.textarea').find('b');
				$($('.textarea').find('b')[sub_num - 1]).next('span.sub_line').html('<i class="green"> '+sub_string+' </i>')
			} 
		});
	});
	
	$('.sub_input_clear').on('click' , function () {
		$('.sub_input').attr('data-num' , '').val("");
		$('.sub_input_save').attr('disabled' , 'disabled');
	});
    
    var duration = 200;
    $('.present_move').click(function () {
        $('.text_buttons, .present_buttons').slideUp(duration);
        $('.textarea').animate({height : 600} , duration*2);
        $('.sub_input_save').addClass('present_save').removeClass('sub_input_save').removeAttr("disabled");
        $('.sub_input').val("5 слайдов доступно").attr("disabled" , "disabled");
        
        var old_text = $('.textarea').html();
        $('.textarea').data('old_text' , old_text);
        
        var new_text = $('.textarea').find('span').text().split(" ");
        var finished_text = "";
        for (word in new_text) {
            finished_text += '<span class="word"> ' +new_text[word]+ ' </span>';
        }
        $('.textarea').html('<div class="present_slide">' + finished_text + '<b class="present_slide_del" style="display:none;">У</b></div>');
    });
    $('.sub_input_clear').click(function () {
        $('.text_buttons, .present_buttons').slideDown(duration);
        $('.textarea').animate({height : 150} , duration*2);
        $('.save_present').addClass('sub_input_save').removeClass('present_save').attr("disabled" , "disabled");
        $('.sub_input').val("").removeAttr("disabled");
        
        var old_text = $('.textarea').data('old_text');
        $('.textarea').html(old_text);
    });
    
    $('.textarea').on('click' , 'span.word' , function () {
        var word_current_index = $(this).index();
        var slide_current_index = $(this).parent().index();
    
        $(this).parent().after('<div class="present_slide"></div>');
        var span_to_change = $(this).parent().find('span').filter(function (index) {
            if (index >= word_current_index) return true;
        });
        $($('.present_slide')[slide_current_index+1]).append(span_to_change).append('<b class="present_slide_del">У</b>');
    });
    
    $('.textarea').on('click' , '.present_slide_del' , function () {
        var words = $(this).siblings('span.word');
        var this_parent = $(this).parent();
        this_parent.prev().find('.present_slide_del').before(words);
        this_parent.remove();
        //$(this).parent().prev().append(words).next().remove();
    });
	
});