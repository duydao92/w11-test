const chai = require('chai');
const cheerio = require('cheerio');
const request = require('supertest');
const faker = require('faker');

const htmlCollector = require('./utils/html-collector');

const { app } = require('../app.js');
const { expect } = chai;

const formPath = '/entrees/new';
const formHandlerPath = '/entrees';
const mainPath = '/';

describe('The main page', () => {
  const vegFlags = {
    Beef: false,
    Chicken: false,
    Goat: false,
    Jackfruit: true,
    'Plant-based': true,
    Pork: false,
    Soy: true,
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
