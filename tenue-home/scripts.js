// Form Validation
function valForm(data) {

	var valEmail = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,16})?$/;
	var valPhone = /^[0-9-]+$/;

	let isValid = true;

	// Fields
	for (var i = 0; i < data['fields'].length; i++) {

		var field_id = data['fields'][i].id;
		var field_required = data['fields'][i].required || false;
		var field_required_message = data['fields'][i].required_message || '';
		var field_filter = data['fields'][i].required_filter || false;
		var field_filter_message = data['fields'][i].required_filter_message || '';


		var field = $('form[id="'+ data.id+'"] [name="'+field_id+'"]');


		if (field_required) {

			if (field.val() === '') {
				field.addClass('is-invalid');
				if (field.parent().find('.invalid-feedback').length == 0) {
					field.parent().append('<div class="invalid-feedback">'+field_required_message+'</div>');
				}

				isValid = false;
			} else if(field_filter == 'phone' && !valPhone.test(field.val()) && field.val().length < 5){
				field.removeClass('is-invalid');
				field.siblings().remove('.invalid-feedback');

				field.addClass('is-invalid');
				if (field.parent().find('.invalid-feedback').length == 0) {
					field.parent().append('<div class="invalid-feedback">'+field_filter_message+'</div>');
				}
			
				isValid = false;
			} else if(field_filter == 'email' && !valEmail.test(field.val())){
				field.removeClass('is-invalid');
				field.siblings().remove('.invalid-feedback');

				field.addClass('is-invalid');
				if (field.parent().find('.invalid-feedback').length == 0) {
					field.parent().append('<div class="invalid-feedback">'+field_filter_message+'</div>');
				}

				isValid = false;
			} else {
				field.removeClass('is-invalid');
				field.siblings().remove('.invalid-feedback');
			}

		}

	}

	return isValid;
}

function contactFormCaptcha(){

}

// Form
function contactForm(data){

	var isSubmitting = false;
	var form = $('form[id="'+data.id+'"]');

    // Captcha 3.0
    if (data.captcha.enabled) {
        grecaptcha.ready(() => {
            grecaptcha.execute(data.captcha.public, { action: 'submit' }).then((token) => {
                form.find('[name="g-recaptcha-response"]').val(token);
            });
        });
    }

    // Form submit
	form.submit(function(e){
		e.preventDefault();

        // Check if a submission is already in progress
        if(isSubmitting) {
            return;
        }

		if(valForm(data)){

			//const formData = $(form).serialize();
            //const formData = new FormData(form[0]);
            const formData = new FormData(this);
            const submitButton = form.find('button[type="submit"]');
            submitButton.addClass('btn-loading').text(data.sending);
            isSubmitting = true;

			$.ajax({
				type: 'POST',
				url: form.attr('action'),
				data: formData,
                cache: false,
                contentType: false,
                processData: false,
			}).done((response) => {
                // Actions
                if (data.id === 'brochureForm' && data.file !== ''){
                    window.open(data.file, '_blank');
                }

                if (data.id === 'rrhhForm' && data.redirect !== ''){
                    window.location.href = data.redirect;
                }

                // Process form
                if (form.find('.text-success').length === 0){
                    form.append('<div class="col-12 mt-3 text-center text-success">'+ data.thanks +'</div>');
                }

                // Remove values
                form.find('.form-control, .form-select').val('');
                form.find('.files').html('');

			}).fail(() => {
                form.find('.text-success').remove();

            }).always(() => {
                submitButton.removeClass('btn-loading').text(data.submit);
                isSubmitting = false;
            });

		} else {
            const firstInvalid = $('.invalid-feedback:first');

            if (firstInvalid.length){
                $('html, body').stop().animate({ 'scrollTop': firstInvalid.offset().top - 200 }, 900);
            }
        }
	});

	// Files
    form.find('.input-file-wrapper input').change(function() {
        let files = [];
        $.each(this.files, (index, file) => {
            files.push(`<span>${file.name}</span>`);
        });
        $(this).next('.files').html(files.join(''));
    });
}

