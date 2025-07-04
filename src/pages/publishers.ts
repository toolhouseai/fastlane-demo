// This file exports the HTML content of the original public/publishers.html as a string
export const publishersHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Publishers</title>
  </head>
  <body>
    <h1>Publishers</h1>
    <ul id="data-list">
      <!-- Data will be loaded here -->
    </ul>
    <!-- The container div for the widget, now with an ID -->
    <div id="turnstile-widget-container"></div>
    <script>
      // This function is called when Turnstile successfully gets a token
      async function onTurnstileSuccess(token) {
        await fetch('/api/publishers', {
          headers: {
            'cf-turnstile-response': token,
            'X-TOOLHOUSE-FASTLANE': 'true',
          },
        })
        .then(function(res) {
          if (!res.ok) {
            throw new Error('Failed to fetch data. Are you a bot?');
          }
          return res.json();
        })
        .then(function(data) {
          var list = document.getElementById('data-list');
          list.innerHTML = data.map(function(item) { return '<li>ID: ' + item.id + ', Wallet: ' + item.wallet + '</li>'; }).join('');
        })
        .catch(function(error) {
          console.error(error);
          document.getElementById('data-list').innerText = error.message;
        });
      }
      // This function will be called by the Turnstile script once it's loaded
      function onloadTurnstileCallback() {
        turnstile.render('#turnstile-widget-container', {
          sitekey: '0x4AAAAAABi4GJ0Jv-QExkpk',
          callback: onTurnstileSuccess,
        });
      }
    </script>
    <!-- The script tag now uses the 'onload' callback parameter -->
    <script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
      defer
    ></script>
  </body>
</html>
`;
