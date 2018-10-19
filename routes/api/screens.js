var express = require('express'),
	router = express.Router();

const Screen = require('../../model/screen');

module.exports=function(){

    router.get('/', (req, res) => {
        Screen.find({}, function(err, screens){
            if(err)
                    return err;
            else {
                res.json({screens: screens.map(s => s.name)});
            }
        })
    });
    
    router.post('/', (req, res) => {

        let { name, seatInfo: rows, update } = req.body;

        update = update === false || true;

        if(!name || !rows){
            res.status(403).send('Insuffucient Body Parameters');
            return;
        }
        else{
            Screen.findOne({name: name}, function(err, screen){
                if(err)
                    return err;
                else if(!screen) {
                    Screen.create({
                        name: name,
                        rows: Object.keys(rows).map(k => {
                            let row = rows[k],
                                { numberOfSeats: seatNum, aisleSeats } = row;

                            console.log(seatNum);
                            let seats = Array.apply(null, {length: seatNum}).map((e, i) => {
                                    return {
                                        id: i,
                                        available: true,
                                        aisle: aisleSeats.includes(i)
                                    }
                                })

                                console.log(seats);
    
                            return {
                                id: k,
                                seats: seats
                            }
                        })
                    }, function (err, scr) {
                        if (err) return handleError(err);
                        // saved!
                        res.json({s: 'p', screen: scr, updated: false});
                    })
                }
                else if(screen){
                    if(update){
    
                        screen.rows = Object.keys(rows).map(k => {
                            let row = rows[k],
                                { numberOfSeats: seatNum, aisleSeats } = row,
                                seats = Array.apply(null, {length: seatNum}).map((e, i) => {
                                    return {
                                        id: i,
                                        available: true,
                                        aisle: aisleSeats.includes(i)
                                    }
                                })
    
                            return {
                                id: k,
                                seats: seats
                            }
                        });
                        screen.save((err, scr) => {
                            if (err) return handleError(err);
                            // saved!
                            res.json({s: 'p', screen: scr, updated: true});
                        });
                        
                    } else {
                        res.status(403).send('Screen already Exists');
                        return;
                    }
                }
            });
        }

		
    });
    

    router.post('/:screenName/reserve', (req, res) => {
        let { seats } = req.body,
            { screenName } = req.params;

        if(!seats){
            res.status(403).send('Insuffucient Body Parameters. "seats" not found');
            return;
        }
            
        else{
            Screen.findOne({name: screenName}, function(err, screen){
                if(err)
                    return err;
                else if(!screen) {
                    res.status(403).send('Screen not Found');
                    return;
                }
                else {
                    let rowsArr = [...screen.rows];
                    for(let k of Object.keys(seats))
                    {
                        let row = rowsArr.find(e => e.id === k);
                        if(row){
                            let seatsArr = [...row.seats];
                            for(let id in seats[k]) {
                                let seat = seatsArr[id];
                                if(seat){
                                    if(seat.available){
                                        seat.available = false;
                                    }
                                    else {
                                        res.status(403).send(`Seat ${id} of Row ${k} is not Available`);
                                        return;
                                    }
                                }
                                else {
                                    res.status(403).send(`Seat ${id} of Row ${k} not found`);
                                    return;
                                }
                            }
                            row.seats = seatsArr;
                        }
                        else{
                            res.status(403).send(`Row ${k} not found`);
                            return;
                        }
                    }
                    screen.rows = rowsArr;
                    screen.save((err, scr)=>{
                        if(err) throw err;
                        res.json({s: 'p', d: scr});
                    })
                }
    
            });
        }

        
    });

    router.get('/:screenName/seats', (req, res) => {

        if(Object.keys(req.query).length > 2){
            res.status(403).send(`Invalid number of Queries found.`);
            return;
        }

        if(Object.keys(req.query).length === 0){
            res.status(403).send(`No Query String Found.`);
            return;
        }

        let { status, numSeats, choice } = req.query,
            { screenName } = req.params;

        if(status && (numSeats || choice)){
            res.status(403).send(`Invalid combination of Queries found.`);
            return;
        }
        else if(status) {
            
            let s;
            switch(status){
                case 'unreserved':
                    getUnreservedSeats(res, screenName);
                    break;
                case 'reserved':
                    getReservedSeats(res, screenName);
                    break;
                case 'all':
                    s = getAllSeats(res, screenName);
                    if(s) res.json({seats: s});
                    break;
            }
        }
        else if(numSeats && choice){
            getAvailableSeats(res, screenName, numSeats, choice);
        }
        else {
            if(numSeats){
                res.status(403).send(`Insufficient Queries found. "choice" missing.`);
                return;
            } else {
                res.status(403).send(`Insufficient Queries found. "numSeats" missing.`);
                return;
            }
        }       

        
       
    });


	return router;
}