// Slides
function slides() {

	// Presentation
    $('.presentation .slider .slides').slick({
        mobileFirst: true,
        arrows: true,
        dots: false,
        appendArrows: '.presentation .arrows',
        adaptiveHeight: true,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false,
        fade: false,
        cssEase: 'ease-in-out',
    });    
}

// Scroll
/*function scroll() {

	width = $(window).width();
	scrollTop = $(window).scrollTop();

    // Fixed Header
	if(scrollTop > 300){
		$('.header, body').addClass('fixed');
	} else {
		$('.header, body').removeClass('fixed');
	}


	$('.section').each(function() {
		scrollTop = $(window).scrollTop();
		documentHeight = $(document).outerHeight() - $(window).outerHeight();

		$module = $(this).offset().top - 90;
		$module_bottom = $(this).offset().top + $(this).outerHeight() - 90;
		
		val = $(this).attr('id');

		if (scrollTop > $module && scrollTop < $module_bottom) {
			$('.header .navigation li a[href="#'+val+'"]').parent().addClass('active');
		} else {
			$('.header .navigation li a[href="#'+val+'"]').parent().removeClass('active');
		}

		if (scrollTop == documentHeight) {
			$('.header .navigation li a[href="#'+val+'"]').parent().removeClass('active');
			$('.header .navigation li a[href="#contact"]').parent().addClass('active');
		};
	});
}
*/

// Scroll
function scroll() {

    width = $(window).width();
    scrollTop = $(window).scrollTop();
    documentHeight = $(document).outerHeight() - $(window).outerHeight();

    // Fixed Header
    if(scrollTop > 300){
        $('.header, body').addClass('fixed');
    } else {
        $('.header, body').removeClass('fixed');
    }   

}

// Number grow in stats
function moduleStats(){

	scrollTop = $(window).scrollTop();

	if ($('.module-stats').length > 0) {
	    stats = $('.module-stats').offset().top - $('.module-stats').outerHeight() - $('.module-stats').outerHeight();

	    if (scrollTop > stats) {
			$('.module-stats .counter').each(function () {
			    $(this).prop('Counter', 0).animate({
			        Counter: $(this).attr('data-number')
			    }, {
			        duration: 2000,
			        easing: 'swing',
			        step: function (now) {
			            $(this).text(Math.ceil(now));
			        }
			    });
			});
	    }
	}
}

// Open
function dataOpen() {

	width = $(window).width();

	// Animate Scroll
	$('a[data-scroll="true"], .data-scroll a').on('click',function (e) {
		e.preventDefault();

		var target = this.hash,
		$target = $(target);

		$('html, body').stop().animate({
			'scrollTop': $target.offset().top - 100
		}, 900, 'swing', function () {
			//window.location.hash = target;
		});
	});


    // Open Menu
    $('[data-open="menu"]').click(function(e){
        e.preventDefault();

        $(this).toggleClass('active');
        $(this).parents('.header').toggleClass('active');
        $(this).siblings('.navigation').toggleClass('active');
    });


    // Open Submenu
    $('[data-open="submenu"]').click(function(e){
        e.preventDefault();

        $(this).parent().toggleClass('active');
        $(this).siblings('.submenu').toggleClass('active');
    });


    // Open Submenu in mobile
    $('.header .navigation .menu li.menu-item-has-children > a').click(function(e) {
        if(width < 1200){
            e.preventDefault();

            if ($('.header .navigation .menu li').hasClass('open-menu')){
                $('.header .navigation .menu li').removeClass('open-submenu');
            }

            $(this).parent().toggleClass('open-submenu');
        }
    });
}

