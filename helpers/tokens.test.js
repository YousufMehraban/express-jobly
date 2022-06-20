const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");
const {sqlForPartialUpdate} = require('./sql')

describe("createToken", function () {
  test("works: not admin", function () {
    const token = createToken({ username: "test", is_admin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  test("works: admin", function () {
    const token = createToken({ username: "test", isAdmin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });
});


describe('testing Partial Update', function(){
  test('test sqlForPartialUpdate function', function(){
    const result = sqlForPartialUpdate({username: 'khan', age: 33}, {})
    expect(result).toEqual( {setCols: '"username"=$1, "age"=$2', values: ['khan', 33],} )
  })
  // checking the data of values key of the returned object if its an array.
  test('testing part of return value', function(){
    const result = sqlForPartialUpdate({name: 'ali', age: 50}, {})
    expect(result.values).toEqual(expect.any(Array))
    expect(typeof(result.values)).toBe('object')
    expect(result.values).toEqual(['ali', 50])
  })
  test('error', function(){
    const result = sqlForPartialUpdate({name: 'ali', age: 50}, {})
    expect(result).not.toEqual({})
  })
})

