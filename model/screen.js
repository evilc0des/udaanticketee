var mongoose = require('mongoose');

var screenSchema = mongoose.Schema({
    name: String,
    rows: [
        {
            id: String,
            seats: [
                {
                    id: Number,
                    available: Boolean,
                    aisle: Boolean
                }  
            ]
        }
    ]

});

// create the model for stores and expose it to our app
module.exports = mongoose.model('Screen', screenSchema);