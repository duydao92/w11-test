# Express Application Assessment

## Approved Documentation
* [ExpressJS Documentation](https://expressjs.com/)
* [Pug Documentation](http://pugjs.org/)
* [csurf Library Documentation](https://github.com/expressjs/csurf#readme)
* [Sequelize Documentation](https://sequelize.org/v5/)
* [Sequelize Cheatsheet](./documentation/sequelize_cheatsheet.md)

**Note:** To read this in a rendered view, open your VS Code Command Palette
(using Control+Shift+P on Windows, Command+Shift+P on macOS) and choose
"Markdown: Open Preview" or "Markdown: Open Preview to Side".

In this assessment, you are asked to create an Express application. You will
create an Express application that

* Has a page that shows a list of entrees
* Has a page that allows you to add an entree
* Is protected from Cross-Site Request Forgeries

In the **documentation** directory, you will find

* A picture of the data model
* A screenshot of the entree listing page
* A screenshot of the entree creation form

The screenshots show you what is expected from a _structure_ standpoint. They
are meant to be guides. The tests will _not_ make any assertions about the
styling of your pages, merely the structure of the pages and the data presented
on them.

Use the technologies you have used up to this point. They are all installed in
the **package.json** for your convenience.

* Express.js
* pg (the library to connect to PostgreSQL), Sequelize, and Sequelize CLI
* CSURF middleware
* Pug.js
* cookie-parser middleware
* nodemon (for development purposes)

A **package.json** file already exists with the dependencies. Please run `npm
install` to install those before doing your development and running your tests.
Do not remove any dependencies already listed in the **package.json**.

## Getting started

Download the repository from
https://github.com/appacademy/assessment-express-application-a.

Run `npm install` to install the dependencies listed in the last section.

## Running the application

You can run your application in "dev" mode. The **nodemon** package is installed
and runnable from `npm run dev`.

## Running the tests

This is "black-box testing". The tests will _only_ use your Express application.
It will not make connections to the database or directly test your route
handlers. They will merely make HTTP requests of your Express app and analyze
the responses.

To ease your development, tests will run against your **development** database
and _not_ the test database.

**You** will be responsible for creating, migrating, and seeding the data in
your development database.

Run your tests with `npm test`. You can run `npm test test/test-file-name.js`
to run the tests for a specific part of the assessment.
  - Example: To only run the test `01-form-page.js` do, 
    `npm test test/01-form-page.js`

If you get tired of seeing all of the Sequelize failures, you can try running:

```
npm test 2> /dev/null
``` 

That should redirect the annoying messages into oblivion but leave the
mocha output available for you to read. This may prevent you from seeing other
errors, though, so make sure to run it without the `2> /dev/null` if you're 
trying to get a test to pass and need to see error output.

## App Requirements

These are the requirements for the application. Follow them closely. The tests
will attempt to read data from your rendered HTML. 

Read all of the requirements. Determine the data needed to include in your data
model.

Please use port 8081 for your Express.js server.

### The database

Create a database user with `CREATEDB` priveleges:
* The login username that you must use is "app_academy"
* The login password that you must use is "password"

**Note**: You should _never_ set the password of a database user to something so
easy to guess. This is merely for the convenience of grading this assessment.

Initialize Sequelize in your assessment and use the following configuration in
your `config/config.json` file:

```json
{
  "development": {
    "username": "app_academy",
    "password": "password",
    "database": "express_assessment_development",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "seederStorage": "sequelize",
    "logging": false
  }
}
```

Remove `logging: false` if you want to see SQL output in your terminal when 
running tests with `npm test`. 

Create the `development` database with those configurations.

For this assessment, the tests will be using your `development` database
configuration defined in the `config.json` file. **The tests will not be
testing your database explicitly, but test specs DO rely on you setting up the
database AND database constraints properly.** 

You will need to generate and run the migrations, models, and seeders. There is 
no need to run `npm test` until after doing this.

### The data model

Here is a picture of the data model used in this assessment.

![data model]

You will need to store "Entree" data and "EntreeType" data. 

Generate a model (and migration) for the "EntreeType" model with the attributes:

| Attribute name | Attribute type | Sequelize datatype | Constraints          |
|----------------|----------------|--------------------|----------------------|
| name           | string         | STRING(20)         | unique, not nullable |
| isVegetarian   | boolean        | BOOLEAN            | not nullable         |

Configure the migration so that:

- the "name" column will hold values up to 20 characters in length and be unique
  and not allow `NULL`s
- the "isVegetarian" column will not allow `NULL`s

Generate a model (and migration) for the "Entree" model with the attributes:

| Attribute name | Attribute type | Sequelize datatype | Constraints                          |
|----------------|----------------|--------------------|--------------------------------------|
| name           | string         | STRING(70)         | unique, not nullable                 |
| description    | text           | TEXT               |                                      |
| price          | numeric        | NUMERIC(6, 2)      | not nullable                         |
| entreeTypeId   | integer        | INTEGER            | not nullable, references EntreeTypes |

Configure the migration so that:

- the "name" column will hold values up to 70 characters in length and be unique
  and not allow `NULL`s
- the "price" column will not allow `NULL`s and have a precision of (6, 2) to 
  support numbers like XXXX.XX 
- the "entreeTypeId" will not allow `NULL`s and references the "EntreeTypes"
  table

Create a seeder file for `EntreeTypes`:

```js
{ name: "Beef",  isVegetarian: false, createdAt: '2019-04-12', updatedAt: '2019-04-12'},
{ name: "Chicken",  isVegetarian: false, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
{ name: "Goat",  isVegetarian: false, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
{ name: "Jackfruit",  isVegetarian: true, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
{ name: "Plant-based",  isVegetarian: true, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
{ name: "Pork",  isVegetarian: false, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
{ name: "Soy",  isVegetarian: true, createdAt: '2019-04-12', updatedAt: '2019-04-12' },
```

If you set up the seeder correctly, the `EntreeTypes` data should have the
following pre-defined data in it:

| name        | isVegetarian |
|-------------|--------------|
| Beef        | False        |
| Chicken     | False        |
| Goat        | False        |
| Jackfruit   | True         |
| Plant-based | True         |
| Pork        | False        |
| Soy         | True         |

**NOTE:** All of the data constraints for this assessment can be handled by the
database with the `allowNull` and `unique` flags in your migrations. You **do
not** need to use form validations in this project. They are good to have, in
real applications, but can require too much time for you to integrate them into
this project. Again, you **do not** need to use a form validator, just use
database constraints and let the errors turn into 500 status codes by Express.

Make sure to make the appropriate associations.

After you've generated your models, migrations, and seeder files, don't forget
to migrate and seed your database with the appropriate Sequelize CLI commands.

### Your main file

You must use the **app.js** file to create and configure your Express
application. You must store the instance of your Express.js application in a
variable named `app`. That is what is exported at the bottom of the **app.js**
file.

Set up your CSRF middleware to use cookies.

### The route "GET /entrees/new"

This page shows a form in which a person can add a new entree. The form must
have

* a method of "post"
* an action of "/entrees"

In the form, you should have these inputs with the provided names:

| Field HTML name | Field type       | Constraints | Default values                             |
|-----------------|------------------|-------------|--------------------------------------------|
| name            | single-line text | required    |                                            |
| description     | multi-line text  |             |                                            |
| price           | number           | required    |                                            |
| entreeTypeId    | dropdown         | required    | One of the pre-defined entree type names   |
| _csrf           | hidden           |             | The value provided by the CSURF middleware |

You should also have a submit button.

Please refer to the screenshots below.

New Entree Form:

![New entree form]

New Entree form with expanded dropdown:

![New entree form with expanded dropdown]

To test this route, run:

```
npm test test/01-form-page.js
```

### The route "POST /entrees"

The post handler should validate the data from the HTTP request. If everything
is fine, then it should create a new entree and redirect to the route "/".
Remember, all of the data constraints for this assessment can be handled by the
database with the `allowNull` and `unique` flags in your migrations. You **do
not** need to use form validations in this project. They are good to have, in
real applications, but can require too much time for you to integrate them into
this project. Again, you **do not** need to use a form validator, just use
database constraints and let the errors turn into 500 status codes by Express.

If the data does not pass validation, then no new record should be created. It
is ok to just let Express return an error code of 500 in this case. **Note**:
you would not do this in a real application.

To test this route, run:

```
npm test test/02-submission-page.js
```

### The route "GET /"

When someone accesses your application, they should see the entrees that
are stored in your database. The details should contain:

* The entree name
* The description of the entree
* The price of the entree
* The name of the entree type
* Whether or not the entree is vegetarian

These must be presented in a table. For example, if someone were to create the
entree "John's Impossible Burger" with a description "Plant-based yumminess on a
bun with brown-ale mustard." and a price of "10.34" and the entree type of
"Plant-based", you should present it like this.

![main entree page]

To create a table in a Pug.js template, you'll use something like the following
code. You probably already know this, but it's included for your reference.

```pug
table
  thead
    tr
      th Header 1
      th Header 2
  tbody
    each thing in things
      tr
        td= thing.property1
        td= thing.property2
```

The tests will use a regular expression to determine if each piece of data is
wrapped with TD tags. For example, to test for the "John's Impossible Burger"
value appearing in the HTML of the page, the tests would use the following
regular expression.

```
<td[^>]*>\s*John's Impossible Burger\s*</td>
```

The regular expression will ignore any attributes that you put on the table data
tag as well as any accidental white space around the entry for the data value.

Again, the styling is not important to the tests.

To test this route, run:

```
npm test test/03-main-page.js
```

## Submission

When you are ready to submit:

1. Delete the `node_modules` directory
2. Zip up your folder
3. Upload it

[data model]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/express/assessments/version-a-v2/assets/express-application-assessment-data-model.png
[New entree form]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/express/assessments/version-a-v2/assets/express-application-assessment-entree-creation-form.png
[New entree form with expanded dropdown]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/express/assessments/version-a-v2/assets/express-application-assessment-entree-creation-form-with-dropdown.png
[main entree page]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/express/assessments/version-a-v2/assets/express-application-assessment-main-entrees-page.png
