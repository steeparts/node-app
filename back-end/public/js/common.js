$(function() {

	$('#form-constructor input[data-type]').click(function() {
		switch($(this).data('type')) {
			case 'add': {
				var num = $(this).closest('form').find('.table__body .table__row').size() + 1;
				$(this).closest('form').find('.table__body').append('<div class="table__row">' +
					'<div class="table__col col-c col-1">' + num + '</div>' +
					'<div class="table__col col-c col-4">' +
						'<input type="text" name="task" autocomplete="off" placeholder="Текст задания" class="form__input table__input">' +
					'</div>' +
					'<div class="table__col col-c col-2">' +
						'<input type="text" name="code" autocomplete="off" placeholder="Код станции" class="form__input table__input">' +
					'</div>' +
					'<div class="table__col col-c col-5">' +
						'<input type="text" name="tooltip1" autocomplete="off" placeholder="Подсказка №1" class="form__input table__input">' +
						'<input type="text" name="tooltip2" autocomplete="off" placeholder="Подсказка №2" class="form__input table__input">' +
						'<input type="text" name="tooltip3" autocomplete="off" placeholder="Подсказка №3" class="form__input table__input">' +
					'</div>' +
				'</div><!-- /table__row -->');
			}; break;
			case 'clear': {
				$(this).closest('form').find('.table__body .table__row:not(:first)').remove();
				$(this).closest('form').find("input[type=text]").val("");
				$(this).closest('form').find("input[name=interval]").val("15");
			}; break;
		}
	});

	// Login Form
	$('#form-login').on('submit', function(e) {
		e.preventDefault();
		// проверка на пустоту
		var form__errors = $(this).find('.form__errors');
		var form__login = $(this).find('input[name=login]');
		if (!$(form__login).val().replace(/^\s+|\s+$/g, '')) {
			$(form__errors).text('Ошибка заполнения');
			$(form__errors).show();
			return false;
		}
		else
			$(form__errors).hide();	

		$(this).unbind('submit').submit();
	});

	// Game Form
	$('#form-game').on('submit', function(e) {
		e.preventDefault();
		// проверка на пустоту
		var form__errors = $(this).find('.form__errors');
		var form__code = $(this).find('input[name=code]');
		if (!$(form__code).val().replace(/^\s+|\s+$/g, '')) {
			$(form__errors).text('Ошибка заполнения');
			$(form__errors).show();
			return false;
		}
		else
			$(form__errors).hide();

		$(this).unbind('submit').submit();
	});

	// Modal Dialog
	var overlay = $('#overlay');
	var close = $('.modal__close, #overlay');
	var modal = $('.modal'); 

    close.click(function() {
		modal
			.animate({opacity: 0, top: '50%'}, 200,
			function() {
				$(this).hide();
				overlay.fadeOut(400);
			}
		);
	});

});

function hmsFix(param) { return (param <= 9) ? '0'+param : param; }

function toHms(_time, _sec) {
	var sec = _sec;
	if (sec > 3599) {
		_time.hms.h = Math.floor(sec / 60);
		sec -= _time.hms.h * 3600;
		_time.hms.h = hmsFix(_time.hms.h);
	}

	if (sec > 59) {
		_time.hms.m = Math.floor(sec / 60);
		sec -= _time.hms.m * 60;
		_time.hms.m = hmsFix(_time.hms.m);
	}

	if (sec <= 59) {
		_time.hms.s = sec;
		_time.hms.s = hmsFix(_time.hms.s);
	}
}

function ajax_tooltip(task_id, tooltip_id) {
	
	$(function() {
		$.ajax({
	    	url: "/ajax/get_tooltip?task_id="+task_id+"&tooltip_id="+tooltip_id,
	    	success: (data) => { showTooltip(data); }
		});
	});

}

function showTooltip(text) {
	var div = "#tooltip-modal";
    $('#overlay').fadeIn(400,
    function() {
        $(div)
        .css('display', 'block')
        .animate({
            opacity: 1,
            top: '50%'
        }, 200)
        .find('.modal__content').text(text);
    });
}