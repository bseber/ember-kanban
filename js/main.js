$(function(){
    'use strict';

    var App = window.App = Em.Application.create({
        LOG_TRANSITIONS: true
    });

    var queryFixtures = function(fixtures, query, type) {

        var filterItems = function(item) {
            var filter = true;
            $.each(query, function(prop, val) {
                if (!filter) {
                    return;
                }
                filter = item[prop] && item[prop] === val;
            });
            return filter;
        }

        var result = fixtures.filter(filterItems);
        return result;
    }

    App.Store = DS.Store.extend({
        revision: 12,
        adapter: DS.FixtureAdapter.extend({queryFixtures: queryFixtures})
    });


    // =====================================================
    // R O U T E S
    //

    App.Router.map(function() {
        this.resource('projects', {path: 'p'}, function() {
            this.resource('project', {path: ':project_id'}, function() {
                this.route('kanban');
            });
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

    App.ProjectKanbanRoute = Em.Route.extend({
        model: function() {
            return App.Ticket.find({project_id: this.modelFor('project').get('id')});
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
                this.transitionToRoute('project.kanban', this.get('selected'));
            } else {
                this.transitionToRoute('index');
            }
        }.observes('selected')
    });


    // =====================================================
    // V I E W S
    //

    App._SwimlaneView = Em.View.extend({

        classNames: 'span4',

        templateName: 'swimlane',

        tickets: function() {
            return this.get('controller.content').filterProperty('status', this.get('_status'));
        }.property('controller.content.@each.status').cacheable()
    });

    App.ProjectKanbanView = Em.ContainerView.extend({

        classNames: ['row'],

        childViews: ['readyTicketsView','inProgressTicketsView','doneTicketsView'],

        readyTicketsView: App._SwimlaneView.extend({
            _status: 'ready',
            title: 'Ready'
        }),

        inProgressTicketsView: App._SwimlaneView.extend({
            _status: 'inProgress',
            title: 'In Progress'
        }),

        doneTicketsView: App._SwimlaneView.extend({
            _status: 'done',
            title: 'Done'
        })
    });


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
