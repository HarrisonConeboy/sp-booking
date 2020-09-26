# Booking Challenge

## Assumptions
- The times given in availability can book any type of appointment as time is not taken into account
- Counsellors can login
- Dates supplied will be of the ISO-8601 format
- No two counsellors have the same first and last name

## Implementation
- I used the relational database PostgreSQL as we are working with structured data, through the cloud service ElephantSQL for minimal setup. The database credentials are located in the .env file which would usually be included in the .gitignore. 
- The database was initialized through the included python script, as Node's asynchronous nature creates connections exceeding the total number of allowed connections to the database. Thus synchronous-blocking queries were needed.
- Tables in database are setup with foreign keys referencing the users table. This means that if any user is removed, then all of their associated information will delete on cascade. See comments in api.route.js to see how tables were initialized
- All data in the database is sanitized and lowercased to ensure secure and robust queries
- User credentials are stored in a separate table with salted+hashed passwords using bcrypt, further ensuring security
- I choose the HTTP Authorization header over jwt tokens or sessions, as this lended to an easier UX by only needing to provide minimal info
- `GET` requests for availability returns a list of `FirstName, LastName, Availability` of the available counsellors, prepared to be displayed in a table
- `POST` requests being a transaction, if every datetime within the body is valid then the transaction is committed, else it is aborted. This is a way of all-or-nothing to ensure duplicate slots won't be added on a failed `POST`
- Testing the endpoints was done via the third party app - `POSTMAN` alongside manual observations

## Instructions
- Run the server using `node src/server` or `npm start` within the root directory, this will run the server on `http://localhost:5000`. 
- To view available times send a `GET` request to `http://localhost:5000/api/:date_range/:aptType/:aptMedium` with the appropriate parameters in the URL.
- date_range should be of the form: `date1,date2`
- To `POST` a new availability slot, send a request to `http://localhost:5000/api/add` with a list of json objects of the form: `{"datetime": your_datetime}` with an authorization header of the form: `firstName-lastName:password`
- Passwords for all users are 'password'
