'use strict';

$(function() {

  // API
  var api = 'http://renueva-tu-cocina.lnmclient.com/back/api';
  // var api = 'http://192.168.1.77/works/santacatalina-renueva-tu-cocina/back/api';
  var k = '2a6d8d4c4c795085716c074e52a0a81ba6d236d3';
  var userData = null;



  // --------------------------



  /**
   * Initialize View Object
   *
   * @param {object} options for view
   */
  function View($views) {
    if (!(this instanceof View)) {
      return new View($views);
    }

    this.$views = $views;
  }

  /**
   * Show a view by id
   *
   * @param {string} id - Id of html view
   */
  View.prototype.show = function(id) {
    this.$views.hide();
    $('#' + id).css('display', 'block');
  };


  /**
   * Initialize Request Object
   *
   * @param {string} baseUrl - Base url for request
   */
  function Request(baseUrl) {
    if (!(this instanceof Request)) {
      return new Request(baseUrl);
    }

    this.baseUrl = baseUrl;
  }

  /**
   * Post request
   *
   * @param {string} url - URL for request
   * @param {object} data - The data object for request
   * @param {function} callback - Callback function for response
   */
  Request.prototype.post = function(url, data, callback) {
    $.ajax({
      type: 'post',
      url: this.baseUrl + url,
      data: data,
      success: function(response) {
        callback(response);
      },
      error: function(xhr) {
        callback(JSON.parse(xhr.responseText));
      }
    });
  };

  /**
   * Initialize Application Object
   *
   * @param {object} options for view
   */
  function Application(options) {
    if (!(this instanceof Application)) {
      return new Application(options);
    }

    this.view = new View(options.$views);
    this.request = new Request(options.baseUrl);
  }

  /**
   * Validate enter code
   *
   * @param {object} options
   */
  Application.prototype.validateCode = function(options) {
    this.request.post('/validatecode', {
      dni: options.dni,
      code: options.code,
      token: options.token
    }, options.callback);
  };

  // Start the application
  var myapp = new Application({
    baseUrl: api,
    $views: $('.panel-view')
  });



  // --------------------------



  /*
   * Class *
   * --------
   */
  function Action() {
    $.ajaxSetup({
      headers: {
        'X-API-KEY': k
      }
    });

    this.validateDNI = function() {

      var paramater = {
        'dni': $('#textndni').val()
      };

      userData = null;

      loader();

      // SEND VALIDATE
      $.ajax({
        type: 'post',
        url: api + '/login',
        data: paramater,
        success: function(res) {
          loader('hide');

          if (res.header.success) {
            switch (res.response.status) {
              // Acceso correcto

              case 200:
                userData = res.response;
                $('#r-name').text(userData.data.nombres);
                $('#txtletters').text(userData.chars ? 5 - userData.chars.length : 5);

                showLetterStack(userData.chars, $('#letter-stack-first'), null);

                p.hide();
                myapp.view.show('l-code');
                break;

                // Ya ha participado
              case 404:
                p.hide();
                myapp.view.show('l-msg-loser');
                break;

                // No ha participado aún
              case 401:
                $('#frm-dni').hide();
                $formRegistration.removeAttr('novalidate');
                $('#frm-registration').css('display', 'block');
                myapp.view.show('l-home');
                break;

                // Error de validación
              case 500:
                window.alert(res.response.data);
                break;
            }
          }
        },
        error: function(xhr) {
          var r = JSON.parse(xhr.responseText);
          switch (r.header.success) {
            case false:
              $formDni.hide();
              $formRegistration.show();
              loader('hide');
              break;
          }
        }
      });
    };

    this.add = function() {
      userData = {
        'nombres': $('#textfullname').val(),
        'dni': $('#textndni').val(),
        'email': $('#textmail').val(),
        'telefono': $('#textphone').val(),
        'direccion': $('#textdireccion').val()
      };

      // SEND ADD
      $.ajax({
        type: 'post',
        url: api + '/register',
        data: userData,
        success: function(resp) {
          if (resp.header.success) {
            resp = resp.response;

            $('#r-name').html($('#textfullname').val());
            p.hide();

            $formC.removeAttr('novalidate');
            $('#r-name').text($('#textfullname').val());
            $('#txtletters').text(5 - resp.chars.length);

            userData = {
              auth: resp.auth,
              char: '',
              data: userData
            };

            showLetterStack(resp.chars, $('#letter-stack-first'));

            showPanel('#l-code');
            loader('hide');
          }
        },
        error: function(xhr) {
          var str = JSON.parse(xhr.responseText);
          loader('hide');
          window.alert(str);
        }
      });
    };
  }


  // OBJ
  var objA = new Action();

  // DOM
  var $formDni = $('#frm-dni');
  var $formRegistration = $('#frm-registration');
  var $formC = $('#frm-c');
  var l = $('#layer-m');
  var p = $('#img-p');

  // FORMULARIO DNI
  //
  $formDni.validate({
    rules: {
      textndni: {
        'required': true,
        'number': true,
        'minlength': 8,
      }
    },
    messages: {
      textndni: {
        'required': $.text.validation.required,
        'number': $.text.validation.number,
        'minlength': $.text.validation.minlength,
      },
    },
    highlight: function(element, errorClass) {
      $(element).addClass(errorClass);
    },
    unhighlight: function(element, errorClass) {
      $(element).removeClass(errorClass);
    },
    submitHandler: function() {
      objA.validateDNI();
      return false;
    }

  });

  // FORMULARIO REGISTRO
  //
  $formRegistration.validate({
    rules: {
      textfullname: {
        'required': true
      },
      textmail: {
        'required': true,
        'email': true
      },
      textphone: {
        'required': true,
        'number': true,
      },
      textdireccion: {
        'required': true
      }
    },
    messages: {
      textfullname: {
        'required': $.text.validation.required,
      },
      textmail: {
        'required': $.text.validation.required,
        'email': $.text.validation.requiredEmail
      },
      textphone: {
        'required': $.text.validation.required,
        'number': $.text.validation.number,
      },
      textdireccion: {
        'required': $.text.validation.required
      }
    },
    highlight: function(element, errorClass) {
      $(element).addClass(errorClass);
    },
    unhighlight: function(element, errorClass) {
      $(element).removeClass(errorClass);
    },
    submitHandler: function() {
      loader();
      objA.add();
      return false;
    }
  });

  // VALIDAR CODIGO
  //
  $formC.validate({
    rules: {
      txtcode: {
        'required': true
      }
    },
    messages: {
      txtcode: {
        'required': $.text.validation.requiredCode
      }
    },
    highlight: function(element, errorClass) {
      $(element).addClass(errorClass);
    },
    unhighlight: function(element, errorClass) {
      $(element).removeClass(errorClass);
    },
    submitHandler: function() {
      loader();

      if (userData.winner) {
        myapp.view.show('l-msg-loser');
        loader('hide');
        return;
      }

      // Validate batch code
      myapp.validateCode({
        dni: userData.data.dni,
        code: $('#txtcode').val(),
        token: userData.auth,
        callback: function(res) {
          if (res.response.status === 200) {
            loader('hide');

            res = res.response;

            switch (res.type) {
              // Char
              case 'char':
                var letter = res.data.char.toLowerCase();
                $('#letter').attr('src', 'img/' + letter + '_.png');
                showLetterStack(res.chars, $('#letter-stack-completed'), letter);

                if (res.completed) {
                  myapp.view.show('l-show-letters-completed');
                } else {
                  myapp.view.show('l-show-letters');
                }

                break;

                // Adward
              case 'adward':
                $('#txtwin').text(res.data.toUpperCase());
                myapp.view.show('l-msg-win');
                break;

                // Try it again
              case 'try':
                myapp.view.show('l-msg-loser');
                break;
            }
          } else {

          }
        }
      });

      return false;
    }
  });

  function showLetterStack(chars, $parent, char) {
    var lettersObject = {};
    var letter = {};

    if (chars) {
      for (var i in chars) {
        letter = chars[i];
        lettersObject[letter] = letter;
      }

      if (char) {
        letter = char.toString();
        lettersObject[letter] = letter;
      }

      var lettersArray = [];

      for (i in lettersObject) {
        letter = chars[i];
        lettersArray.push(letter);
      }

      generateLetters(lettersObject, $parent);
    } else {
      var letters = {};
      letters[char] = char;
      generateLetters(letters, $parent);
    }
  }

  function generateLetters(lettersObject, $parent) {
    var $letter, charStr;

    for (var i in lettersObject) {
      charStr = lettersObject[i];
      $letter = $('.letter-' + charStr, $parent);

      if ($letter.length) {
        $letter.attr('src', 'img/' + charStr + '_.png');
      }
    }
  }

  // IR HOME
  //
  $('#btn-win').click(function() {
    showPanel('#l-home');
    p.show();
  });

  function showPanel(s) {
    $('li', l).hide();
    $(s).show();
  }

  function loader(a) {
    if (a === 'hide') {
      $('.loader-p').fadeOut(1000);
    } else {
      $('.loader-p').fadeIn();
    }
  }

});

(function($) {
  $('.loader-p').fadeOut(1000);
}(jQuery));
