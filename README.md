# STS Translator — Render deployment edition

This is the Render-ready version of STS Translator. The frontend and Node.js API run in the same Render web service. Translation requests are forwarded by the backend to a remotely hosted LibreTranslate API, so the browser never calls your local `127.0.0.1:5000` service after deployment.

## Deploy on Render

1. Upload this folder to a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Use build command `npm install` and start command `npm start` (or let Render use `render.yaml`).
4. Set environment variables in Render:
   - `LIBRETRANSLATE_URL` = `https://libretranslate.com`
   - `LIBRETRANSLATE_API_KEY` = your LibreTranslate managed API key from https://portal.libretranslate.com
5. Deploy, then test `https://YOUR-SERVICE.onrender.com/health` and the website itself.

The hosted LibreTranslate service may require an API key and has its own usage limits/terms. Do not commit your API key to GitHub or put it in `index.html`; add it only as a secret environment variable in Render. You can use another LibreTranslate-compatible remote endpoint by changing `LIBRETRANSLATE_URL`.

## Local development

1. Start local LibreTranslate in a separate terminal, for example: `libretranslate --load-only ar,de,en,es,fr,ga,hi,it,ja,ko,pt,ru,zh`
2. In this project folder run `npm start`.
3. Open `http://localhost:3000`.

`PORT` is supplied by Render automatically. The server binds to `0.0.0.0` for public access and exposes `/health` for deployment health checks.

## Notes

- Translation support depends on the models enabled by the remote LibreTranslate instance; a language listed in the UI does not guarantee that every language pair is supported.
- Browser speech recognition is handled by the browser and normally needs HTTPS on a deployed site. Render provides HTTPS for its `onrender.com` service URL.
- The display name is stored locally in the user's browser; it is not a server account.
