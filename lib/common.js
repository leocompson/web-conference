var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    app.interface.id = '';
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "window": function (e) {
      if (e === app.interface.id) {
        app.interface.id = '';
      }
    },
    "button": function () {
      if (app.interface.id) {
        app.window.get(app.interface.id, function (win) {
          if (win) {
            app.window.update(app.interface.id, {"focused": true});
          } else {
            app.interface.create(app.interface.path + "?win", function (e) {
              app.interface.id = e.id;
            });
          }
        });
      } else {
        app.interface.create(app.interface.path + "?win", function (e) {
          app.interface.id = e.id;
        });
      }
    }
  }
};

app.on.storage(core.action.storage);
app.window.on.removed(core.action.window);
app.button.on.clicked(core.action.button);

app.on.startup(core.start);
app.on.installed(core.install);