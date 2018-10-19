import React, { Component } from 'react';
import axios from 'axios';
import { Form, Text, Select, NestedField } from 'react-form';
import './AddScreenForm.css';


function genCharArray() {
    var a = [], i = "A".charCodeAt(0), j = "Z".charCodeAt(0);
    for (; i <= j; ++i) {
      a.push({
          value: String.fromCharCode(i),
          label: String.fromCharCode(i)
        });
    }
    return a;
  }

class AddScreenForm extends Component {


  handleSubmit(values){
      console.log(values);
      let data = {
          name: null,
          seatInfo: {}
      }

      data.name = values.name;
      values.rows.forEach(v => {
        data.seatInfo[v.id] = {
            numberOfSeats: v.seatNum,
            aisleSeats: v.aisleSeats ? v.aisleSeats.split(',').map(e => parseInt(e.trim())) : []
        }
      });


      axios.post('/screens', data)
      .then((response) => {
          if(response.status == 200){
            if(!response.data.updated) this.props.addScreen(response.data.screen.name);
          }
      })
      .catch((error) => {
        console.log(error);
      });

  }
    
  render() {
    return (
        <div className="add-screen-form-container">
            <h1>Add Screen Form</h1>
            <Form
            onSubmit={submittedValues => this.handleSubmit(submittedValues)}>
            { formApi => (
              <div>
                <button
                  onClick={() => formApi.addValue('rows', {})}
                  type="button"
                  className="mb-4 mr-4 btn btn-success">Add Row</button>
                <form onSubmit={formApi.submitForm} id="dynamic-form">
                  <label htmlFor="dynamic-first">Screen Name</label>
                  <Text field="name" id="dynamic-first" required/>
                  { formApi.values.rows && formApi.values.rows.map( ( row, i ) => (
                    <div key={`sibling${i}`}>
                        <label htmlFor={`row-id-${i}`}>Row: </label>
                        <Select field={['rows', i, "id"]} id={`row-id-${i}`} options={genCharArray()} 
                        validate={value => ({
                            error: !value || formApi.values.rows.some((r, j )=> (j !== i && r.id === value))? "This row is already entered" : null
                        })}/>
                        
                        <label htmlFor={`row-seatNum-${i}`}>Number Of Seats: </label>
                        <Text field={['rows', i, "seatNum"]} id={`row-seatNum-${i}`} type="number" min="1" required></Text>
                        
                        <label htmlFor={`row-aisleSeats-${i}`}>Aisle Seats(Separated by comma): </label>
                        <Text field={['rows', i, "aisleSeats"]} id={`row-aisleSeats-${i}`}
                            validate={value => ({
                                error: value && !/(^$)|(^(\d+)(\s*,\s*\d+)*$)/.test(value)? "Must be a Comma separated list of positive numbers" : null
                            })}
                        ></Text>
                        <button
                            onClick={() => formApi.removeValue('rows', i)}
                            type="button"
                            className="mb-4 btn btn-danger">Remove</button>
                        <p>{ formApi.errors && formApi.errors.rows[i] && formApi.errors.rows[i].id }</p>
                        <p>{ formApi.errors && formApi.errors.rows[i] && formApi.errors.rows[i].aisleSeats }</p>
                    </div>
                  ))}
                  <button type="submit" className="mb-4 btn btn-primary">Submit</button>
                </form>
              </div>
            )}
          </Form>
        </div>
      
    );
  }
}

export default AddScreenForm;