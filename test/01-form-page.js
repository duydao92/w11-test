const chai = require('chai');
const cheerio = require('cheerio');
const request = require('supertest');
const faker = require('faker');

const haveTag = require('./utils/have-tag-with-attribute');
const haveSelectWithOption = require('./utils/have-select-with-option');
const htmlCollector = require('./utils/html-collector');
const { app } = require('../app.js');
const { expect } = chai;

chai.use(haveTag);
chai.use(haveSelectWithOption);

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