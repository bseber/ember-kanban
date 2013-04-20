$(function(){
    'use strict';

    var App = window.App = Em.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Store = DS.Store.extend({
        revision: 12,
        adapter: DS.FixtureAdapter.extend({})
    });


    // =====================================================
    // R O U T E S
    //

    App.Router.map(function() {
        this.resource('projects', {path: 'p'}, function() {
            this.resource('project', {path: ':project_id'});
        });
    });

    App.IndexRoute = Em.Route.extend({
        redirect: function() {
            this.transitionTo('projects');
        }
    });

    App.ProjectsRoute = Em.Route.extend({
        model: function() {
            return App.Project.find();
        }
    });

    App.ProjectRoute = Em.Route.extend({
        setupController: function(controller, model) {
            this.controllerFor('projects').set('selected', model);
        }
    });


    // =====================================================
    // C O N T R O L L E R S
    //

    App.ProjectsController = Em.ArrayController.extend({
        selected: null,

        _onSelectionChange: function() {
            var selected = this.get('selected');
            if (selected) {
                this.transitionToRoute('project', this.get('selected'));
            } else {
                this.transitionToRoute('index');
            }
        }.observes('selected')
    });


    // =====================================================
    // V I E W S
    //



    // =====================================================
    // D O M A I N
    //

    App.Project = DS.Model.extend({
        name: DS.attr('string')
    });

    App.Ticket = DS.Model.extend({
        project_id: DS.belongsTo('App.Project'),
        title: DS.attr('string'),
        status: DS.attr('string')
    });

    App.Project.FIXTURES = [{
        id: 'project-1',
        name: 'Project 1'
    }, {
        id: 'project-2',
        name: 'Project 2'
    }, {
        id: 'project-3',
        name: 'Project 3'
    }];

    App.Ticket.FIXTURES = [{
        id: '#1',
        project_id: 'project-2',
        title: 'Ready Ticket 1',
        status: 'ready'
    }, {
        id: '#2',
        project_id: 'project-2',
        title: 'inProgress Ticket 1',
        status: 'inProgress'
    }, {
        id: '#3',
        project_id: 'project-2',
        title: 'Ready Ticket 2',
        status: 'ready'
    }, {
        id: '#4',
        project_id: 'project-2',
        title: 'Ready Ticket 3',
        status: 'ready'
    }, {
        id: '#5',
        project_id: 'project-2',
        title: 'Done Ticket 1',
        status: 'done'
    }];

});
