class window.duck.Speaking
  constructor: (@duck)->
    @duck.on 'response', @speak_response
  speak_response: (event, options)->
    meSpeak.speak options.next_question, 
      amplitude: 50
      wordgap: 2
      pitch: 60
      speed: 130
      variant: 'm4'
      
    