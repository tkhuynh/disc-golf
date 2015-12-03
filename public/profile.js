$(function() {
	console.log('profile script');

	var courseData;
	var eventData;
	var courseSource = $('#course-template').html();
	var courseTemplate = Handlebars.compile(courseSource);
	var courseHTML = courseTemplate({ courses: courseData	});
	var eventSource = $('#events-template').html();
	var eventsTemplate = Handlebars.compile(eventSource);
	var eventHTML = eventsTemplate({ events: eventData });
	//var defaultEventState = [];

	// populate events column on page load
	//getCurrentDate();
	//getEvents(defaultEventDate);

	// get current date and 3 months from today
	// function getCurrentDate() {
	// 	var today = new Date();
	// 	var day = ('0' + (today.getDate())).slice(-2);
	// 	var month = ('0' + ((today.getMonth()) + 1)).slice(-2);
	// 	var year = (today.getFullYear());
	// 	var futureMonth;
	// 	var futureYear = year;
	// 	if (month > 9) {
	// 		futureMonth = ('0' + (((today.getMonth()) - 8))).slice(-2);
	// 		futureYear = (today.getFullYear() + 1);
	// 	} else {
	// 		futureMonth = ('0' + ((today.getMonth()) + 1)).slice(-2);
	// 	}
	// 	today = month + '/' + day + '/' + year;
	// 	future = futureMonth + '/' + day + '/' + futureYear;
	// 	defaultEventDate.push(today, future);
	// 	console.log('defaultEventDate', defaultEventDate);
	// }


	// Generate Calender
	// function generateCalender() {
	// 	var currentYear = (new Date()).getFullYear();
	// 	console.log('currentYear', currentYear);
	// 	for (i = currentYear; i < (currentYear + 5); i++) {
	// 		$('#startYear').append('<option value=' + i + '>' + i + '</option>');
	// 		$('#endYear').append('<option value=' + i + '>' + i + '</option>');
	// 	}
	// 	for (i = 1; i < 32; i++) {
	// 		$('#startDay').append('<option value=' + i + '>' + i + '</option>');
	// 		$('#endDay').append('<option value=' + i + '>' + i + '</option>');
	// 	}
	// }
	// generateCalender();
 	
	var year = new Date();
	year = year.getFullYear();

	function saveZipCode() {
		var zipCode = localStorage.getItem('zipCode');
		if (zipCode.match(/\d/)) {
			var checkZipCode = window.location.search.substring(1);
			checkZipCode = checkZipCode.split('=')[1];
			if(checkZipCode) {
				var zipCodeUrl = (window.location.search.substring(1));
				zipCode = zipCodeUrl.split("=")[1];
				localStorage.setItem('zipCode', zipCode);
				return;
			} else {
				zipCode = localStorage.getItem('zipCode');
				localStorage.setItem('zipCode', zipCode);
				return;
			}	
		} else {
				var newZipCodeUrl = (window.location.search.substring(1));
				zipCode = newZipCodeUrl.split("=")[1];
				localStorage.setItem('zipCode', zipCode);
			}
	}		

	saveZipCode();

	// GET route for local courses
	$.get('/courses', {
		zip: localStorage.getItem('zipCode')
	}, function(data) {
		courseData = data.courses;
		courseHTML = courseTemplate({
			courses: courseData
		});
		$('.coursesDiv').append(courseHTML);
		$('.courseDetailsDiv').hide();
		var courseState = ('courseState',courseData[0].state_province);
		getEvents(courseState);
	});

	//GET route for local events
	function getEvents(state) {
		var eventQuery = state;
		$.get('/events', {state: eventQuery}, function(data) {
			eventData = data.events;
			formatDates(eventData);
			console.log(eventData[0].start_date);
			eventHTML = eventsTemplate({
				events: eventData
			});
			$('.eventsDiv').append(eventHTML);
			console.log(eventData);
		});
	}

	//show course details
	$('.coursesDiv').on('click', '.moreInfo', function(event) {
		var courseId = $(this).closest('.courseList').attr('data-id');
		$("#"+courseId).toggle();
	});

	function formatDates(arr) {
		for (i = 0; i < arr.length; i++) {
			var formatedStartDate = (arr[i].start_date).split("-");
			var formatedEndDate = (arr[i].end_date).split("-");
			formatedStartDate = formatedStartDate[1]+'-'+formatedStartDate[2]+'-'+formatedStartDate[0];
			formatedEndDate = formatedEndDate[1]+'-'+formatedEndDate[2]+'-'+formatedEndDate[0];
			arr[i].start_date = formatedStartDate;
			arr[i].end_date = formatedEndDate;
		}
		return arr;
	}
});

