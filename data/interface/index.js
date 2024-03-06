var config  = {
  "options": {
    "state": "hide"
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            config.port.name = "win";
            chrome.runtime.connect({"name": config.port.name});
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "load": function () {
    const pin = document.getElementById("pin");
    const chat = document.getElementById("chat");
    const unpin = document.getElementById("unpin");
    const login = document.getElementById("login");
    const toggle = document.getElementById("toggle");
    const reload = document.getElementById("reload");
    const socket = document.getElementById("socket");
    const layout = document.getElementById("layout");
    const options = document.getElementById("options");
    const support = document.getElementById("support");
    const message = document.getElementById("message");
    const donation = document.getElementById("donation");
    /*  */
    config.interface.chat = document.querySelector(".chat");
    config.interface.room = document.querySelector(".room");
    config.interface.login = document.querySelector(".login");
    config.interface.loader = document.querySelector(".loader");
    config.interface.footer = document.querySelector(".footer");
    config.interface.container = document.querySelector(".container");
    /*  */
    pin.addEventListener("click", config.interface.listeners.pin, false);
    chat.addEventListener("click", config.interface.listeners.chat, false);
    toggle.addEventListener("click", config.interface.listeners.chat, false);
    unpin.addEventListener("click", config.interface.listeners.unpin, false);
    login.addEventListener("submit", config.interface.listeners.login, false);
    layout.addEventListener("click", config.interface.listeners.layout, false);
    socket.addEventListener("click", config.interface.listeners.socket, false);
    options.addEventListener("click", config.interface.listeners.options, false);
    message.addEventListener("submit", config.interface.listeners.message, false);
    reload.addEventListener("click", function () {document.location.reload()}, false);
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    },
    "layout": function () {
      if (config.meeting.layout === 'h' || config.meeting.layout === 'g' || config.meeting.layout === 'b') {
        if (config.interface.container) {
          let room = config.interface.room;
          if (room && room.children) {
            let cell = room.children[0];
            if (cell) {
              let video = cell.querySelector("video");
              if (video) {
                video.removeAttribute("small");
                /*  */
                let a = parseInt(window.getComputedStyle(video).width);
                let b = parseInt(window.getComputedStyle(config.interface.container).width);
                if (b - 256 < a) {
                  video.setAttribute("small", '');
                }
              }
            }
          }
        }
      }
    }
  },
  "app": {
    "generate": {
      "hash": {
        "code": function (e) {
          let sum = 0;
          for (let i = 0; i < e.length; i++) {
            sum += parseInt(e[i].charCodeAt(0), 10);
          }
          /*  */
          let parsed = parseFloat('0.' + String(sum));
          let hash = Math.round(parsed * 1000);
          if (hash > 1000) hash = 1000;
          if (hash < 1) hash = 1;
          /*  */
          return hash;
        }
      }
    },
    "start": function () {
      const token = document.getElementById("token");
      const server = document.getElementById("server");
      const nickname = document.querySelector("input[name='nickname']");
      const password = document.querySelector("input[name='password']");
      const meetingname = document.querySelector("input[name='meetingname']");
      /*  */
      let TOKEN = '';
      let SERVER = "wss://connect-6c2v.onrender.com/[CHANNEL_ID]?apiKey=[API_KEY]";
      /*  */
      config.meeting.mode = config.storage.read("mode") !== undefined ? config.storage.read("mode") : "overlay";
      config.meeting.layout = config.storage.read("layout") !== undefined ? config.storage.read("layout") : 'b';
      config.meeting.server.name = config.storage.read("server.name") !== undefined ? config.storage.read("server.name") : SERVER;
      config.meeting.server.token = config.storage.read("server.token") !== undefined ? config.storage.read("server.token") : TOKEN;
      /*  */
      server.value = config.meeting.server.name;
      token.value = config.storage.read("server.token") !== undefined ? config.storage.read("server.token") : "token";
      meetingname.value = config.storage.read("meeting.name") !== undefined ? config.storage.read("meeting.name") : '';
      password.value = config.storage.read("meeting.password") !== undefined ? config.storage.read("meeting.password") : '';
      nickname.value = config.storage.read("meeting.nickname") !== undefined ? config.storage.read("meeting.nickname") : '';
      /*  */
      if (config.interface.sortable.object) config.interface.sortable.object.destroy();
      config.interface.sortable.object = Sortable.create(config.interface.room, {
        "swap": true,
        "animation": 0,
        "onEnd": config.interface.update
      });
      /*  */
      window.setTimeout(function () {
        config.interface.login.style.display = "flex";
        config.interface.loader.style.display = "none";
      }, 300);
    }
  },
  "interface": {
    "chat": null,
    "room": null,
    "login": null,
    "loader": null,
    "footer": null,
    "container": null,
    "sortable": {
      "object": null
    },
    "update": function () {
      let room = config.interface.room;
      if (room.children) {
        room.removeAttribute("grid-template-columns-r");
        room.removeAttribute("grid-template-columns-d");
        /*  */
        if (config.meeting.layout === 'a') {
          room.setAttribute("grid-template-columns-d", '');
        }
        /*  */
        if (config.meeting.layout === 'g') {
          room.setAttribute("grid-template-columns-r", '');
        }
        /*  */
        if (config.meeting.layout === 'h') {
          room.setAttribute("grid-template-columns-r", '');
        }
        /*  */
        let cells = [...room.children];
        for (let i = 0; i < cells.length; i++) {
          let cell = cells[i];
          if (cell) {
            if (cell.querySelector("video") === null) {
              cell.remove();
            } else {
              cell.removeAttribute("float-left");
              cell.removeAttribute("float-right");
              cell.removeAttribute("grid-area-h");
              cell.removeAttribute("grid-area-v");
              cell.removeAttribute("grid-row-end");
              cell.removeAttribute("grid-column-end");
              /*  */
              if (i === 0) {
                if (config.meeting.layout === 'a' || config.meeting.layout === 'h' || config.meeting.layout === 'g' || config.meeting.layout === 'b') {
                  cell.setAttribute("grid-row-end", '');
                  cell.setAttribute("grid-column-end", '');
                }
                /*  */
                if (config.meeting.layout === 'e') {
                  cell.setAttribute("grid-area-h", '');
                }
                /*  */
                if (config.meeting.layout === 'f') {
                  cell.setAttribute("grid-area-v", '');
                }
              } else {
                if (config.meeting.layout === 'g') {
                  cell.setAttribute("float-right", '');
                }
                /*  */
                if (config.meeting.layout === 'h') {
                  cell.setAttribute("float-left", '');
                }
              }
            }
          }
        }
      }
      /*  */
      config.resize.layout();
      /*  */
      let members = config.meeting.members;
      let repeat = config.meeting.layout.substring(1);
      let divide = repeat ? Math.round(members / repeat) : 1;
      /*  */
      document.documentElement.style.setProperty("--divide", divide);
      document.documentElement.style.setProperty("--repeat", repeat);
      document.documentElement.style.setProperty("--members", members);
    },
    "listeners": {
      "options": function () {
        const options = document.querySelector(".options");
        config.options.state = config.options.state === "show" ? "hide" : "show";
        const settings = config.interface.container.querySelector(".settings");
        settings.setAttribute("state", config.options.state);
        options.setAttribute("state", config.options.state);
      },
      "pin": function () {
        config.meeting.mode = "overlay";
        config.storage.write("mode", config.meeting.mode);
        config.interface.container.setAttribute("target", "chat");
        config.interface.container.setAttribute("mode", config.meeting.mode);
      },
      "unpin": function () {
        config.meeting.mode = "inline";
        config.storage.write("mode", config.meeting.mode);
        config.interface.container.setAttribute("target", "chat");
        config.interface.container.setAttribute("mode", config.meeting.mode);
      },
      "chat": function () {
        config.meeting.mode = config.interface.container.getAttribute("mode");
        config.meeting.state = config.interface.container.getAttribute("state");
        /*  */
        config.meeting.state = config.meeting.state === "show" ? "hide" : "show";
        config.interface.container.setAttribute("state", config.meeting.state);
        config.interface.container.setAttribute("target", "room");
      },
      "socket": function (e) {
        let state = e.target.getAttribute("state");
        let method = state === "closed" ? "restart" : "close";
        /*  */
        config.meeting.engine.socket[method]();
        e.target.setAttribute("state", state === "closed" ? "loading" : "closed");
        if (method === "restart") config.meeting.engine.send({"method": "socket-restart"});
        config.interface.footer.textContent = "> socket  - " + e.target.getAttribute("state");
      },
      "message": function (e) {
        e.preventDefault();
        e.stopPropagation();
        /*  */
        let form = new FormData(e.target);
        let message = form.get("message");
        if (message) {
          config.meeting.engine.send({"context": "chat", "message": message});
          config.meeting.add.chat(null, {"context": "chat", "message": message});
          /*  */
          e.target.reset();
        }
      },
      "login": function (e) {        
        e.preventDefault();
        e.stopPropagation();
        /*  */
        let form = new FormData(e.target);
        let nickname = form.get("nickname");
        let password = form.get("password");
        let meetingname = form.get("meetingname");
        /*  */
        config.meeting.login(nickname, meetingname, password);
      },
      "layout": function () {
        let index = config.meeting.layouts.indexOf(config.meeting.layout);
        /*  */
        config.meeting.layout = index > -1 && index < config.meeting.layouts.length - 1 ? config.meeting.layouts[index + 1] : config.meeting.layouts[0];
        config.interface.room.setAttribute("layout", config.meeting.layout);
        config.storage.write("layout", config.meeting.layout);
        /*  */
        config.meeting.render.room();
      }
    }
  },
  "meeting": {
    "order": 1,
    "members": 1,
    "engine": null,
    "state": "hide",
    "mode": "overlay",
    "chat": {"items": 1},
    "server": {"name": '', "token": ''},
    "layouts": ['a', 'b', 'h', 'g', 'c', 'e', 'f', 'd1', 'd2', 'd3', 'd4', 'd5', 'i1', 'i2', 'i3', 'i4', 'i5'],
    "render": {
      "room": function () {
        config.interface.container.setAttribute("mode", config.meeting.mode);
        config.interface.room.setAttribute("layout", config.meeting.layout);
        config.interface.update();
      },
      "interface": function () {
        const title = document.querySelector(".title");
        const header = document.querySelector(".header");
        const options = document.querySelector(".options");
        const toolbar = document.querySelector(".toolbar");
        const controls = document.querySelector(".controls");
        /*  */
        config.interface.login.style.display = "none";
        config.interface.loader.style.display = "flex";
        config.interface.loader.setAttribute("white", '');
        /*  */
        window.setTimeout(function () {
          title.setAttribute("dark", '');
          header.setAttribute("dark", '');
          options.setAttribute("dark", '');
          toolbar.setAttribute("dark", '');
          controls.setAttribute("dark", '');
          /*  */
          controls.style.display = "block";
          config.interface.room.style.display = "grid";
          config.interface.chat.style.display = "block";
          /*  */
          config.interface.update();
        }, 300);
      }
    },
    "add": {
      "chat": function (guid, e) {
        let template = document.querySelector("template[for='chat-item']");
        let list = config.interface.chat.querySelector(".list");
        /*  */
        let clone = template.content.cloneNode(true);
        let item = clone.querySelector(".item");
        /*  */
        let diff = list.scrollHeight - list.scrollTop;
        let peer = guid ? config.meeting.engine.peers[guid] : '';
        let height = parseInt(window.getComputedStyle(list).height);
        let nickname = peer && peer.extra ? peer.extra.nickname : "me";
        /*  */
        list.appendChild(item);
        item.querySelector(".name").textContent = nickname;
        item.querySelector(".time").textContent = (new Date()).toLocaleTimeString();
        //if (!e.message) config.interface.footer.textContent = nickname + " logged in";
        item.querySelector(".body").textContent = e.context && e.context === "chat" ? e.message : '';
        /*  */
        if ((diff - height) < 48) {
          list.scrollTo(0, list.scrollHeight);
        }
      },
      "member": function (peer, video, stream) {      
        const container = document.createElement("div");
        /*  */
        container.setAttribute("order", config.meeting.order++);
        container.setAttribute("class", "member");
        /*  */
        video = video || document.createElement("video");
        if (stream) video.srcObject = stream;
        video.setAttribute("class", "media");
        if (peer === null) video.play();
        container.appendChild(video);
        /*  */
        video.addEventListener("loadedmetadata", function () {
          video.controls = true;
          config.interface.loader.style.display = "none";
          config.interface.loader.removeAttribute("white");
        });
        /*  */
        const nickname = document.createElement("div");
        nickname.textContent = peer ? peer.extra.nickname : '';
        nickname.setAttribute("class", "nickname");
        container.appendChild(nickname);
        /*  */
        const close = document.createElement("div");
        close.setAttribute("class", "close");
        if (peer) close.peer = peer;
        close.textContent = '✕';
        container.appendChild(close);
        close.addEventListener("click", function (e) {
          if (e.target.peer) e.target.peer.close();
          else document.location.reload();
          /*  */
          e.target.closest(".member").remove();
          config.interface.update();
        });
        /*  */
        config.interface.room.appendChild(container);
        config.interface.update();
      }
    },
    "login": async function (nickname, meetingname, password) {    
      if (nickname && meetingname && password) {
        config.meeting.render.interface();
        config.meeting.render.room();
        /*  */        
        config.storage.write("meeting.name", meetingname);
        config.storage.write("meeting.nickname", nickname);
        config.storage.write("meeting.password", password);
        /*  */
        config.meeting.engine = new Meeting(config.meeting.server.name, config.meeting.server.token);
        /*  */
        config.meeting.engine.password(password).then(() => {
          let hash = config.app.generate.hash.code(meetingname);
          return config.meeting.engine.join(hash, {"nickname": nickname}).then(() => {
            navigator.mediaDevices.getUserMedia(configuration.media).then(stream => {
              config.meeting.add.member(null, null, stream);
            }).catch(e => {
              //console.error(e);
              config.interface.footer.textContent = "> " + e.message;
            });
          });
        }).catch(e => {
          //console.error(e);
          config.interface.footer.textContent = "> an unexpected error happened!";
        });
        /*  */
        config.meeting.engine.onMessage.addListener((guid, e) => {
          config.meeting.add.chat(guid, e);
        });
        /*  */
        config.meeting.engine.onVideoRequest.addListener((video, peer) => {
          config.interface.footer.textContent = "> peer recipient id: " + peer.recipient;
          config.meeting.add.member(peer, video, null);
        });
        /*  */
        config.meeting.engine.onCountChanged.addListener(count => {
          config.interface.footer.textContent = "> current members: " + count;
          config.meeting.members = count;
          config.interface.update();
        });
        /*  */
        config.interface.footer.textContent = "> socket  - loading";
        config.meeting.engine.onConnectionStateChanged.addListener((type, state) => {
          config.interface.footer.textContent = '> '  + type + ' - ' + state;
          if (type === "socket") {
            let socket = document.getElementById("socket");
            socket.setAttribute("state", state);
          }
        });
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