// Modal Video
function modalVideo() {

	$('.video-player.allowed').click(function(e) {
		e.preventDefault();

		$(this).addClass('active');

		id = $(this).attr('data-id');
		type = $(this).attr('data-type');

		$('#modalVideo .player').html('');

		if (type == 'youtube') {
			$('#modalVideo .player').html('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+'?autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
		}

       	if (type == 'vimeo') {
            $('#modalVideo .player').html('<iframe src="https://player.vimeo.com/'+id+'?h=39c25e44a1&color=be9926&title=0&byline=0&portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>');
        }

		if (type == 'file') {
			$('#modalVideo .player').html('<video controls playsinline loop><source src="'+ id +'" type="video/mp4"></video>');
		}

		$('#modalVideo').modal('show');

	});


	$('#modalVideo').on('hidden.bs.modal', function (e){
		$('.video-player').removeClass('active');
		$('#modalVideo .player').html('');
	});
}

// Filter
var filters = {};

function concatValues(obj) {
    var value = '';
    for (var prop in obj) {
        value += obj[prop];
    }
    return value;
}

function filter(){

	// Pagination
    $('.pagination a').click(function(e){
        e.preventDefault();

        var url = $(this).attr('href');
        if (url.indexOf("?") != -1) {
            paged = url.match(/paged=([0-9]+)/)[1];
        } else {
            paged = 1;
        }

        $('.filter [name="paged"]').val(paged);
        $('.filter').submit();
    });

    // Isotope
    var $grid = $('.items').isotope({
      itemSelector: '.item',
      layoutMode: 'fitRows'
    });

    $('.filter-group a').on( 'click', function(e){
        e.preventDefault();

        var $this = $(this);
        var $buttonGroup = $this.parents('.filter-group');
        var filterGroup = $buttonGroup.attr('data-filter-group');
        filters[filterGroup] = $this.attr('data-filter');
        var filterValue = concatValues(filters);

        $('.filter-group[data-filter-group="'+ filterGroup +'"] li a').removeClass('active');
        $(this).addClass('active');

        $grid.isotope({ filter: filterValue });
    });
}

// Share
function share() {
    $('.share ul a').click(function(e) {
        e.preventDefault();
        window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        return false;
    });
}

function show_password(){
	$('.show_password').click(function(e){
		e.preventDefault();

		input = $(this).parent().find('input');

	    if('password' == $(input).attr('type')){
	         $(input).prop('type', 'text');
	         $(this).addClass('active');
	    }else{
	         $(input).prop('type', 'password');
	         $(this).removeClass('active');
	    }
	});
}


document.addEventListener("DOMContentLoaded",function(){
	//slides();
	//scroll();
	//moduleStats();
	dataOpen();
	modalVideo();
	//share();


	$(window).bind('scroll',function(){
		//scroll();
	});


});

/*$(document).ready(function() {
    var checkFancyboxInterval = setInterval(function() {
        var fancyboxContent = $('.fancybox__content');
        if (fancyboxContent.length > 0 && fancyboxContent.find('.f-button[data-fancybox-close]').length === 0) {
            var closeButton = $('<button>', {
                class: 'f-button',
                title: 'Close',
                'data-fancybox-close': ''
            }).html('Cerrar');

            var wrapperDiv = $('<div class="wrapper-button-close"></div>').append(closeButton);
            fancyboxContent.append(wrapperDiv);
            
            //fancyboxContent.append('<div>' closeButton '</div>');
        }
    }, 500); // Verificar cada 500ms
});*/


$(document).ready(function() {
    function addCloseButton() {
        var fancyboxContent = $('.fancybox__container');
        var contentWrapper = fancyboxContent.find('.fancybox__content');
        
        // Eliminar cualquier botón de cerrar existente
        fancyboxContent.find('.wrapper-button-close').remove();

        // Crear y agregar el nuevo botón de cerrar
        var closeButton = $('<button>', {
            class: 'f-button',
            title: 'Close',
            'data-fancybox-close': ''
        }).html('Cerrar');

        var wrapperDiv = $('<div class="wrapper-button-close"></div>').append(closeButton);
        contentWrapper.append(wrapperDiv);
    }

    Fancybox.bind('[data-fancybox="gallery"]', {
        on: {
            done: function(fancybox, slide) {
                addCloseButton();
            },
            change: function(fancybox, slide) {
                addCloseButton(); 
            }
        }
    });
});