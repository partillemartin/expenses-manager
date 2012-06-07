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
			entry.id = ExpensesManager.nextIndex;
			window.localStorage.setItem("nextIndex", ++ExpensesManager.nextIndex); //Only update index if add new
		} else {
			//update by removing it from array
			entry.id = id;
		}
		window.localStorage.setItem("Expenses:" + entry.id, JSON.stringify(entry));
	},

	deleteExpense: function(id) {
		window.localStorage.removeItem("Expenses:" + id);
	},

	deleteAllExpenses: function() {
		if(confirm('sure?')) {
			window.localStorage.clear();
			ExpensesManager.nextIndex = 1;
		}
	},

	getAllExpenses: function() {
		var exp = [];
		if (localStorage.length > 0) {
            for (i = 0; i < window.localStorage.length; i++) {
                key = window.localStorage.key(i);
                if (/Expenses:\d+/.test(key)) {
                	//console.log(JSON.parse(window.localStorage.getItem(key)));
                	exp.push(JSON.parse(window.localStorage.getItem(key)));
				}
            }
            // Sorting by date
            console.log(exp);
			exp.sort(function(a, b) {
 				var dateA = new Date(a.date), dateB =new Date(b.date);
				return dateA - dateB;
			});
			exp.reverse();
			console.log(exp);
		};		
		return exp;
	},

	renderAllExpenses: function() {
		var exp = ExpensesManager.getAllExpenses();
		for (i = 0; i < exp.length; i++) {
			if (i > 0 && exp[i].date == exp[i - 1].date)
				exp[i].date = "";
		}
		// Templating
		var source   = $("#expenses-template").html();
  		var template = Handlebars.compile(source);
  		var data = { expenses: exp };
  		$("#content-placeholder").html(template(data));
	},

	sendToServer: function() {
		var exp = ExpensesManager.getAllExpenses();
		console.log('json string ' + JSON.stringify(exp));
		// XHR Request
		var xhr = $.post("http://localhost/expenses-manager/30template.php", { 'expenses': JSON.stringify(exp) }, function(data) {
     		alert("Data was successfully sent to server");
   		}).error(function() { alert("ERROR: Could not send data to server: " + xhr.status); });
	}

}

//Helpers
Array.findAndRemove = function(array, index) {
	for (var i = array.length - 1; i >= 0; i--) {
		tmpObj = JSON.parse(array[i]);
		if (index == tmpObj.id)
			Array.remove(array, i);
	};
	return array;
}

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};