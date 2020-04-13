const chai = require('chai');
const cheerio = require('cheerio');
const request = require('supertest');
const faker = require('faker');

const haveTag = require('./have-tag-with-attribute');
const haveSelectWithOption = require('./have-select-with-option');
const { app } = require('../app.js');
const { expect } = chai;

chai.use(haveTag);
chai.use(haveSelectWithOption);

async function htmlCollector(res, callback) {
  let data = '';
  for await (let chunk of res) {
    data += chunk;
  }
  callback(null, data);
}

const formPath = '/entrees/new';
const formHandlerPath = '/entrees';
const mainPath = '/';

describe('The form page', () => {
  let pageContent = null;

  it('returns a 200', done => {
    if (!app) { expect.fail('Cannot read "app" from app.js'); }

    request(app)
      .get(formPath)
      .set('accept', 'html')
      .buffer()
      .parse(htmlCollector)
      .expect(res => pageContent = res.body)
      .expect(200, done);
  });

  describe('shows a form', () => {
    it(`with a method of "post"`, () => {
      if (!app) { expect.fail('Cannot read "app" from app.js'); }

      expect(pageContent).to.haveTag('form', 'method', 'post');
    });

    it(`with an action of "${formHandlerPath}"`, () => {
      if (!app) { expect.fail('Cannot read "app" from app.js'); }

      expect(pageContent).to.haveTag('form', 'action', formHandlerPath);
    });

    describe('that has a form field with the name "name"', () => {
      it('with a tag type of "input"', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="name"]', '@name', 'input');
      });

      it('with the required attribute', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="name"]', 'required');
      });

      it('with the type of text', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="name"]', 'type', 'text');
      });
    });

    describe('that has a form field with the name "description"', () => {
      it('with a tag type of "textarea"', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="description"]', '@name', 'textarea');
      });
    });

    describe('that has a form field with the name "price"', () => {
      it('with a tag type of "input"', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="price"]', '@name', 'input');
      });

      it('with the required attribute', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="price"]', 'required');
      });

      it('with the type of number', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="price"]', 'type', 'number');
      });
    });

    describe('that has a form field with the name "entreeTypeId"', () => {
      it('with a tag type of "select"', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="entreeTypeId"]', '@name', 'select');
      });

      it('with the required attribute', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="entreeTypeId"]', 'required');
      });

      const options = ['Beef', 'Chicken', 'Goat', 'Jackfruit', 'Plant-based', 'Pork', 'Soy'];

      for (let option of options) {
        it(`with the option "${option}"`, () => {
          if (!app) { expect.fail('Cannot read "app" from app.js'); }

          expect(pageContent).to.haveSelectWithOption('[name="entreeTypeId"]', option);
        });
      }
    });

    describe('that has a form field with the name "_csrf"', () => {
      it('with a tag type of "input"', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="_csrf"]', '@name', 'input');
      });

      it('with the type of hidden', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="_csrf"]', 'type', 'hidden');
      });

      it('with a non-empty value', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('[name="_csrf"]', 'value', /.+/);
      });
    });

    describe('that has a button', () => {
      it('with a type of submit', () => {
        if (!app) { expect.fail('Cannot read "app" from app.js'); }

        expect(pageContent).to.haveTag('button', 'type', 'submit', true);
      });
    });
  });
});

describe('The submission page', () => {
  let token = null;
  let cookies = null;
  let optionValue = null;
  let csrfError = null;
  let optionError = null;
  beforeEach(async () => {
    if (!app) return;

    const getRes = await request(app).get(formPath);
    cookies = getRes.headers["set-cookie"];
    const $ = cheerio.load(getRes.text);

    try {
      const csrf = $("input[type='hidden'][name='_csrf']");
      if (csrf.length === 0) {
        csrfError = new Error('Could not find a _csrf field to use to submit.');
      }
      token = csrf.attr("value");
    } catch (e) {
      csrfError = new Error('Could not find a _csrf field to use to submit.');
    }

    try {
      const options = $('select[name="entreeTypeId"] option');
      const option = $(options[Math.floor(options.length * Math.random())]);
      optionValue = option.attr('value');

      if (!optionValue) {
        optionError = new Error('Could not find a select dropdown with entreeTypeIds to use to submit.');
      }
    } catch (e) {
      optionError = new Error('Could not find a select dropdown with entreeTypeIds to use to submit.');
    }
  });

  it('can accept a valid submission with name, price, and entreeTypeId and get redirected', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(302, done);
  });

  it('can accept a valid submission with name, description, price, and entreeTypeId and get redirected', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(302, done);
  });

  it('returns a 500 for missing name data', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(500, done);
  });

  it('returns a 500 for missing price data', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(500, done);
  });

  it('returns a 500 for missing entreeTypeId data', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .expect(500, done);
  });

  it('returns a 500 for unknown entreeTypeId data', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${Math.random()}`)
      .expect(500, done);
  });

  it('returns a 500 for a too-long name', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`_csrf=${token}`)
      .send(`name=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(500, done);
  });

  it('returns a 403 for a missing CSRF token', done => {
    if (!app) { return done(Error('Cannot read "app" from app.js')); }
    if (csrfError || optionError) { return done(csrfError || optionError); }

    request(app)
      .post(formHandlerPath)
      .set('Cookie', cookies)
      .send(`name=${encodeURIComponent(faker.name.findName() + ' Special')}`)
      .send(`description=${encodeURIComponent(faker.commerce.productAdjective() + ' meal at a great price')}`)
      .send(`price=${faker.finance.amount(1, 9000, 2)}`)
      .send(`entreeTypeId=${optionValue}`)
      .expect(403, done);
  });
});

