import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

/* HashRouter puts the page address after a # — /#/classes rather
   than /classes.

   Slightly uglier, and chosen deliberately: a plain path router
   needs the web server configured to send every URL back to
   index.html, or refreshing on /classes returns a 404. A hash
   router needs no server config at all, so this prototype runs
   identically from a local folder, from Netlify, from a shared
   link, or from inside a demo laptop with no internet. For
   something you'll be passing around an organisation, that
   robustness is worth more than a tidy URL.

   Production EduSmart should use BrowserRouter with the server
   rewrite in place. It's a one-word change. */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
