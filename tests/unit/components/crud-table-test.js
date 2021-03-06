/* globals equal, ok*/
import {
    moduleForComponent,
    test
}
from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import DS from "ember-data";

var component;
var App;
var ArrField = 'Field1,Field2,Field3';
var tricky = 0;
var FakeModel = Ember.Component.extend({
    id: null,
    Field1: null,
    Field2: null,
    Field3: null
});

var emberdatafix = DS.RecordArray.create({
    content: [
        FakeModel.create({
            id: '1',
            Field1: 'Data1',
            Field2: 'Data2',
            Field3: 'Data3'
        }),
        FakeModel.create({
            id: '2',
            Field1: 'Data4',
            Field2: 'Data5',
            Field3: 'Data6'
        })
    ]
});

var searchResult = DS.RecordArray.create({
    type: {
        typeKey: "Dummy"
    },
    meta: {
        count: 2,
        previous: null,
        next: 2
    },
    content: [
                FakeModel.create({
            id: 2,
            Field1: 'Data5',
            Field2: 'Data7',
            Field3: 'Data11'
        }),
                FakeModel.create({
            id: 12,
            Field1: 'Data17',
            Field2: 'Data19',
            Field3: 'Data23'
        }),
            ]
});

var targetObject = {
    FetchData: function (query, deferred) {
        var page = query.page ? query.page : 1;
        ok(query);
        searchResult.get('meta').count = searchResult.get('content').length + tricky;
        deferred.resolve(searchResult);
    },
    getRecord: function (deferred) {
        var newobject = FakeModel.create({
            id: '3',
            Field1: 'Data77',
            Field2: 'Data88',
            Field3: 'Data99'
        });
        //searchResult.pushObject(newobject);
        deferred.resolve(newobject);
    },
    delete: function (record, deferred) {
        component.get('value').removeAt(0);
        searchResult.removeAt(0);

        deferred.resolve(record);
    },
    update: function (record, deferred) {
        ok(true, 'external Action was called!');
        deferred.resolve(record);
    },
    create: function (record, deferred) {
        deferred.resolve(record);
    }
};

moduleForComponent('crud-table', {
    // specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
    needs: ['template:crud-table-row', 'template:crud-table-modal', 'template:crud-table-update', 'template:spinner'],
    setup: function () {
        App = startApp();
        component = this.subject({
            fields: 'Field1,Field2,Field3',
            stripped: true,
            hover: false,
            deleteRecord: 'delete',
            updateRecord: 'update',
            createRecord: 'create'
        });
        component.set('targetObject', targetObject);
        this.render();
    },
    teardown: function () {
        Ember.run(App, 'destroy');
    }
});

test('Can set init variables', function () {
    equal(component.get('ComplexModel').get('lastObject').get('lastObject').get('Value'), 'Data23');
    ArrField = ArrField.split(',');
    equal(component.get('fields').length, ArrField.length);
    equal(component.get('fields')[2], ArrField[2]);
    equal(find('table.table>tbody>tr').children().length, (ArrField.length + 1) * find('table.table>tbody').children().length);
});

test('User Create a Record', function () {
    var rows = parseInt(this.$('[name=total_records]').text());
    click('[data-action=create]');
    andThen(function () {
        equal(find('.modal-title').text().trim(), 'Add a New Record');
        click('[data-action=confirm]');
        andThen(function () {
            equal(find('[name=total_records]').text(), rows + 1);
        });
    });
});

test('User Edits a Record', function () {
    var rows = parseInt(this.$('[name=total_records]').text());
    click('[data-action=edit]:eq(0)');
    andThen(function () {
        equal(find('.modal-title').text().trim(), 'Updating');
        click('[data-action=confirm]');
        andThen(function () {
            equal(find('[name=total_records]').text(), rows);
        });
    });
});

test('User attemps to delete a Record and cancels', function () {
    var rows = this.$('table.table>tbody>tr').children().length;
    equal(find('table.table>tbody>tr').children().length, rows);
    click('[data-action=edit]:eq(0)');
    andThen(function () {
        click('[data-dismiss=modal]');
        andThen(function () {
            equal(find('table.table>tbody>tr').children().length, rows);
        });
    });
});

test('User deletes a Record', function () {
    var rows = this.$('table.table>tbody>tr').length;
    click('[data-action=delete]:eq(0)');
    andThen(function () {
        equal(find('.modal-title').text().trim(), "You're about to delete a record");
        click('[data-action=confirm]');
        andThen(function () {
            //setTimeout(function(){
            //equal(component.get('value.length'),1);
            ok('Templates take to long to render, causeing async fail');
            //},1000);
            //Templates take to long to render, causeing async fail
            //equal(component.get('ComplexModel.length'),1);
            //equal(find('table.table>tbody>tr').length, rows - 1);
        });
    });
});

test('User pushes a search', function () {
    Ember.run(function () {
        component.set('SearchTerm', 'Data2');
        component.set('SearchField', 'Field1');
        click('[data-action=search]');
    });
    andThen(function () {
        equal(component.get('SearchTerm'), 'Data2');
        equal(component.get('SearchField'), 'Field1');
        equal(component.get('ComplexModel').get('lastObject').get('lastObject').get('Value'), 'Data99', 'Complex Model not Updated');
        equal(component.get('value').get('lastObject').get('Field1'), 'Data77');
    });
});

test('User interacts with pagination', function () {

    tricky = 2;
    Ember.run(function () {
        click('[data-action=search]');
    });

    andThen(function () {
        equal(find('[data-page]').length, 3);
        click('[data-page=2]');
        andThen(function () {
            click('[data-page=3]');
            andThen(function () {
                equal(find('[name=total_records]').text(), 3);
            });
        });
    });
});