describe('The main page', () => {
  const vegFlags = {
    Beef       : false,
    Chicken    : false,
    Goat       : false,
    Jackfruit  : true ,
    'Plant-based': true ,
    Pork       : false,
    Soy        : true ,
  };

  let name = null;
  let description = null;
  let price = null;
  let entreeType = null;
  let csrfError = null;
  let optionError = null;
  let optionText = null
  let createError = null;
  let pageContent = null;

  function findNamedRow() {
    const rows = pageContent.split(/<\/?tr>/g);
    let namedRow = '';

    const nameRegex = new RegExp(`<td[^>]*>\s*${name}\s*</td>`);
    for (let row of rows) {
      if (nameRegex.test(row)) {
        namedRow = row;
        break;
      }
    }
    return namedRow;
  }

  before(async () => {
    if (!app) return;

    name = faker.name.findName() + ' Special';
    description = faker.commerce.productAdjective() + ' meal at a great price';
    price = faker.finance.amount(1, 9000, 2);

    const getRes = await request(app).get(formPath);
    cookies = getRes.headers["set-cookie"];
    const $ = cheerio.load(getRes.text);

    try {
      const csrf = $("input[type='hidden'][name='_csrf']");
      if (csrf.length === 0) {
        csrfError = new Error('Could not find a _csrf field to use to submit.');
      }
      token = csrf.attr("value");
    } catch (e) {
      csrfError = new Error('Could not find a _csrf field to use to submit.');
      return;
    }

    try {
      const options = $('select[name="entreeTypeId"] option');
      const option = $(options[Math.floor(options.length * Math.random())]);
      optionValue = option.attr('value');
      optionText = option.text();
    } catch (e) {
      optionError = new Error('Could not find a select dropdown with entreeTypeIds to use to submit.');
      return;
    }

    try {
      await request(app)
        .post(formHandlerPath)
        .set('Cookie', cookies)
        .send(`_csrf=${token}`)
        .send(`name=${encodeURIComponent(name)}`)
        .send(`description=${encodeURIComponent(description)}`)
        .send(`price=${price}`)
        .send(`entreeTypeId=${optionValue}`)
        .expect(302);
    } catch (e) {
      createError = new Error('Could not create a new entree to test on the main screen');
    }
  });

  it('returns a 200', done => {
    if (!app) { expect.fail('Cannot read "app" from app.js'); }

    request(app)
      .get(mainPath)
      .set('accept', 'html')
      .buffer()
      .parse(htmlCollector)
      .expect(res => pageContent = res.body)
      .expect(200, done);
  });

  describe('for an added entree, contains a data cell with', () => {
    it('the name', () => {
      if (!app) { return expect.fail('Cannot read "app" from app.js'); }
      if (csrfError || optionError || createError) { return expect.fail(csrfError || optionError || createError); }

      const re = new RegExp(`<td[^>]*>\s*${name}\s*</td>`);
      expect(re.test(pageContent)).to.equal(true, `Could not find the name ${name} on the main page.`);
    });

    it('the description', () => {
      if (!app) { return expect.fail('Cannot read "app" from app.js'); }
      if (csrfError || optionError || createError) { return expect.fail(csrfError || optionError || createError); }

      let namedRow = findNamedRow();
      const descriptionRegex = new RegExp(`<td[^>]*>\s*${description}\s*</td>`);

      expect(descriptionRegex.test(namedRow)).to.equal(true, `Could not find the description "${description}" in the same table row as "${name}".`);
    });

    it('the price', () => {
      if (!app) { return expect.fail('Cannot read "app" from app.js'); }
      if (csrfError || optionError || createError) { return expect.fail(csrfError || optionError || createError); }

      let namedRow = findNamedRow();
      const priceRegex = new RegExp(`<td[^>]*>\s*${price}\s*</td>`);

      expect(priceRegex.test(namedRow)).to.equal(true, `Could not find the price "${price}" in the same table row as "${name}".`);
    });

    it('the entree type', () => {
      if (!app) { return expect.fail('Cannot read "app" from app.js'); }
      if (csrfError || optionError || createError) { return expect.fail(csrfError || optionError || createError); }

      let namedRow = findNamedRow();
      const optionRegex = new RegExp(`<td[^>]*>\s*${optionText}\s*</td>`);

      expect(optionRegex.test(namedRow)).to.equal(true, `Could not find the entree type "${optionText}" in the same table row as "${name}".`);
    });

    it('the is vegetarian true/false flag', () => {
      if (!app) { return expect.fail('Cannot read "app" from app.js'); }
      if (csrfError || optionError || createError) { return expect.fail(csrfError || optionError || createError); }

      let namedRow = findNamedRow();
      const optionRegex = new RegExp(`<td[^>]*>\s*${vegFlags[optionText]}\s*</td>`);

      expect(optionRegex.test(namedRow)).to.equal(true, `Could not find the is vegetarian flag "${vegFlags[optionText]}" in the same table row as "${name}".`);
    });
  });
});
