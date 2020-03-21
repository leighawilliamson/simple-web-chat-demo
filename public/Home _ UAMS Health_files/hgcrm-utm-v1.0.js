(function () {
  'use strict';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else { // `DOMContentLoaded` already fired
    track();
  }

  function track () {
    console.log('HGCRM tracking script v1.0 Loaded');

    // Define EDP tracking variable names.
    var edpTracking = [
      'hgcrm_agency',
      'hgcrm_channel',
      'hgcrm_campaignid',
      'hgcrm_promoted_facility',
      'keyword',
      'matchtype',
      'placement',
      'target',
      'hgcrm_promoted_serviceline',
      'utm_medium',
      'utm_source',
      'utm_content',
      'hgcrm_tacticid',
      'utm_term',
      'hgcrm_trackingsetid',
      'ga_cid', // Google Analytics client ID',
      'hgcrm_source',
      'utm_campaign',
      'hgcrm_campaign_url'
    ];

    // params that dont get appended to external links
    var skipParams = [
      'ga_cid',
      'hgcrm_campaign_url'
    ];

    var date = new Date();
    date.setTime(date.getTime() + 86400000);
    var expires = '; expires=' + date.toUTCString();
    // Detect EDP tracking variables in the URL and store them in cookies.
    if (location && location.search) {
      location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (match, key, value) {
          value = value.toLowerCase().trim();
          if (edpTracking.indexOf(key) > -1 && value.length > 0) {
            document.cookie = 'hg_' + key + '=' + value + expires + '; path=/';
          }
        }
      );
      // Add the current URL to the tracking list.
      document.cookie = 'hg_hgcrm_campaign_url=' + window.location.href + expires + '; path=/';
    }

    /**
    * Appends Google Analytics Client ID to the tracking cookie.
    * Detect the Google Analytics client ID and add it to the tracking list.
    * @see https://stackoverflow.com/questions/20053949/how-to-get-the-google-analytics-client-id#answer-20054201
    **/
    if (typeof ga !== 'undefined' && typeof ga === 'function' && typeof ga.getAll === 'function') {
      var gaData = ga.getAll();
      if (typeof gaData === 'object' && typeof gaData[0] === 'object' && typeof gaData[0].get === 'function') {
        var gaCid = gaData[0].get('clientId');
        if (typeof gaCid === 'string' && gaCid.length > 0) {
          document.cookie = 'hg_ga_cid=' + gaCid + expires + '; path=/';
        }
      }
    }
    // Insert cookied EDP tracking data into hidden form fields.
    if (document.cookie) {
      var query = '';
      var setValue = function (input) {
        input.setAttribute('value', value);
      };
      var cookies;
      var cookieName;
      var edpIndex;
      var value;

      for (edpIndex = 0; edpIndex < edpTracking.length; edpIndex++) {
        value = false;
        cookieName = 'hg_' + edpTracking[edpIndex] + '=';
        cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          while (cookies[i].charAt(0) === ' ') {
            cookies[i] = cookies[i].substring(1, cookies[i].length);
          }
          if (cookies[i].indexOf(cookieName) === 0) {
            value = cookies[i].substring(cookieName.length, cookies[i].length);
          }
        }
        if (value) {
          Array.from(
            document.querySelectorAll('input[name=\'' +
            edpTracking[edpIndex] +
            '\'][type=\'hidden\']')
          ).forEach(setValue);

          if (!skipParams.includes(edpTracking[edpIndex])) {
            query += edpTracking[edpIndex] + '=' + encodeURIComponent(value) + '&';
          }
        }
      }

      // Append cookied EDP tracking data onto external links.
      if (query.length > 0) {
        query = query.substring(0, query.length - 1);
        var links = document.getElementsByTagName('a');
        for (var linkIndex = 0; linkIndex < links.length; linkIndex++) {
          if (links[linkIndex].hostname !== location.hostname && isValidHostname(links[linkIndex].hostname)) {
            links[linkIndex].setAttribute('href',
              links[linkIndex].href +
              ((links[linkIndex].href.indexOf('?') > -1) ? '&' : '?') +
              query
            );
          }
        }
      }
    }
  }

  function isValidHostname (str) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
  }
})();
