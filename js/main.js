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
    // D R A G   A N D   D R O P
    //

    var DnD = Ember.Namespace.create({});

    DnD.cancel = function(event) {
        event.preventDefault();
        return false;
    };

    DnD.Draggable = Ember.Mixin.create({
        attributeBindings: 'draggable',
        draggable: 'true',
        dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('Text', this.get('elementId'));
        }
    });

    DnD.Droppable = Ember.Mixin.create({
        dragEnter: DnD.cancel,
        dragOver: DnD.cancel,
        drop: function(event) {
            event.preventDefault();
            return false;
        }
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

    App.TicketView = Em.View.extend(DnD.Draggable, {

        templateName: 'ticket',

        tagName: 'li',

        classNames: 'ticket',

        classNameBindings: ['status'],

        status: function() {
            return this.get('context.status');
        }.property('context').cacheable(),

        dragStart: function(event) {
            this._super(event);
            this.set('controller.currentDragItem', this.get('context'));
        },

        dragEnd: function(event) {
            this._super(event);
            this.set('controller.currentDragItem', null);
        }

    });

    App._SwimlaneView = Em.View.extend({

        classNames: ['swimlane'],

        classNameBindings: ['isDropTarget:highlight'],

        templateName: 'swimlane',

        tickets: function() {
            return this.get('controller.content').filterProperty('status', this.get('_status'));
        }.property('controller.content.@each.status').cacheable(),

        isDropTarget: function() {
            var ancestor = this.get('_ancestor'),
                status   = this.get('controller.currentDragItem.status');
            return status && status === ancestor;
        }.property('controller.currentDragItem').cacheable()
    });

    App.ProjectKanbanView = Em.ContainerView.extend({

        classNames: ['board'],

        childViews: ['readyTicketsView','inProgressTicketsView','doneTicketsView'],

        readyTicketsView: App._SwimlaneView.extend({
            _status: 'ready',
            title: 'Ready'
        }),

        inProgressTicketsView: App._SwimlaneView.extend({
            _ancestor: 'ready',
            _status: 'inProgress',
            title: 'In Progress'
        }),

        doneTicketsView: App._SwimlaneView.extend({
            _ancestor: 'inProgress',
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
