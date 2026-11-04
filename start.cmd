@echo off
cd /d "%~dp0"
if not defined PORT set PORT=4174
echo Open http://localhost:%PORT% in your browser.
node --env-file-if-exists=.env.local server.mjs
pause