function getUnreservedSeats(res, screenName){
    console.log(screenName);
    Screen.findOne({name: screenName}, function(err, screen){
        if(err)
            throw err;
        else if(!screen) {
            
            res.status(403).send('Screen not Found');
            return false;
        }
        else {
            let a = {}
            screen.rows.forEach((e) => {
                a[e.id] = e.seats.filter(e => e.available).map(e => e.id) 
                //console.log(a);    
            })
            res.json({seats: a});
        }
    });
}

function getReservedSeats(res, screenName){
    Screen.findOne({name: screenName}, function(err, screen){
        if(err)
            throw err;
        else if(!screen) {
            res.status(403).send('Screen not Found');
            return;
        }
        else {
            let a = {}
            screen.rows.forEach((e) => {
                a[e.id] = e.seats.filter(e => !e.available).map(e => e.id) 
                //console.log(a);  
            })
            res.json({seats: a});
        }
    });
}

function getAllSeats(res, screenName){
    Screen.findOne({name: screenName}, function(err, screen){
        if(err)
            throw err;
        else if(!screen) {
            res.status(403).send('Screen not Found');
            return;
        }
        else {
            res.json({
                seats: screen.rows.reduce((a, e) => {
                    return {...a, [e.id]: e.seats.map(e => { return {available: e.available, aisle: e.aisle}})}   
                }, {})
            });
        }
    });
}

function getAvailableSeats(res, screenName, numSeats, choice){
    Screen.findOne({name: screenName}, function(err, screen){
        if(err)
            throw err;
        else if(!screen) {
            res.status(403).send('Screen not Found');
            return;
        }
        else {
            let choiceRow = choice[0],
                choiceSeat = parseInt(choice.slice(1,));

            let row = screen.rows.find(e => e.id = choiceRow);
            if(!row){
                res.status(403).send(`Row ${choiceRow} not found`);
                return;   
            }
            else{
                if(!row.seats[choiceSeat].available || choiceSeat < 0 || choiceSeat >= row.seats.length){
                    res.status(403).send(`Unable to find required Seats`);
                    return;
                } 
                    
                
                let count = numSeats - 1,
                    i = choiceSeat - 1,
                    j = choiceSeat + 1,
                    arr = [choiceSeat];


                while(count > 0){
                    //lookLeft
                    if(i >= 0){
                        if(row.seats[i].available){
                            count--;
                            arr.unshift(i);
                        }
                        if(row.seats[i].aisle || !row.seats[i].available)
                            i = 0;
                        i--;
                    }
                    //lookRight
                    if(j < row.seats.length){
                        if(row.seats[j].available){
                            count--;
                            arr.push(j);
                        }
                        if(row.seats[j].aisle || !row.seats[j].available)
                            j = 0;
                        j++;
                    }

                    if(i < 0 && j >= row.seats.length)
                        break;
                } 
                if(count > 0){
                    res.status(403).send(`Unable to find required Seats`);
                    return;
                }
                else
                    res.json({availableSeats: { [choiceRow] : arr }}); 
            }
        }
    });
}