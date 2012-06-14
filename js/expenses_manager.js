//TODO: Strip away date header if same as previous
//TODO: Geolocation
//TODO: Currency converter
var ExpensesManager = {

	config: null,
	nextIndex: window.localStorage.getItem("nextIndex"),

	init: function(config) {
		ExpensesManager.config = config;
        // initialize the storage index
        if (!ExpensesManager.nextIndex) {
            window.localStorage.setItem("nextIndex", ExpensesManager.nextIndex = 1);
        }
	},

	addExpense: function(id) {
		var entry = {
			date: ExpensesManager.config.date,
			type: ExpensesManager.config.type,
			amount: ExpensesManager.config.amount,
			currency: ExpensesManager.config.currency,
			location: ExpensesManager.config.location,
			reason: ExpensesManager.config.reason
		};

		if (!id) {
			//add
			console.log('adding expense');
			entry.id = ExpensesManager.nextIndex;
			window.localStorage.setItem("nextIndex", ++ExpensesManager.nextIndex); //Only update index if add new
		} else {
			//update
			console.log('updating expense');
			entry.id = id;
		}
		window.localStorage.setItem("Expenses:" + entry.id, JSON.stringify(entry));
	},

	deleteExpense: function(id) {
		window.localStorage.removeItem("Expenses:" + id);
	},

	deleteAllExpenses: function() {
		if(confirm('Delete all expenses?')) {
			window.localStorage.clear();
			ExpensesManager.nextIndex = 1;
		}
	},

	getExpense: function(id) {
		var exp = localStorage.getItem("Expenses:" + id);
		return exp;
	},

	getAllExpenses: function() {
		var exp = [];
		if (localStorage.length > 0) {
            for (i = 0; i < window.localStorage.length; i++) {
                key = window.localStorage.key(i);
                if (/Expenses:\d+/.test(key)) {
                	exp.push(JSON.parse(window.localStorage.getItem(key)));
				}
            }
            // Sorting by date TODO: Break out to optional
			exp.sort(function(a, b) {
 				var dateA = new Date(a.date), dateB =new Date(b.date);
				return dateA - dateB;
			});
			exp.reverse();
		};		
		return exp;
	},

	renderAllExpenses: function() {
		//TODO: Refactor me
		var exp = ExpensesManager.getAllExpenses();
		var prevValue = null;
		var i = 0;
		var test;
		while(i < exp.length) {
			if (exp[i].date != prevValue) {
			test = true;
			} else {
				test = false;
			}
			prevValue = exp[i].date;
			if(test === false) { exp[i].date = '';}
			i++;
		}
		// Templating
		var source   = $("#expenses-template").html();
  		var template = Handlebars.compile(source);
  		var data = { expenses: exp };
  		$("#content-placeholder").html(template(data));
	},

	sendToServer: function(name, email, container) {
		var exp = ExpensesManager.getAllExpenses();
		var fullname = name.firstname + ' ' + name.lastname;
		console.log('json string ' + JSON.stringify(exp));
		
		// XHR Request
		$.mobile.showPageLoadingMsg() 
		var xhr = $.post("30template.php", { 'expenses': JSON.stringify(exp), 'name': fullname, 'email': email }, function(data) {
     		//alert("Data was successfully sent to server: " + data);
     		$.mobile.hidePageLoadingMsg();
     		console.log('download-link: ' + data);
     		$(container).html('An email was sent to you with your download-link.');
     		alert(data);
   		}).error(function() { alert("ERROR: Could not send data to server: " + xhr.status); });
	}

}