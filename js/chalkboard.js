//ChalkBoard Painter 2012 - Nuvuthemes.com - nuvuscripts@gmail.com
$(document).ready(function () {
	//file uploadify plugin
	var upload_directory = "uploads";
	var $brushselinit = $('.brushsel').attr('size');
	var size = $brushselinit;
	var restorePoints = [];
	var imgSrc;
	var minusWidth = 160;
	var minusHeight = 70;
	var $uploadify = $('#file_upload');
	var $traceimg = $('.traceimg');
	var $cbminus = $('.cbminus');
	$cbminus.fadeOut(10);
	$uploadify.uploadify({
		'swf': 'js/uploadify/uploadify.swf',
		'uploader': 'js/uploadify/uploadify.php',
		'width': 30,
		'height': 30,
		'buttonText': '',
		'fileTypeExts': '*.gif; *.jpg; *.png',
		'fileTypeDesc': 'Image Files',
		'fileSizeLimit': '1MB',
		'onUploadSuccess': function (file) {
			$('.traceimg').prepend('<img class="backg" src="' + upload_directory + '/' + file.name + '" />')
		}
	});
	//end file uploadify plugin
	//create canvas draw colorpicker
	var ctx = document.getElementById('cpcanvas').getContext('2d');
	var img = new Image();
	var $getcolor = $('.getcolor');
	var $cbfill = $('.cbfill');
	var $brushsel = $('.brushsel');
	var $colortext = $('.colortext');
	//set image src for colorpicker
	img.src = "images/colorpicker.png";
	img.onload = function () {
		ctx.drawImage(img, 0, 0);
	}


	var rgb = '44, 140, 164';
	var $spcanvas = $('#cpcanvas');
	getcolor = rgb;
	//set bg color for getcolor, cbfill, brushsel
	$getcolor.css({
		'background-color': "rgba(" + getcolor + ",1)"
	});
	$cbfill.css({
		'background-color': "rgba(" + getcolor + ",1)"
	});
	$brushsel.css({
		'background-color': "rgba(" + getcolor + ",1)"
	});

	var getdata0 = 44;
	var getdata1 = 140;
	var getdata2 = 164;
	var data0, data1, data2;

	//colorpicker mousemove event
	$spcanvas.bind('mousemove', function (event) {
		var x = event.pageX - $spcanvas.offset().left;
		var y = event.pageY - $spcanvas.offset().top;
		var ctx = document.getElementById('cpcanvas').getContext('2d');
		var imgdata = ctx.getImageData(x, y, 1, 1);
		var data = imgdata.data;

		rgb = data[0] + "," + data[1] + "," + data[2];
		data0 = data[0];
		data1 = data[1];
		data2 = data[2];
	});

	//colorpicker click event
	$spcanvas.bind('click', function (event) {
		$brushsel = $('.brushsel');;
		getcolor = rgb;
		getdata0 = data0;
		getdata1 = data1;
		getdata2 = data2;
		$getcolor.css({
			'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
		});
		$cbfill.css({
			'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
		});
		$brushsel.css({
			'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
		});
		$('.typeoptions').find('.ui-btn-text').css({
			'color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
		});
		$colortext.html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
		$strengthslider0.slider({
			value: getdata0,
			animate: true
		});
		$strengthslider1.slider({
			value: getdata1,
			animate: true
		});
		$strengthslider2.slider({
			value: getdata2,
			animate: true
		});
		return getcolor;
		return getdata0;
		return getdata1;
		return getdata2;
	});
	//end colorpicker

	var canvas, context, tool, oldCanvas;
	//init function for ChalkBoard Canvas

	function init() {
		// Find the canvas element.
		canvas = document.getElementById('chalkboard');
		context = canvas.getContext('2d');
		var thisbg = $('.selectedimg').attr('src');
		var imageObj = new Image();
		imageObj.src = thisbg;
		var $selectedimg = $('.selectedimg');
		$selectedimg.load(function () {
			context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
			//set oldCanvas for changebackground function
			oldCanvas = canvas.toDataURL("image/png");
			//set origData for greyscale etc
			origData = context.getImageData(0, 0, canvas.width, canvas.height);
		});

		var chalkw = $('.chalkboard').css('width');
		var chalkh = $('.chalkboard').css('height');
		var $chalkboardwrap = $('.chalkboardwrap');
		//set canvas height/width based on container size
		$chalkboardwrap.css({
			'width': parseInt(chalkw) - minusWidth + 'px'
		});
		$chalkboardwrap.css({
			'height': parseInt(chalkh) - minusHeight + 'px'
		});
		canvas.width = parseInt(chalkw) - minusWidth;
		canvas.height = parseInt(chalkh) - minusHeight;
		// Pencil tool instance.
		tool = new tool_pencil();
		// Attach the mousedown, mousemove and mouseup event listeners - Draw on canvas.
		canvas.addEventListener('mousedown', ev_canvas, false);
		canvas.addEventListener('mousemove', ev_canvas, false);
		canvas.addEventListener('mouseup', ev_canvas, false);
		canvas.addEventListener('mouseout', ev_canvas, false);
		canvas.addEventListener('touchend', ev_canvas, false);
		canvas.addEventListener('touchstart', ev_canvas, false);
		canvas.addEventListener('touchmove', ev_canvas, false);



		saveRestorePoint();
		//end Attach the mousedown, mousemove and mouseup event listeners - Draw on canvas.
		//var chalkw = $('.chalkboard').width();
		//var chalkh = $('.chalkboard').height();

		var pixelData;

		//invert click event
		var $invert = $('.invert');
		$invert.live('click', function () {
			pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
			var length = pixelData.data.length;
			for (var i = 0; i < length; i += 4) {
				// red
				pixelData.data[i] = 255 - pixelData.data[i];
				// green
				pixelData.data[i + 1] = 255 - pixelData.data[i + 1];
				// blue
				pixelData.data[i + 2] = 255 - pixelData.data[i + 2];
				// i+3 is alpha (the fourth element)
			}
			context.putImageData(pixelData, 0, 0);
			//set origData
			origData = context.getImageData(0, 0, canvas.width, canvas.height);
		});
		//end invert click event

		var origData;

		var $allmodalmessages = $("#info-message, #greys-message, #invert-message, #fill-message, #clear-message, #line-message, #rectangle-tool-message, #dropper-brush-message, #gradient-roll-message, #file-upload-message, #undo-message, #texttool-message");

		//disable modals
		if ($('.chalkboard[modals="false"]').length) {
			$allmodalmessages.css({
				'display': 'none'
			});
		}
		else if ($('.chalkboard[modals="true"]').length) {
			//setup tool button modals
			$allmodalmessages.dialog({
				autoOpen: false,
				show: "slide",
				hide: "fade",
				resizable: false,
				position: "topleft"
			});
			//end setup tool button modals
		};

		//tool button trigger modals
		var $cbundo = $('.cbundo');
		var $gradientroll = $('.gradientroll');
		var $dropperbrush = $('.dropperbrush');
		var $rectangletool = $('.rectangletool');
		var $brushsizetext = $('.brushsizetext');
		var $opacitytext = $('.opacitytext');
		var $colortext = $('.colortext');
		var $fileupload = $("#file_upload");
		var $cpbutton = $(".cpbutton");
		var $greys = $('.greys');
		var $invert = $('.invert');
		var $cbfill = $('.cbfill');
		var $cpline = $(".cpline");
		var $cpinfo = $(".cpinfo");
		var $clearcanv = $(".clearcanv");
		var $rectangletoolmessage = $("#rectangle-tool-message");
		var $dropperbrushmessage = $("#dropper-brush-message");
		var $gradientrollmessage = $("#gradient-roll-message");
		var $infomessage = $("#info-message");
		var $greysmessage = $("#greys-message");
		var $invertmessage = $("#invert-message");
		var $fillmessage = $("#fill-message");
		var $clearmessage = $("#clear-message");
		var $linemessage = $("#line-message");
		var $fileuploadmessage = $("#file-upload-message");
		var $undomessage = $("#undo-message");
		var $texttoolmessage = $("#texttool-message");
		var $cpmessages = $(".cpmessages");
		var $textwrite = $('.textwrite');
		$textwrite.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$fileupload.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$cbundo.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$rectangletool.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$dropperbrush.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$gradientroll.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$cpbutton.live('mouseleave', function () {
			$cpmessages.dialog("close");
			return false;
		});
		$rectangletool.live('mouseover', function () {
			$cpmessages.dialog("close");
			$rectangletoolmessage.dialog("open");
			return false;
		});
		$textwrite.live('mouseover', function () {
			$cpmessages.dialog("close");
			$texttoolmessage.dialog("open");
			return false;
		});
		$dropperbrush.live('mouseover', function () {
			$cpmessages.dialog("close");
			$dropperbrushmessage.dialog("open");
			return false;
		});
		$gradientroll.live('mouseover', function () {
			$cpmessages.dialog("close");
			$gradientrollmessage.dialog("open");
			return false;
		});
		$cpinfo.live('mouseover', function () {
			$cpmessages.dialog("close");
			$infomessage.dialog("open");
			return false;
		});
		$greys.live('mouseover', function () {
			$cpmessages.dialog("close");
			$greysmessage.dialog("open");
			return false;
		});
		$invert.live('mouseover', function () {
			$cpmessages.dialog("close");
			$invertmessage.dialog("open");
			return false;
		});
		$cbfill.live('mouseover', function () {
			$cpmessages.dialog("close");
			$fillmessage.dialog("open");
			return false;
		});
		$clearcanv.live('mouseover', function () {
			$cpmessages.dialog("close");
			$clearmessage.dialog("open");
			return false;
		});
		$cpline.live('mouseover', function () {
			$cpmessages.dialog("close");
			$linemessage.dialog("open");
			return false;
		});
		$fileupload.live('mouseover', function () {
			$cpmessages.dialog("close");
			$fileuploadmessage.dialog("open");
			return false;
		});
		$cbundo.live('mouseover', function () {
			$cpmessages.dialog("close");
			$undomessage.dialog("open");
			return false;
		});
		//end tool button trigger modals
		//greys click
		var $greys = $('.greys');
		$greys.live('click, tap', function () {
			var $this = $(this);
			if ($this.hasClass('savedoldimage')) {
				var $this = $(this);
				context.putImageData(origData, 0, 0);
				$this.removeClass('savedoldimage');
			}
			else {
				var $this = $(this);
				$this.addClass('savedoldimage');
				origData = context.getImageData(0, 0, canvas.width, canvas.height);
				var pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
				var length = pixelData.data.length;
				for (var i = 0; i < length; i += 4) {
					var brightness = 0.34 * pixelData.data[i] + 0.5 * pixelData.data[i + 1] + 0.16 * pixelData.data[i + 2];
					pixelData.data[i] = brightness;
					// red
					pixelData.data[i + 1] = brightness;
					// green
					pixelData.data[i + 2] = brightness;
					// blue
					// i+3 is alpha (the fourth element)
				}

				context.putImageData(pixelData, 0, 0);
			};

		});
		//end greys click
		//set init background for IE
		changebackground();
	}
	//end init

	//confirm message modals
	//bg confirm modal
	var $bg_confirm = $("#bg-confirm");
	$bg_confirm.dialog({
		modal: true,
		autoOpen: false,
		show: "slide",
		hide: "fade",
		resizable: false,
		buttons: {
			Ok: function () {
				$(this).dialog("close");
				changebackground();
			},
			Cancel: function () {
				$(this).dialog("close");
			}
		}
	});

	//fill confirm modal
	var $fill_confirm = $("#fill-confirm");
	$fill_confirm.dialog({
		modal: true,
		autoOpen: false,
		show: "slide",
		hide: "fade",
		resizable: false,

		buttons: {
			Ok: function () {
				$(this).dialog("close");
				fillbackground();
			},
			Cancel: function () {
				$(this).dialog("close");

			}
		}
	});

	//clear confirm modal
	var $clear_confirm = $("#clear-confirm");
	$clear_confirm.dialog({
		modal: true,
		autoOpen: false,
		show: "slide",
		hide: "fade",
		resizable: false,

		buttons: {
			Ok: function () {
				$(this).dialog("close");
				changebackground();
			},
			Cancel: function () {
				$(this).dialog("close");

			}
		}
	});

	var $chalk_board = $('.chalkboard');

	//changebackground modal function
	function changebackground() {
		var thisbg = $('.selectedimg').attr('src');

		var imageObj = new Image();
		imageObj.src = thisbg;
		var chalkw = $('.chalkboard').css('width');
		var chalkh = $('.chalkboard').css('height');
		var $chalkboard = $('#chalkboard');
		var $chalkboardwrap = $('.chalkboardwrap');

		canvas.width = parseInt(chalkw) - minusWidth;
		canvas.height = parseInt(chalkh) - minusHeight;
		context.drawImage(imageObj, 0, 0, parseInt(chalkw) - minusWidth, parseInt(chalkh) - minusHeight);

		$chalkboard.css({
			'left': '0px',
			'top': '0px'
		});
		oldCanvas = canvas.toDataURL("image/png");
		$('.alphaup').removeClass('savedoldimage');
		origData = context.getImageData(0, 0, canvas.width, canvas.height);
		saveRestorePoint();
	};

	//fillbackground modal function
	function fillbackground() {
		var getcolor = $('.getcolor').css('background-color');
		context.beginPath();
		context.rect(0, 0, canvas.width, canvas.height);
		context.fillStyle = getcolor;
		context.fill();
		$chalkboard.css({
			'left': '0px',
			'top': '0px'
		});
		origData = context.getImageData(0, 0, canvas.width, canvas.height);
	};

	//clearbackground function
	function clearbackground() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	};

	//background fill click event
	var $backg = $('.backg');
	var $bgconfirm = $("#bg-confirm");
	var $cbfill = $('.cbfill');
	var $fillconfirm = $("#fill-confirm");
	var $clearcanv = $('.clearcanv');
	var $clearconfirm = $("#clear-confirm");
	$backg.live('click', function () {
		var $this = $(this);
		$('.backg').removeClass('selectedimg');
		$this.addClass('selectedimg');
		$bgconfirm.dialog("open");
		return false;
	});
	//canvas fill click event
	$cbfill.live('click, tap', function () {
		$fillconfirm.dialog("open");
		return false;
	});
	//canvas clear click event
	$clearcanv.live('click, tap', function () {
		$clearconfirm.dialog("open");
		return false;
	});

	if ($('.chalkboard[resize="true"]').length) {
		//resize event
		var $chalkboardwrap = $('.chalkboardwrap');
		$chalk_board.resizable({
			minHeight: 432,
			minWidth: 862,
			handles: "se,sw,e",
			stop: function () {

				oldCanvas = canvas.toDataURL("image/png");
				var img = new Image();
				img.src = oldCanvas;
				img.onload = function () {
					var chalkw = $chalk_board.width();
					var chalkh = $chalk_board.height();
					canvas.width = parseInt(chalkw) - minusWidth;
					canvas.height = parseInt(chalkh) - minusHeight;
					$chalkboardwrap.animate({
						'width': parseInt(chalkw) - minusWidth,
						'height': parseInt(chalkh) - minusHeight
					}, 500);
					// $('.chalkboardwrap').animate({'height' : parseInt(chalkh)-minusHeight},500);
					context.drawImage(img, 0, 0, parseInt(chalkw) - minusWidth, parseInt(chalkh) - minusHeight);
				};

			}
		});
	};


	//end resize event


	var opacity = 9;
	//tool_pencil function
	var $rectangletool = $('.rectangletool');
	var $cpline = $('.cpline');
	var $gradientroll = $('.gradientroll');
	var $dropperbrush = $('.dropperbrush');
	var $grey = $('.grey');
	var currentfont = $('select#fontselect').val();
	//change font select dropdown
	$('select#fontselect').change(function () {
		currentfont = $('select#fontselect').val();
		$('.ui-btn-text').text('Sample');
		$('.typeoptions').find('.ui-btn-text').css({
			'color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')',
			'font-family': currentfont
		});
		return currentfont;

	});

	function tool_pencil() {

		var tool = this;
		this.started = false;
		// mouse actions
		this.mousedown = function (ev) {
			//set restorepoints
			saveRestorePoint();
			var context = document.getElementById('chalkboard').getContext('2d');
			var imgdata = context.getImageData(ev._x, ev._y, 1, 1);
			var selectdata = imgdata.data;

			rgbselect = selectdata[0] + "," + selectdata[1] + "," + selectdata[2];


			if ($gradientroll.hasClass('on')) {
				//gradientroll
				$dropperbrush.removeClass('on');
				var radgrad4 = context.createRadialGradient(ev._x, ev._y, ev._x, ev._x + 100, ev._y + 100, ev._y);
				radgrad4.addColorStop(0, 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')');
				radgrad4.addColorStop(0.8, 'rgba(' + (getdata0 - 20) + ',' + (getdata1 - 20) + ',' + (getdata2 - 20) + ', 0.' + (opacity) + ')');
				radgrad4.addColorStop(1, 'rgba(' + (getdata0 - +30) + ',' + (getdata1 - 30) + ',' + (getdata2 - 30) + ', 0.' + opacity + ')');
				context.strokeStyle = radgrad4;
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
				$('.colortext').html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
			}
			else if ($dropperbrush.hasClass('on')) {
				//dropper brush
				$gradientroll.removeClass('on')
				context.strokeStyle = "rgba(" + rgbselect + ",0." + opacity + ")";
				getdata0 = selectdata[0];
				getdata1 = selectdata[1];
				getdata2 = selectdata[2];
				$strengthslider0.slider({
					value: getdata0,
					animate: true
				});
				$strengthslider1.slider({
					value: getdata1,
					animate: true
				});
				$strengthslider2.slider({
					value: getdata2,
					animate: true
				});
				$('.colortext').html('<p>Color:rgb(' + rgbselect + ')</p>');
				$getcolor.css({
					'background-color': "rgba(" + rgbselect + ",0." + opacity + ")"
				});
				$cbfill.css({
					'background-color': "rgba(" + rgbselect + ",0." + opacity + ")"
				});
				$('.brushsel').css({
					'background-color': "rgba(" + rgbselect + ",0." + opacity + ")"
				});
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
			}
			else if ($rectangletool.hasClass('on')) {
				//rectangle tool
				context.fillStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
				context.fillRect(ev._x - (size / 2), ev._y - (size / 2), size, size);
				$('.colortext').html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
			}
			else if (
			//type tool
			$('.typeoptions').hasClass('writing')) {

				context.fillStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
				context.strokeStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
				var currentext = $('.currenttext').val();

				context.font = "normal " + size + "px " + currentfont;
				if ($('#stroketext').is(':checked')) {
					context.strokeText(currentext, ev._x, ev._y);
				}
				else {
					context.fillText(currentext, ev._x, ev._y);
				};
				// $('.typeoptions').removeClass('writing');
				//$('.typeoptions').fadeOut(100);
			}
			else {
				//regular brush
				context.strokeStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';;
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
			}
			//end else if's
			if ($grey.hasClass('savedoldimage')) {} else {
				tool.started = true;
			};
		};
		//end mousedown
		this.touchstart = function (ev) {
			//set restorepoints
			saveRestorePoint();
			var context = document.getElementById('chalkboard').getContext('2d');
			var imgdata = context.getImageData(ev._x, ev._y, 1, 1);
			var selectdata = imgdata.data;

			rgbselect = selectdata[0] + "," + selectdata[1] + "," + selectdata[2];

			if ($gradientroll.hasClass('on')) {
				//gradientroll
				$dropperbrush.removeClass('on');
				var radgrad4 = context.createRadialGradient(ev._x, ev._y, ev._x, ev._x + 100, ev._y + 100, ev._y);
				radgrad4.addColorStop(0, 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')');
				radgrad4.addColorStop(0.8, 'rgba(' + (getdata0 - 20) + ',' + (getdata1 - 20) + ',' + (getdata2 - 20) + ', 0.' + (opacity) + ')');
				radgrad4.addColorStop(1, 'rgba(' + (getdata0 - +30) + ',' + (getdata1 - 30) + ',' + (getdata2 - 30) + ', 0.' + opacity + ')');
				context.strokeStyle = radgrad4;
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
				$('.colortext').html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
			}
			else if ($dropperbrush.hasClass('on')) {
				//dropper brush
				$gradientroll.removeClass('on')
				context.strokeStyle = "rgba(" + rgbselect + ",0." + opacity + ")";
				$('.colortext').html('<p>Color:rgb(' + rgbselect + ')</p>');
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
			}
			else if ($rectangletool.hasClass('on')) {
				//rectangle tool
				context.fillStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
				context.fillRect(ev._x - (size / 2), ev._y - (size / 2), size, size);
				$('.colortext').html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
			}
			else {
				//regular brush
				context.strokeStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
				context.lineWidth = size;
				context.miterLimit = 0.1;
				context.beginPath();
				context.moveTo(ev._x, ev._y);
			}
			//end else if's
			if ($grey.hasClass('savedoldimage')) {} else {
				tool.started = true;
			};
		};
		//end touchstart
		this.mousemove = function (ev) {

			if ($rectangletool.hasClass('on') || $('.typeoptions').hasClass('writing')) {
				var isChecked = $('.textbrush').is(':checked');
				if (tool.started && isChecked) {

					context.fillStyle = 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')';
					var currentext = $('.currenttext').val();
					var currentfont = $('.currentfont:selected').val();
					context.font = "normal " + size + "px " + currentfont;
					context.fillText(currentext, ev._x, ev._y);

				}


			}
			else {
				if (tool.started) {
					if ($cpline.hasClass('useline')) {} else {
						context.lineTo(ev._x, ev._y);
						context.lineCap = "round";
						context.stroke();
					}
				};
			}
		};
		//end mousemove
		this.touchmove = function (ev) {

			if ($rectangletool.hasClass('on')) {} else {
				if (tool.started) {
					if ($cpline.hasClass('useline')) {} else {
						context.lineTo(ev._x, ev._y);
						context.lineCap = "round";
						context.stroke();
					}
				};
			}
		};
		//end touchmove

		this.mouseup = function (ev) {
			if (tool.started) {
				if ($rectangletool.hasClass('on')) {
					// tool.mousemove(ev);
					tool.started = false;
				}
				else {
					if ($cpline.hasClass('useline')) {
						context.lineCap = "round";
						context.lineTo(ev._x, ev._y);
						context.stroke();
					};
					// tool.mousemove(ev);
					tool.started = false;
				};
			};
		};
		//end mouseup
		//start touchend
		this.touchend = function (ev) {
			if (tool.started) {
				if ($rectangletool.hasClass('on')) {
					// tool.touchmove(ev);
					tool.started = false;
				}
				else {
					if ($cpline.hasClass('useline')) {
						context.lineCap = "round";
						context.lineTo(ev.pageX, ev.pageY);
						context.stroke();
						tool.started = false;
					};
					// tool.touchmove(ev);
				};
			};
		};
		//end mouseup
		this.mouseout = function (ev) {
			if (tool.started) {
				// tool.mousemove(ev);
				// tool.touchmove(ev);
				tool.started = false;
			}
		};
		//end mouseout
	};
	//end tool_pencil
	//ev_canvas position relative to the canvas element.

	function ev_canvas(ev) {
		ev._x = ev.offsetX == undefined ? ev.layerX : ev.offsetX;
		ev._y = ev.offsetY == undefined ? ev.layerY : ev.offsetY;

		var func = tool[ev.type];
		if (func) {
			func(ev);
		}
	};
	//end ev_canvas position relative to the canvas element.

	//call init function
	init();
	//end call init function

	//mobile scroll disable
	var handleMove = function (e) {
		var scrollable = false;
		var items = $(e.target).parents();
		$(items).each(function (i, o) {
			if ($(o).hasClass("scrollable")) {
				scrollable = true;
			}
		});
		if (!scrollable) e.preventDefault();
	};

	document.getElementById('chalkboard').addEventListener('touchmove', handleMove, true);
	//end disable mobile scroll

	//chalkboard canvas mousemove close dialogs
	var $chalkboard = $('#chalkboard');
	$chalkboard.bind('mousemove', function () {
		$(".cpmessages").dialog("close");
	});
	//end chalkboard canvas mousemove close dialogs

	var $strengthslider0 = $('#strengthslider0');
	$strengthslider0.slider({
		value: getdata0,
		min: 0,
		max: 255,
		animate: true,
		orientation: "horizontal",
		slide: function (event, ui) {
			getdata0 = ui.value;
			$getcolor.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$cbfill.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$brushsel.css({
				'background': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});

			$colortext.html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
		}
	});

	var $strengthslider1 = $('#strengthslider1');
	$strengthslider1.slider({
		value: getdata1,
		min: 0,
		max: 255,
		animate: true,
		orientation: "horizontal",
		slide: function (event, ui) {
			getdata1 = ui.value;
			$getcolor.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$cbfill.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$brushsel.css({
				'background': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});

			$colortext.html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
		}
	});

	var $strengthslider2 = $('#strengthslider2');
	$strengthslider2.slider({
		value: getdata2,
		min: 0,
		max: 255,
		animate: true,
		orientation: "horizontal",
		slide: function (event, ui) {
			getdata2 = ui.value;
			$getcolor.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$cbfill.css({
				'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});
			$brushsel.css({
				'background': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
			});

			$colortext.html('<p>Color:rgb(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ')</p>');
		}
	});
	//end strength slider jquery ui plugin

	//opacity slider jquery ui plugin
	var $opacityslider = $('#opacslider');
	$opacityslider.slider({
		value: 9,
		min: 1,
		max: 9,
		animate: true,
		orientation: "vertical",
		slide: function (event, ui) {
			opacity = ui.value;
			$('.opacitytext').html('<p>Opacity Level: 0.' + opacity + '</p>');
			return opacity;
		}
	});
	//end opacity slider jquery ui plugin

	//opacity slider jquery ui plugin
	var $bsizeslider = $('#bsizeslider');
	$bsizeslider.slider({
		value: 1,
		min: 1,
		max: 150,
		animate: true,
		orientation: "vertical",
		slide: function (event, ui) {
			size = ui.value;
			var getcolor = $('.getcolor').css('background-color');
			$('.brushsize').removeClass('brushsel');
			$('.brushsize').css({
				'background': 'rgba(1, 1, 1, 0.2)'
			});
			$('.bchanger').addClass('brushsel');
			$('.ui-btn-text').css({
				'font-size': ui.value
			});
			$('.bchanger').attr('size', ui.value);
			$('.brushsel').css({
				'background': getcolor
			});
			$('.brushsizetext').html('<p>Brush Size:' + size + '</p>');
		}
	});


	//end opacity slider jquery ui plugin
	//init disable opacity slider
	// $( "#opacslider" ).slider({ disabled: true });
	//end init disable opacity slider
	var prevcursor = $('#chalkboard').css('cursor');

	//line tool click event
	var $cpline = $('.cpline');
	$cpline.bind('click, tap', function () {
		var $this = $(this);
		$this.toggleClass('useline');
		if ($(this).hasClass('useline')) {
			//$( "#opacslider" ).slider({ disabled: false });
			$chalkboard.css({
				'cursor': 'crosshair'
			});
		}
		else {
			//$( "#opacslider" ).slider({ disabled: true });
			$chalkboard.css({
				'cursor': prevcursor
			});
		}
	});
	//end line tool click event
	//bind invert
	var $invert = $('.invert');
	$invert.bind('click, tap', function () {
		var $this = $(this);
		$this.toggleClass('selectedoption');
	});
	//end bind invert
	//trace img backgrounds click event
	var $traceimgimg = $('.traceimg img');
	$traceimgimg.live('click, tap', function () {
		var $this = $(this);
		$traceimgimg.removeClass('selectedimg');
		$this.addClass('selectedimg');
	});
	//end trace img backgrounds click event
	//brush size click event
	var $brushsize = $('.brushsize');

	var $brushsizetext = $('.brushsizetext');
	$brushsize.bind('click, tap', function () {
		var $this = $(this);

		//var selcolor =  $brushsel.css('background-color');
		$brushsize.removeClass('brushsel');
		$brushsize.css({
			'background-color': 'rgba(1, 1, 1, 0.2)'
		});
		$this.addClass('brushsel');
		$brushsel = $('.brushsel');
		$brushsel.css({
			'background-color': 'rgba(' + (getdata0) + ',' + (getdata1) + ',' + (getdata2) + ', 0.' + (opacity) + ')'
		});
		var brushs = $this.attr('size');
		size = brushs;
		$brushsizetext.html('<p>Brush Size:' + size + '</p>');
		return size;


	});
	// end brush size click event
	//restore points

	function saveRestorePoint() {
		// Get the current canvas drawing as a base64 encoded value
		imgSrc = context.getImageData(0, 0, canvas.width, canvas.height);
		// and store this value as a 'restoration point', to which we can later revert
		restorePoints.push(imgSrc);
		if (restorePoints.length > 20) {
			restorePoints.shift();
		};

	}
	// Function to restore the canvas from a restoration point

	function undoDrawOnCanvas() {
		// If we have some restore points
		if (restorePoints.length > 0) {
			// The source of the image, is the last restoration point
			lastpixelData = restorePoints.pop();
			context.putImageData(lastpixelData, 0, 0);
			$cbminus.stop().fadeIn(500).delay(10).fadeOut(500);
		}
	}
	//end restore points
	var $cbundo = $('.cbundo');
	var $gradientroll = $('.gradientroll');
	var $dropperbrush = $('.dropperbrush');
	var $rectangletool = $('.rectangletool');
	var $brushsizetext = $('.brushsizetext');
	var $opacitytext = $('.opacitytext');
	var $colortext = $('.colortext');

	$cbundo.live('click', function () {

		undoDrawOnCanvas();
	});

	$gradientroll.live('click, tap', function () {
		var $this = $(this);
		$this.toggleClass('on');
		$dropperbrush.removeClass('on');
		$rectangletool.removeClass('on');
	});
	$dropperbrush.live('click, tap', function () {
		$opacityslider.slider({

			value: 1,
			animate: true
		});
		opacity = 1;
		$('.opacitytext').html('<p>Opacity Level: 0.' + opacity + '</p>');
		var $this = $(this);
		$this.toggleClass('on');
		$gradientroll.removeClass('on');
		$rectangletool.removeClass('on');
	});
	$rectangletool.live('click, tap', function () {
		var $this = $(this);
		$this.toggleClass('on');
		$gradientroll.removeClass('on');
		$dropperbrush.removeClass('on');

	});

	var $cpinfo = $('.cpinfo');
	var $savetoimage = $('.saveimage');
	var $asaveimage = $("a.saveimage");
	$cpinfo.live('mouseover', function () {
		var dataURL = canvas.toDataURL("image/png");
		document.getElementById("saveimage").src = dataURL;
		var sethref = $("#saveimage").attr('src');

		$savetoimage.attr('href', sethref);

	});
	$brushsizetext.html('<p>Brush Size:' + size + '</p>');
	$opacitytext.html('<p>Opacity Level: 0.' + opacity + '</p>');
	$colortext.html('<p>Color:rgb(' + rgb + ')</p>');

	$asaveimage.fancybox({
		type: 'image',
		overlayOpacity: 0.9,
		overlayColor: 'rgba(1,1,1,1)'
	});
	//hide line tool for ipad/iphone browsers
	// Redirect iPhone/iPod visitors
	if (navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i) || navigator.userAgent.match(/OS 6(_\d)+ like Mac OS X/i)) {
		// this helps detect minor versions such as 5_0_1
		$('.cpline').css({
			'display': 'none'
		});
		$('#top-menu').css({
			'display': 'none'
		});
	};

	//top-menu triggers
	var $image_upload = $('.image-upload');
	var $uploadify_button = $('.uploadify');
	var $save_image = $('.save-image');
	var $cpinfo = $('.cpinfo');
	var $cbundo = $('.cbundo');
	var $stroke_undo = $('.stroke-undo');
	var $image_invert = $('.image-invert');
	var $invert = $('.invert');

	$save_image.bind('click', function () {
		$cpinfo.trigger('mouseover');
		$cpinfo.trigger('tap');
		$cpinfo.trigger('click');

	});
	$stroke_undo.bind('click', function () {
		$cbundo.trigger('tap');
		$cbundo.trigger('click');

	});
	$image_invert.bind('click', function () {
		$invert.trigger('tap');
		$invert.trigger('click');

	});
	var $image_greyscale = $('.image-greyscale');
	var $greys = $('.greys');
	var $image_clear = $('.image-clear');
	var $clearcanv = $('.clearcanv');
	var $gradient_brush = $('.gradient-brush');
	var $gradientroll = $('.gradientroll');
	var $squer_brush_tool = $('.square-brush-tool');
	var $rectangletool = $('.rectangletool');
	$image_greyscale.bind('click', function () {
		$greys.trigger('tap');
		$greys.trigger('click');

	});
	$image_clear.bind('click', function () {
		$clearcanv.trigger('tap');
		$clearcanv.trigger('click');

	});
	$gradient_brush.bind('click', function () {
		$gradientroll.trigger('tap');
		$gradientroll.trigger('click');

	});
	$squer_brush_tool.bind('click', function () {
		$rectangletool.trigger('tap');
		$rectangletool.trigger('click');

	});
	var $dropper_brush = $('.dropper-brush');
	var $dropperbrush = $('.dropperbrush');
	var $line_tool = $('.line-tool');
	var $text_tool = $('.text-tool');
	var $cpline = $('.cpline');
	var $basic_brush = $('.basic-brush');
	var $texttool = $('.textwrite');
	var $fillclear = $('.fillclear');
	$dropper_brush.bind('click', function () {

		$dropperbrush.trigger('tap');
		$dropperbrush.trigger('click');

	});
	$line_tool.bind('click', function () {
		$cpline.trigger('tap');
		$cpline.trigger('click');

	});
	$text_tool.bind('click', function () {
		$texttool.trigger('tap');
		$texttool.trigger('click');

	});
	$basic_brush.bind('click', function () {
		$fillclear.find('div').removeClass('on');

	});

	//load google webfont
	WebFontConfig = {
		google: {
			families: ['Gorditas::latin', 'Butcherman::latin', 'Squada+One::latin', 'Simonetta::latin', 'Plaster::latin', 'Original+Surfer::latin', 'Oleo+Script::latin', 'Gorditas::latin', 'Fredoka+One::latin', 'Erica+One::latin', 'Princess+Sofia::latin', 'Sancreek::latin', 'Miniver::latin', 'Fascinate+Inline::latin', 'Nosifer::latin', 'Henny+Penny::latin', 'Happy+Monkey::latin', 'Lovers+Quarrel::latin', 'Montserrat::latin', 'Belleza::latin', 'Devonshire::latin', 'Emilys+Candy::latin', 'Ewert::latin', 'Press+Start+2P::latin', 'Belgrano::latin', 'Chicle::latin', 'Fascinate::latin', 'Monoton::latin', 'Gravitas+One::latin', 'Codystar::latin', 'Chango::latin', 'Fredericka+the+Great::latin', 'Homenaje::latin', 'Convergence::latin', 'Caesar+Dressing::latin', 'Aldrich::latin', 'Cantata+One::latin', 'Lobster::latin', 'Sarina::latin', 'Oldenburg::latin', 'Jolly+Lodger::latin', 'Marko+One::latin', 'Ruge+Boogie::latin', 'Karla::latin', 'Special+Elite::latin', 'Kaushan+Script::latin', 'Frijole::latin', 'Piedra::latin', 'Unlock::latin', 'Amatic+SC::latin', 'Spicy+Rice::latin', 'Audiowide::latin', 'Eater::latin', 'Lilita+One::latin', 'Holtwood+One+SC::latin', 'Zeyada::latin', 'Jockey+One::latin', 'Lobster+Two::latin', 'Flavors::latin', 'Irish+Grover::latin', 'Graduate::latin', 'IM+Fell+DW+Pica+SC::latin', 'Coustard::latin', 'Chewy::latin', 'Sniglet:800:latin', 'Love+Ya+Like+A+Sister::latin', 'Pacifico::latin', 'Geostar+Fill::latin', 'Passero+One::latin', 'Nova+Mono::latin', 'Vast+Shadow::latin', 'Rock+Salt::latin', 'Knewave::latin', 'Monofett::latin', 'Mystery+Quest::latin', 'Paytone+One::latin', 'Luckiest+Guy::latin', 'Gloria+Hallelujah::latin', 'Bubblegum+Sans::latin', 'Just+Me+Again+Down+Here::latin', 'Crafty+Girls::latin']
		}
	};
	(function () {
		var wf = document.createElement('script');
		wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
		wf.type = 'text/javascript';
		wf.async = 'true';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(wf, s);
	})();
	//type tool
	//bind button click to load typetool box
	$('.textwrite').bind('click', function () {
		$('.typeoptions').fadeIn(1000);
		$('.typeoptions').addClass('writing');
		$('.fillclear div').removeClass('on');
		$('.fillclear div').removeClass('useline');

	});



	$('.fillclear div').not('.dropperbrush').bind('click', function () {
		opacity = 9;
		$('#opacslider').slider({
			value: 9
		});
	});
	$('.fillclear div').not('.textwrite').bind('click', function () {

		$('.typeoptions').fadeOut(1000);
		$('.typeoptions').removeClass('writing');
	});
	$('.typeoptions').draggable();
	$('.textoptionsclose').bind('click', function () {
		$('.typeoptions').fadeOut(300);
		$('.typeoptions').removeClass('writing');
	});
	//loop font array add each option
	var font_list = ['Arial', 'Gorditas', 'Butcherman', 'Squada One', 'Simonetta', 'Plaster', 'Original Surfer', 'Oleo Script', 'Fredoka One', 'Erica One', 'Princess Sofia', 'Sancreek', 'Miniver', 'Fascinate Inline', 'Nosifer', 'Henny Penny', 'Happy Monkey', 'Lovers Quarrel', 'Montserrat', 'Belleza', 'Devonshire', 'Emilys Candy', 'Ewert', 'Press Start 2P', 'Belgrano', 'Chicle', 'Fascinate', 'Monoton', 'Gravitas One', 'Codystar', 'Chango', 'Fredericka the Great', 'Homenaje', 'Convergence', 'Caesar Dressing', 'Aldrich', 'Cantata One', 'Lobster', 'Sarina', 'Oldenburg', 'Jolly Lodger', 'Marko One', 'Ruge Boogie', 'Karla', 'Special Elite', 'Kaushan Script', 'Frijole', 'Piedra', 'Unlock', 'Amatic SC', 'Spicy Rice', 'Audiowide', 'Eater', 'Lilita One', 'Holtwood One SC', 'Zeyada', 'Jockey One', 'Lobster Two', 'Flavors', 'Irish Grover', 'Graduate', 'IM Fell DW Pica SC', 'Coustard', 'Chewy', 'Sniglet:800:latin', 'Love Ya Like A Sister', 'Pacifico', 'Geostar Fill', 'Passero One', 'Nova Mono', 'Vast Shadow', 'Rock Salt', 'Knewave', 'Monofett', 'Mystery Quest', 'Paytone One', 'Luckiest Guy', 'Gloria Hallelujah', 'Bubblegum Sans', 'Just Me Again Down Here', 'Crafty Girls'];

	$.each(font_list, function (index, item) {
		// do something with `item`
		$('#fontselect').append('<option value="' + item + '" style="font-family:' + item + ';" >' + item + '</option>');
	});


}); //end jQuery function