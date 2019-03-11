window.onload = function() {

  if (document.body.classList.contains('option')) {
    // option js

    // read setting and display
    updateSettingView ();

    var savebtn = document.getElementById('save');

    savebtn.addEventListener('click', function() {
      saveOption();
    });

  }

  if (document.body.classList.contains('popup')) {

    // read data from storage
    chrome.storage.local.get(['switch', 'match', 'replace', 'autoip'], function(result) {
      // if no config set default config
      if(JSON.stringify(result) === '{}') {
        window.getLocalIP(function (ip) {
          chrome.storage.local.set({
            autoip: '0',
            match: ['localhost', '0.0.0.0', '127.0.0.1', 'lh'],
            replace: ip,
            switch: '1'
          }, function (result) {
            document.location.reload(true);
          });
        });
      }

      var showarea = document.getElementById('qrarea'),
            status = document.getElementById('status'),
            generURL;

      // popub js
      chrome.tabs.getSelected(null, function(tab) {
        generURL = tab.url;

        if(Object.getOwnPropertyNames(result).length !== 0 && result.switch == '1') {
          // tab.url filter
          if(result.autoip == '1') {
            // auto replace by auto ip
            window.getLocalIP(function (ip) {
              var generIP = ip;

              result.match.forEach(function (item) {
                generURL = generURL.replace(item, ip);
              });

              generQR(generURL);
            });

          } else if (result.autoip == '0') {
            // else replace by user input rule
            for (var i = 0; i < result.match.length; i++) {
              generURL = generURL.replace(result.match[i], result.replace);
            };
            generQR(generURL);
          }

        } else {
          // if switch if off , just gener qr code
          generQR(generURL);
        }

        function generQR (generURL) {
          var qrcode = new QRCode(showarea, {
              text: "http://liyaodong.com",
              width: 100,
              height: 100,
              colorDark : "#000000",
              colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
          });

          qrcode.makeCode(generURL);

          status.innerHTML = '';

          document.getElementById('nowurl').value = generURL;
        }

      });

    });

    // click generbtn gener new qrcode
    var generbtn = document.getElementById('generqr'),
        showarea = document.getElementById('qrarea'),
        urlinput = document.getElementById('nowurl');

    urlinput.addEventListener("keypress", function() {
        if (event.keyCode == 13) generbtn.click();
    });


    generbtn.addEventListener('click', function() {
      this.innerHTML = 'Generating...';
      showarea.innerHTML = ''; // clean dom

      var generURL = urlinput.value;

      var qrcode = new QRCode(showarea, {
          text: "http://liyaodong.sinaapp.com",
          width: 100,
          height: 100,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
      });


      qrcode.makeCode(generURL);

      this.innerHTML = 'Done';
    });

  }

  // save all option
  function saveOption () {
    var matchInput = document.getElementsByName('matchswitch'),
        matchRuleText = document.getElementById('match').value.trim(),
        matchReplace = document.getElementById('replace').value,
        autoipInput = document.getElementsByName('autoip'),
        autoip = 1,
        matchSwitch = 1,
        matchRule,
        setting;


    matchRule = matchRuleText.split( "\n" );
    matchSwitch = getCheckedInput(matchInput);
    autoip = getCheckedInput(autoipInput);


    setting = {
      'switch': matchSwitch,
      'match': matchRule,
      'replace': matchReplace,
      'autoip': autoip
    }

    chrome.storage.local.set(setting, saveDone);

  }

  function getCheckedInput (inputs) {
    for (var i = 0; i < inputs.length; i++) {
      if(inputs[i].checked) {
        return inputs[i].value;
      }
    };
  }

  function saveDone () {
    var savebtn = document.getElementById('save');
    savebtn.disabled = true;
    savebtn.innerHTML = 'Saved';
  }

  function updateSettingView () {
    // update switdch
    chrome.storage.local.get(['switch', 'match', 'replace', 'autoip'], function(result) {
      if(Object.getOwnPropertyNames(result).length !== 0) {
        updateView (result);
      } else {
        // if doesn't have user data , then auto padding with
        fillRealIP('replace', 'input');
      }

    });
  }

  function fillRealIP (domid, type) {
    window.getLocalIP(function (ip) {
      if(type == 'input') {
        document.getElementById(domid).value = ip;
      } else {
        document.getElementById(domid).innerHTML = ip;
      }
    });
  }

  function updateView (setting) {
    if(setting) {
      // if has setting then update setting view.
      var matchSwitch = document.getElementsByName('matchswitch'),
          autoipInput = document.getElementsByName('autoip');

      for (var i = 0; i < matchSwitch.length; i++) {
        if(matchSwitch[i].value == setting.switch) {
          matchSwitch[i].setAttribute('checked', 'checket');
        } else {
          matchSwitch[i].removeAttribute('checked');
        }
      };

      for (var i = 0; i < autoipInput.length; i++) {
        if(autoipInput[i].value == setting.autoip) {
          autoipInput[i].setAttribute('checked', 'checket');
        } else {
          autoipInput[i].removeAttribute('checked');
        }
      };

      var replaceDom = document.getElementById('replace');

      replaceDom.value = setting.replace;

      var matchDom = document.getElementById('match'),
          matchStr = '';

      setting.match.forEach(function(element) {
        matchStr = matchStr + element + '\n';
      });

      matchDom.innerHTML = matchStr;
    } // if setting end
  }

};
