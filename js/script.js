// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.duck.App = (function() {
    function App() {
      this.bill = new duck.Bill($(this));
      this.brain = new duck.Brain($(this));
      this.transcriber = new duck.Transcriber;
    }

    return App;

  })();

  $(function() {
    return window.exposed_duck = new duck.App;
  });

  duck.Bill = (function() {
    function Bill(duck) {
      this.duck = duck;
      this.navigation = new window.duck.Navigation(this.duck);
      this.success = new window.duck.Success(this.duck);
      this.renderer = new window.duck.Renderer(this.duck);
      this.ears = new window.duck.Ears(this.duck);
    }

    return Bill;

  })();

  duck.Brain = (function() {
    function Brain(app) {
      this.app = app;
      this.reset = __bind(this.reset, this);
      this.quack = __bind(this.quack, this);
      this.reset();
      $(this.app).on('quack', this.quack);
      $(this.app).on('reset', this.reset);
    }

    Brain.prototype.quack = function(event, options) {
      var state;
      state = this.machine.getNext(options.message);
      return $(this.app).trigger('response', state);
    };

    Brain.prototype.reset = function(event, options) {
      this.machine = new duck.FitnessStateMachine();
      return this.quack({}, {});
    };

    return Brain;

  })();

  duck.Ears = (function() {
    function Ears(duck) {
      this.duck = duck;
      this.reset = __bind(this.reset, this);
      this.quack = __bind(this.quack, this);
      this.submit_choice = __bind(this.submit_choice, this);
      this.check_key = __bind(this.check_key, this);
      this.bindUI();
    }

    Ears.prototype.bindUI = function() {
      $('#duck').on({
        keyup: this.check_key
      }, '.current');
      $('#duck').on({
        click: this.quack
      }, '.current_submit');
      $('#duck').on({
        click: this.reset
      }, '.current_reset');
      return $('#duck').on({
        click: this.submit_choice
      }, '.submit_choice');
    };

    Ears.prototype.check_key = function(event) {
      if (event.keyCode === 13) {
        return this.quack();
      }
    };

    Ears.prototype.submit_choice = function(event) {
      if (event) {
        event.preventDefault();
      }
      return this.duck.trigger('quack', {
        message: $(event.currentTarget).data('choice')
      });
    };

    Ears.prototype.quack = function(event) {
      if (event) {
        event.preventDefault();
      }
      return this.duck.trigger('quack', {
        message: $('#duck .current').val()
      });
    };

    Ears.prototype.reset = function(event) {
      if (event) {
        event.preventDefault();
      }
      return this.duck.trigger('reset');
    };

    return Ears;

  })();

  duck.FitnessStateMachine = (function() {
    function FitnessStateMachine() {
      this.visited_states = [];
      this.current_state = null;
      this.what_it_does = null;
      this.potential_nouns = [];
      this.noun = null;
    }

    FitnessStateMachine.prototype.getNext = function(answer) {
      var out, state, _i, _len, _ref;
      this.answer = answer;
      if (this.current_state) {
        this.current_state.post_action();
      }
      _ref = this.states(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        if (state.qualifies()) {
          this.current_state = state;
          this.visited_states.push(state.name);
          state.pre_action();
          out = {
            next_question: state.question(),
            answer_type: state.answer_type,
            options: state.options
          };
          return out;
        }
      }
      return {
        next_question: "Sorry, my super-duck-powers have failed. Have you tried google or stack overflow?",
        answer_type: 'reset'
      };
    };

    FitnessStateMachine.prototype.states = function(machine) {
      return [
        {
          qualifies: function() {
            return machine.visited_states.length === 0;
          },
          pre_action: function() {},
          post_action: function() {
            var pattern;
            pattern = new duck.PatternMatcher(machine.answer);
            return machine.potential_nouns = pattern.toLikelyNouns();
          },
          question: function() {
            return "Can you describe the problem in a paragraph? Please use small sentences, I'm only a duck.";
          },
          answer_type: 'long'
        }, {
          name: 'is it this one?',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.potential_nouns.length === 1;
          },
          pre_action: function() {
            return machine.noun = machine.potential_nouns[0];
          },
          post_action: function() {
            if (machine.answer === 'no') {
              return machine.noun = null;
            }
          },
          question: function() {
            return "Is " + machine.noun + " the thing that has the problem?";
          },
          answer_type: 'choice',
          options: function() {
            return ['yes', 'no'];
          }
        }, {
          name: 'name your noun',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            machine.visited_states.length === 1 && machine.noun;
            return machine.potential_nouns.length > 1;
          },
          pre_action: function() {},
          post_action: function() {
            machine.noun = machine.answer;
            if (machine.noun === 'none of the above') {
              return machine.noun = null;
            }
          },
          question: function() {
            return "Is the problematic object one of these?";
          },
          answer_type: 'choice',
          options: function() {
            return machine.potential_nouns.sort(function(a, b) {
              return a.length - b.length;
            }).concat('none of the above');
          }
        }, {
          qualifies: function() {
            return !machine.noun;
          },
          pre_action: function() {},
          post_action: function() {
            if (machine.answer && machine.answer.trim() !== '') {
              return machine.noun = machine.answer;
            }
          },
          question: function() {
            return "What should I call the function / object / thing that is misbehaving?";
          },
          answer_type: 'short'
        }, {
          name: 'what does it do?',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {
            return machine.what_it_does = machine.answer;
          },
          question: function() {
            return "Can you explain what " + machine.noun + " does?";
          },
          answer_type: 'long'
        }, {
          name: 'what it does sounds complicated',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun && machine.what_it_does.length > 100;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Wow, that sounds complicated. Any chance that " + machine.noun + " can be broken into smaller parts that you could test seperately?";
          },
          answer_type: 'short'
        }, {
          name: 'what it does sounds reasonable',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun && machine.what_it_does.length <= 100 && machine.what_it_does.length > 30;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "So does it do just one thing? Any chance that " + machine.noun + ", or parts of it, can be isolated and test seperately?";
          },
          answer_type: 'short'
        }, {
          name: 'what it does sounds short',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun && machine.what_it_does.length <= 30;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Do you fully understand how it does what it does? Could you split " + machine.noun + " into smaller chunks?";
          },
          answer_type: 'short'
        }, {
          name: 'what is known',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "What parts of " + machine.noun + " are you certain work, and where are your 'unknowns'?";
          },
          answer_type: 'short'
        }, {
          name: 'is it compiling',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Is " + machine.noun + " being compiled? Can you restart the compiler?";
          },
          answer_type: 'short'
        }, {
          name: 'is it reusable',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Is something similar to " + machine.noun + " being used elsewhere? Could common elements be shared?";
          },
          answer_type: 'short'
        }, {
          name: 'how is it modified',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "How is " + machine.noun + " modified?";
          },
          answer_type: 'short'
        }, {
          name: 'are vars overwritten',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Could " + machine.noun + ", or variables within it, be somehow overwritten or overridden?";
          },
          answer_type: 'short'
        }, {
          name: 'did you pack this bag yourself',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {},
          question: function() {
            return "Is everything in " + machine.noun + " your code? Could you replace uncertainties with debugging statements?";
          },
          answer_type: 'short'
        }, {
          name: 'why do you need it',
          qualifies: function() {
            if (machine.visited_states.indexOf(this.name) !== -1) {
              return false;
            }
            return machine.noun;
          },
          pre_action: function() {},
          post_action: function() {
            return machine.what_it_does = machine.answer;
          },
          question: function() {
            return "Why do you need " + machine.noun + "?";
          },
          answer_type: 'long'
        }
      ];
    };

    return FitnessStateMachine;

  })();

  window.duck.Navigation = (function() {
    function Navigation(duck) {
      this.duck = duck;
      this.go = __bind(this.go, this);
      this.bindUI = __bind(this.bindUI, this);
      this.bindUI();
    }

    Navigation.prototype.bindUI = function() {
      return $('nav a.anchor').click(this.go);
    };

    Navigation.prototype.go = function(event) {
      var link, target;
      event.preventDefault();
      link = $(event.currentTarget);
      target = $(link.attr('href'));
      return $('html, body').animate({
        scrollTop: target.offset().top
      }, 500);
    };

    return Navigation;

  })();

  duck.PatternMatcher = (function() {
    function PatternMatcher(str) {
      this.str = str;
    }

    PatternMatcher.prototype.toString = function() {
      return this.str;
    };

    PatternMatcher.prototype.toClauses = function() {
      var clause, _i, _len, _ref, _results;
      _ref = this.str.split(this.clauseBoundryRegex());
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clause = _ref[_i];
        _results.push(new duck.PatternMatcher(clause));
      }
      return _results;
    };

    PatternMatcher.prototype.toLikelyNouns = function() {
      var found_nouns, match, noun, _i, _len, _ref;
      found_nouns = [];
      _ref = this.toClauses();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        noun = match.findNoun();
        if (!this.disqualifyNoun(noun)) {
          found_nouns.push(noun);
        }
      }
      return found_nouns;
    };

    PatternMatcher.prototype.findNoun = function() {
      var match;
      match = this.str.match(this.ownedItemRegex());
      if (match && match[1]) {
        return this.invertOwner(match[1]);
      }
      return false;
    };

    PatternMatcher.prototype.invertOwner = function(noun) {
      return noun.replace(this.ownerRegex(), 'your ');
    };

    PatternMatcher.prototype.ownerRegex = function() {
      return /(?: |^)(my|the|this|that|our|a|an) /i;
    };

    PatternMatcher.prototype.ownedItemRegex = function() {
      return /(?: |^)((?:my|the|this|that|our|a|an) .+)/i;
    };

    PatternMatcher.prototype.clauseBoundryRegex = function() {
      return /(?:\. |- |, | and | or | but | which | that | although | except | with | is | isn'?t | ain'?t | will | won'?t | can | can'?t | does | doesn'?t | are | aren'?t)/i;
    };

    PatternMatcher.prototype.notNouns = function() {
      return /^(it|this|that|(?:my|this|the) app(?:lication)?)$/i;
    };

    PatternMatcher.prototype.disqualifyNoun = function(noun) {
      if (!noun) {
        return true;
      }
      if (noun === '') {
        return true;
      }
      return noun.match(this.notNouns());
    };

    return PatternMatcher;

  })();

  window.duck.Renderer = (function() {
    function Renderer(duck) {
      this.duck = duck;
      this.strip_current = __bind(this.strip_current, this);
      this.print_choice = __bind(this.print_choice, this);
      this.print_reset = __bind(this.print_reset, this);
      this.print_short = __bind(this.print_short, this);
      this.print_long = __bind(this.print_long, this);
      this.print_answer = __bind(this.print_answer, this);
      this.print_question = __bind(this.print_question, this);
      this.response = __bind(this.response, this);
      this.container = $('#duck');
      this.question_template = $('#template_question').html();
      this.answer_template = $('#template_answer').html();
      this.long_template = $('#template_long').html();
      this.short_template = $('#template_short').html();
      this.reset_template = $('#template_reset').html();
      this.choice_template = $('#template_choices').html();
      this.duck.on('response', this.response);
    }

    Renderer.prototype.response = function(event, options) {
      this.strip_current();
      if (options.answer_type === 'choice') {
        this.print_question(options.next_question);
        return this['print_choice'](options.options());
      } else {
        this.print_question(options.next_question);
        return this['print_' + options.answer_type]();
      }
    };

    Renderer.prototype.print_question = function(text) {
      return this.container.append(Mustache.render(this.question_template, {
        question: text
      }));
    };

    Renderer.prototype.print_answer = function(text) {
      return this.container.append(Mustache.render(this.answer_template, {
        answer: text
      }));
    };

    Renderer.prototype.print_long = function() {
      this.container.append(Mustache.render(this.long_template, {}));
      return $('#duck .current').focus();
    };

    Renderer.prototype.print_short = function() {
      this.container.append(Mustache.render(this.short_template, {}));
      return $('#duck .current').focus();
    };

    Renderer.prototype.print_reset = function() {
      return this.container.append(Mustache.render(this.reset_template, {}));
    };

    Renderer.prototype.print_choice = function(arr) {
      return this.container.append(Mustache.render(this.choice_template, {
        choices: arr
      }));
    };

    Renderer.prototype.strip_current = function() {
      var val;
      val = $('#duck .current').val();
      if (val) {
        this.print_answer(val);
      }
      return $('#duck .current, #duck .current_submit, .current_reset').remove();
    };

    return Renderer;

  })();

  window.duck.Success = (function() {
    function Success(duck) {
      this.duck = duck;
      this.done = __bind(this.done, this);
      this.bindUI = __bind(this.bindUI, this);
      this.bindUI();
    }

    Success.prototype.bindUI = function() {
      return $('.done').click(this.done);
    };

    Success.prototype.done = function(event) {
      event.preventDefault();
      return $('.congratulations').slideDown();
    };

    return Success;

  })();

  duck.Trail = (function() {
    function Trail(duck) {
      this.duck = duck;
      this.duck.on('quack', this.logQuack);
      this.duck.on('success', this.logSuccess);
    }

    Trail.prototype.logQuack = function(event, quack) {
      return console.log(quack, 'quack occurred, added to ga');
    };

    Trail.prototype.logSuccess = function() {
      return console.log('success occurred, added to ga');
    };

    return Trail;

  })();

  duck.Transcriber = (function() {
    function Transcriber() {
      var _this = this;
      $('.prefixtext').on('click', function() {
        return _this.transcribe(_this.prefix);
      });
      $('.italictext').on('click', function() {
        return _this.transcribe(_this.italic);
      });
    }

    Transcriber.prototype.prefix = function(i, a) {
      var prefix;
      prefix = "Question " + i + " : ";
      if ($(a).hasClass('answer')) {
        prefix = "Answer " + i + " : ";
      }
      return prefix + $(a).text();
    };

    Transcriber.prototype.italic = function(i, a) {
      if ($(a).hasClass('answer')) {
        return "<em>" + ($(a).text()) + "</em>";
      } else {
        return $(a).text();
      }
    };

    Transcriber.prototype.fetchText = function(formatter) {
      return $('.question, .answer').map(formatter).toArray().join('<br>\n');
    };

    Transcriber.prototype.transcribe = function(formatter) {
      var text;
      text = this.fetchText(formatter);
      return window.open("data:text/html, " + text);
    };

    return Transcriber;

  })();

}).call(this);
