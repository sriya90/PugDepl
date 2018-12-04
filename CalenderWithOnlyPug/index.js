const express = require('express')
const app = express()
const port = process.env.PORT|| 8000 

var mongoose = require('mongoose');
mongoose.connect('mongodb://sriya:Asdf1234@ds137862.mlab.com:37862/events');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
      const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');
var eventSchema = new mongoose.Schema({
  startDate:     { type: String,  required: true },
  name:      { type: String,  required: true },
  description :  { type: String, required: true },
  location :  { type: String, required: true }
});
var eventsDB = mongoose.model('events', eventSchema);
var currentYear;
var currentMonth;
var currentDate;
var curId;
var db = mongoose.connection;
 var events =[]
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  app.get('/', (req, res) => {
      var d = new Date();
      var months = new Date(d.getYear(), d.getMonth(), 0).getDate();
       var date = new Date(d.getYear(), d.getMonth(), 1);
     console.log(createCal(d.getYear(), d.getMonth())) ;
      currentYear = (new Date()).getFullYear();
      currentMonth = d.getMonth();


     var hey = createCal(d.getYear(), d.getMonth());
      console.log("BBefore sending");
     
res.render('index', { days:d.getYear(),startDay:d.getMonth(),calArray:hey ,currentMonthYear:monthNames[d.getMonth()]+' '+currentYear});
    

});
      
     
    
 
function queryCollection(collection, callback){
    console.log(collection);
    console.log(currentYear);
  console.log(currentMonth);
       currentDate=collection+'-'+currentMonth+'-'+currentYear;
    console.log(currentDate)
    currentDate='1-11-2018'
                    db.collection('events').find({startDate: currentDate}).toArray( function (err, items) {
                       events.push(items);
                        callback();
                    });
	
}
 

    
      app.get('/nextMonth', (req, res) => {
          
          if(currentMonth==11)
              {
                  currentMonth=0;
                  currentYear++; 
              }
          else
              currentMonth++;
             
     var hey = createCal(currentYear, currentMonth);
    
   
         
    res.render('index', { calArray:hey ,currentMonthYear:monthNames[currentMonth]+' '+currentYear})
  });
    
    
      app.get('/prevMonth', (req, res) => {

          if(currentMonth==0)
          {
              currentYear--;
              currentMonth =11;
          }else
              currentMonth--;
     var hey = createCal(currentYear, currentMonth);
    
       

    res.render('index', { calArray:hey ,currentMonthYear:monthNames[currentMonth]+' '+currentYear})
  });
 
    
function createCal(year, month) {
		var day = 1, i, j, haveDays = true, 
				startDay = new Date(year, month, day).getDay(),
				daysInMonth = [31, (((year%4===0)&&(year%100!==0))||(year%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
				calendar = [];
               
console.log(year)
    console.log(month)
   console.log( daysInMonth[month])
		i = 0;
		while(haveDays) {
			calendar[i] = [];
			for (j = 0; j < 7; j++) {
				if (i === 0) {
					if (j === startDay) {
						calendar[i][j] = day++;
                       
                            
						startDay++;
					}
				} else if ( day <= daysInMonth[month]) {
					calendar[i][j] = day++;
                  
            
				} else {
					calendar[i][j] = "";
					haveDays = false;
				}
				if (day > daysInMonth[month]) {
					haveDays = false;
				}
			}
			i++;
		}	
		
		

		return calendar;
	}
    
    function findEvents()
    {
        var meevents=[];
        for(var i=0;i<31;i++)
            {
                meevents[i]=[];
                 currentDate=i+'-'+currentMonth+'-'+currentYear;
                currentDate = currentDate.toString();
                    console.log(currentDate);
                currentDate='1-11-2018';
                    db.collection('events').find({startDate: currentDate}).toArray( function (err, items) {
                        meevents[i]=items;
                 
                    });
              
            }
        console.log(meevents);
        return meevents;
       
    }
  app.get('*/:id/event/new', (req, res) => {
    var dStart=req.params.id+'-'+monthNames[currentMonth]+'-'+currentYear;
      console.log(dStart);
    res.render('event-form', {title: "New Event For "+dStart, event:{} })
  });

    app.get('/calEvent/:id/getting', (req, res) => {
    let id = req.params.id
    curId =  req.params.id
       currentDate=id+'-'+monthNames[currentMonth]+'-'+currentYear;
        db.collection('events').find({startDate: currentDate.toString()}).toArray( function (err, items) {
        console.log(items);
          res.render('list-detail', { title: "Daily List of Events for "+currentDate,eventsOfTheDay:items })
    });

  });
    
  app.get('/books/:id/update', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)
    
    eventsDB.findById(id, function(err, book) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (book === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('event-form', { title: "Update Book", book: book })
        }
      }
    });
  });
     
  app.post('*/:id/event/new', function(req, res, next) {
      req.body.startDate=currentDate;
    let newBookSave = new eventsDB(req.body);
      newBookSave.startDate=currentDate;
      console.log(currentDate);
      console.log(newBookSave);
    newBookSave.save(function(err, savedBook){
      if (err) {
        console.log(err)
        res.render('event-form', { event: newBookSave, error: err })
      } else {
        res.redirect('/calEvent/' + curId+'/getting');
      }
    });
  });

  app.get('/events/:id/update', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    eventsDB.findById(id, function(err, events) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (events === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('event-form', {  title: "Update Event",event: events})
        }
      }
    });
  });

  app.post('/events/:id/update', function(req, res, next) {
    let id = ObjectID.createFromHexString(req.params.id)
    eventsDB.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        res.redirect('/calEvent/' + curId+'/getting');
      }
    });
  });

  app.get('/events/:id/delete', function (req, res) {
    let id = ObjectID.createFromHexString(req.params.id)
    eventsDB.deleteOne({_id: id}, function(err, product) {
     res.redirect('/calEvent/' + curId+'/getting');

    });
  });

  app.post('/api/books', (req, res) => {
    console.log(req.body)
    let newBook = new Book(req.body)

    eventsDB.save(function (err, savedReview) {
      if (err) {
        console.log(err)
        res.status(500).send("There was an internal error")
      } else {
        res.send(savedReview)
      }
    });
  });

  app.get('/api/books', (req, res) => {
    Review.find({}, function(err, reviews) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.send(reviews)
      }
    });
  });

  app.get('/api/books/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Review.findById(id, function(err, review) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        if (review === null) {
          res.status(404).send("Not found")
        } else {
          res.send(review)
        }
      }
    });
  });

  app.put('/api/books/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Review.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.status(204).send()
      }
    });
  });

  app.delete('/api/books/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Review.deleteOne({"_id": id}, function(err) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.status(204).send()
      }
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
