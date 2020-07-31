const chai = require('chai');
const cheerio = require('cheerio');
const request = require('supertest');
const faker = require('faker');

const { app } = require('../app.js');
const { expect } = chai;

const formPath = '/entrees/new';
const formHandlerPath = '/entrees';
const mainPath = '/';

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