$(function() {

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
		// проверка на существование логина

		// создание учётной записи
		window.location.href = "game.html";
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
		// проверка на правильность введённоо кода

		// переход к следующей станции
		var success = true;
		if (success)
			window.location.href = "index.html";
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