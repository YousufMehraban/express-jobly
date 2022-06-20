const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// the function takes two objects as the arguments. 
// at first create  a list from keys of the object 
// {firstName: 'Aliya', age: 32} => ['firstName', 'age'] 

// if the provided objec doesn't have any data, it throws BadRequest Error. 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

// map over array of keys, and return another array.
// ['firstName', 'age'] =>  ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // we join all items of the array by "," comma ['"first_name"=$1', '"age"=$2'], 
  // and return an object 
  // {'setCols': '"first_name"=$1, "age"=$2', values: ['Aliya', 32]}
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
