$(document).ready(function() {

//countdown timer
$(function() {
	var countDown = null;
	var minutes = 25;
	var seconds = "0" + 0;
	$('body').on('click', (function(event) {
		var clicked = $(event.target);
		if (clicked.is('#startButton')) {
			countDown = true;
			$('h4').replaceWith('<h4><div id="pauseButton">Pause Timer</div></h4>');
			}
		if (clicked.is('#pauseButton')) {
			countDown = false;
			$('h4').replaceWith('<h4><div id="startButton">Start Timer</div></h4>');
			}
		if (clicked.is('#resetButton')) {
			countDown = false;
			minutes = 25;
			seconds = "0" + 0;
			countDown = true;
			$('h4').replaceWith('<h4><div id="pauseButton">Pause Timer</div></h4>');
			}
		}));
	setInterval(function(){
		if (countDown) {	
			seconds = seconds - 1;
			if (seconds < 0) {
			seconds = 59
			minutes = minutes - 1};
			if (seconds < 10) {
			seconds = "0" + seconds;
			}
			if (seconds == 0 && minutes == 0) {
				countDown = false;
				alert("Time to take a break! You've earned it.");
				minutes = 5;
				countDown = true;
				}
			$('h1').text(minutes + " : " + seconds);
			}}, 1000);
});	

//sortable & drag-and-drop task lists
$(function() {
    $( ".list1, .list2, .list3" ).sortable({
      connectWith: $('.list1, .list2, .list3')
    }).disableSelection();
  });

//click events for each section	
	$('body').on('click', (function(event) {
		var clicked = $(event.target);
		var task = {};
		if (clicked.is('#button')) {
			task.toAdd = $('input[name=checkListItem]').val();
			$('.list1').append('<li>' + task.toAdd + '</li>');
			$('input[name=checkListItem]').val('');
			return true;
		}
		if (clicked.is('.list1 li')) {
			var toAdd = clicked.text();
			clicked.fadeOut('fast');
			$('.list2').append('<li>' + toAdd + '</li>');
			// ('.list1 li').remove();
			}
		if (clicked.is('.list2 li')) {
			var toAdd = clicked.text();
			$('.list3').append('<li>' + toAdd + '</li>');
			clicked.fadeOut('fast');
			// ('.list2 li').remove();
		}
		if (clicked.is('.list3 li')) {
			(clicked).remove();
			}
		}));
	
//highlight items in list when mouse hovers	
	$('div').hover(function() {
		$(this).addClass('highlight');
	}, function() {
		$(this).removeClass('highlight');
	});
	$('.list3 li').hover(function() {
		$(this).css('background-color', '#CC0000');
		}, function() {$(this).css('background-color','#eeeeee')})
	
	
//enter key adds task to list	
	$(document).keydown(function(e) {
		if (e.keyCode === 13) {
			$('#button').click();
			return false;
		}
	});
});
