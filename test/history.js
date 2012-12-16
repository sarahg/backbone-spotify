// vim: ts=2:sw=2:sts=2

var ModelsMock = function() {
  this.application.observe = sinon.spy();
  this.application.ignore = sinon.spy();
};
ModelsMock.prototype = {
  EVENT: {
    ARGUMENTSCHANGED: 1
  },
  application: {
    arguments: ['index'],
  }
};

var LocationMock = function() {
  this.assign = sinon.spy();
};

var CoreMock = function() {}
CoreMock.prototype = {
  uri: 'spotify:app:test'
}

var ViewMock = Backbone.View.extend({
  initialize: function() {
    this.restore = sinon.spy();
    this.freeze = sinon.spy();
  }
})

describe('BackboneSpotify.History', function() {
  var history, models, location, router, core;

  beforeEach(function() {
    // Set up history
    models = new ModelsMock();
    location = new LocationMock(),
    core = new CoreMock();
    history = Backbone.history = new BackboneSpotify.History({
      models: models,
      location: location,
      core: core,
    });

    // Set up router
    var Router = BackboneSpotify.Router.extend({
      routes: {
        'index': 'index',
        'second': 'second',
        'third': 'third',
      },
      index: sinon.spy(),
      second: sinon.spy(),
      third: sinon.spy(),
      restore: sinon.spy(),
      freeze: sinon.spy(),
    });
    router = new Router();
    router.view = new ViewMock();
  });
  
  describe('start', function() {
    context('when it is called without options', function() {
      beforeEach(function() {
        history.start();
      })
      it('marks the history as started', function() {
        expect(history.started).to.be.true
      })
      it('binds to changes in Spotify\'s arguments', function() {
        expect(models.application.observe.called).to.be.true
        expect(models.application.observe.args[0][0]).to.equal(models.EVENT.ARGUMENTSCHANGED)
        expect(models.application.observe.args[0][1]).to.equal(history.checkUrl)
      })
      it('triggers the initial route', function() {
        expect(router.index.called).to.be.true
      })

    })
    context('when the "silent" option is true', function() {
      beforeEach(function() {
        history.start({silent: true});
      })
      it('does not trigger the initial route', function() {
        expect(router.index.called).to.be.false
      })
    })
  });

  describe('stop', function() {
    it('marks the history as stopped')
    it('ignores changes in Spotify\'s arguments')
  })

  describe('getFragment', function() {
    it('returns a single argument', function() {
      models.application.arguments = ['index']
      expect(history.getFragment()).to.equal('index')
    })
    it('joins together multiple arguments with colons', function() {
      models.application.arguments = ['foo', 'bar']
      expect(history.getFragment()).to.equal('foo:bar')
    })
  })

  describe('checkUrl', function() {

  })

  describe('loadUrl', function() {
    beforeEach(function() {
      history.start({silent: true})
    })

    context('when "index" is loaded', function() {
      beforeEach(function() {
        history.loadUrl('index')
      })

      it('has a stack of length 1 with a reference to the router and view', function() {
        expect(history.stack).to.have.length(1)
        expect(history.stack[0].fragment).to.equal('index')
        expect(history.stack[0].router).to.equal(router)
        expect(history.stack[0].view).to.equal(router.view)
      })

      context('when "second" is loaded', function() {
        beforeEach(function() {
          history.loadUrl('second')
        })

        it('calls the "second" function on the router', function() {
          expect(router.second.called).to.be.true
        })

        it('does not call the restore function on the view', function() {
          expect(router.restore.called).to.be.false
        })

        it('calls the freeze function on the view', function() {
          expect(router.view.freeze.called).to.be.true
        })
        it('calls the freeze function on the router', function() {
          expect(router.freeze.called).to.be.true
          expect(router.freeze.args[0][0]).to.equal(router.view)
        })
      
        context('when "index" is loaded', function() {
          beforeEach(function() {
            router.index.reset()
            router.restore.reset()
            router.view.restore.reset()
            router.freeze.reset()
            router.view.freeze.reset()
            history.loadUrl('index')
          })
          it('does not call the router function for index', function() {
            expect(router.index.called).to.be.false
          })
          it('calls the restore function on the router', function() {
            expect(router.restore.called).to.be.true
            expect(router.restore.args[0][0]).to.equal(router.view)
          })
          it('calls the restore function on the view', function() {
            expect(router.view.restore.called).to.be.true
          })
          it('calls the freeze function on the view', function() {
            expect(router.view.freeze.called).to.be.true
          })
          it('calls the freeze function on the router', function() {
            expect(router.freeze.called).to.be.true
            expect(router.freeze.args[0][0]).to.equal(router.view)
          })

          context('when "second is loaded"', function() {
            beforeEach(function() {
              router.second.reset()
              router.restore.reset()
              router.view.restore.reset()
              router.freeze.reset()
              router.view.freeze.reset()
              history.loadUrl('second')
            })
            it('does not call the router function for second', function() {
              expect(router.second.called).to.be.false
            })
            it('calls the restore function on the router', function() {
              expect(router.restore.called).to.be.true
              expect(router.restore.args[0][0]).to.equal(router.view)
            })
            it('calls the restore function on the view', function() {
              expect(router.view.restore.called).to.be.true
            })
            it('calls the freeze function on the view', function() {
              expect(router.view.freeze.called).to.be.true
            })
            it('calls the freeze function on the router', function() {
              expect(router.freeze.called).to.be.true
              expect(router.freeze.args[0][0]).to.equal(router.view)
            })
          })
        })

        context('when "third" is loaded', function() {
          beforeEach(function() {
            router.third.reset()
            history.loadUrl('third')
          })
          it('calls the "third" function on the router', function() {
            expect(router.third.called).to.be.true
          })

          context('when "index" is loaded', function() {
            beforeEach(function() {
              router.index.reset()
              history.loadUrl('index')
            })
            it('calls the "index" function on the router', function() {
              expect(router.index.called).to.be.true
            })
          })
        })
      })
    })
  })

  describe('navigate', function() {
    it('assigns a new location', function() {
      history.navigate('index')
      expect(location.assign.called).to.be.true
      expect(location.assign.args[0][0]).to.equal('spotify:app:test:index')
    })
    it('navigates to the root uri with no fragment', function() {
      history.navigate()
      expect(location.assign.called).to.be.true
      expect(location.assign.args[0][0]).to.equal('spotify:app:test')
    })
  })
})


