// Minimal HTML for lazy-loaded protected content with Turnstile
export const agentsHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Agents</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 2rem;
        background: #f9f9f9;
        color: #222;
      }
      .section {
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 8px #0001;
        margin-bottom: 2rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      #protected-content { display: none; }
    </style>
  </head>
  <body>
    <div id="placeholder" class="section">
      <h2>Protected Content</h2>
      <p>This content is protected. Please complete the CAPTCHA to view it.</p>
    </div>
    <div id="turnstile-widget-container" class="section"></div>
    <div id="protected-content" class="section"></div>
    <script>
      let captchaToken = null;
      async function onTurnstileSuccess(token) {
        console.log('CAPTCHA solved, token:', token);
        captchaToken = token;
        // Fetch the protected content
        const resp = await fetch('/api/get-protected-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cf-turnstile-response': token
          },
          credentials: 'same-origin'
        });
        if (resp.ok) {
          const html = await resp.text();
          document.getElementById('protected-content').innerHTML = html;
          document.getElementById('protected-content').style.display = 'initial';
          document.getElementById('placeholder').style.display = 'none';
          document.getElementById('turnstile-widget-container').style.display = 'none';
        } else {
          alert('CAPTCHA verification failed.');
        }
      }
      function onloadTurnstileCallback() {
        turnstile.render('#turnstile-widget-container', {
          sitekey: '0x4AAAAAABi4GJ0Jv-QExkpk',
          callback: onTurnstileSuccess,
        });
      }
    </script>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback" defer></script>
  </body>
</html>
`;
